const electron = require('electron')

console.log('Loaded Preload')

let cache = {playParams: {id: 0}, status: null, remainingTime: 0},
    playbackCache = {status: null, time: Date.now()};

const MusicKitInterop = {
    init: function () {
        MusicKit.getInstance().addEventListener(MusicKit.Events.playbackStateDidChange, () => {
            if (MusicKitInterop.filterTrack(MusicKitInterop.getAttributes(), true, false)) {
                console.log("ayy");
                global.ipcRenderer.send('playbackStateDidChange', MusicKitInterop.getAttributes())
                // if (typeof _plugins != "undefined") {
                //     _plugins.execute("OnPlaybackStateChanged", {Attributes: MusicKitInterop.getAttributes()})
                // }
            }
        });

        MusicKit.getInstance().addEventListener(MusicKit.Events.nowPlayingItemDidChange, () => {
            if (MusicKitInterop.filterTrack(MusicKitInterop.getAttributes(), false, true)) {
                global.ipcRenderer.send('nowPlayingItemDidChange', MusicKitInterop.getAttributes());
            }
        });

        MusicKit.getInstance().addEventListener(MusicKit.Events.authorizationStatusDidChange, () => {
            global.ipcRenderer.send('authorizationStatusDidChange', MusicKit.getInstance().authorizationStatus)
        })

        MusicKit.getInstance().addEventListener(MusicKit.Events.mediaPlaybackError, (e) => {
            console.warn(`[mediaPlaybackError] ${e}`);
        })
    },

    getAttributes: function () {
        const nowPlayingItem = MusicKit.getInstance().nowPlayingItem;
        const isPlayingExport = MusicKit.getInstance().isPlaying;
        const remainingTimeExport = MusicKit.getInstance().currentPlaybackTimeRemaining;
        const attributes = (nowPlayingItem != null ? nowPlayingItem.attributes : {});

        attributes.status = isPlayingExport ?? false;
        attributes.name = attributes?.name ?? 'No Title Found';
        attributes.artwork = attributes?.artwork ?? { url: '' };
        attributes.artwork.url = attributes?.artwork?.url ?? '';
        attributes.playParams = attributes?.playParams ?? { id: 'no-id-found' };
        attributes.playParams.id = attributes?.playParams?.id ?? 'no-id-found';
        attributes.albumName = attributes?.albumName ?? '';
        attributes.artistName = attributes?.artistName ?? '';
        attributes.genreNames = attributes?.genreNames ?? [];
        attributes.remainingTime = remainingTimeExport
            ? remainingTimeExport * 1000
            : 0;
        attributes.durationInMillis = attributes?.durationInMillis ?? 0;
        attributes.startTime = Date.now();
        attributes.endTime = Math.round(
            attributes?.playParams?.id === cache.playParams.id
                ? Date.now() + attributes?.remainingTime
                : attributes?.startTime + attributes?.durationInMillis
        );

        return attributes;
    },

    filterTrack: function (a, playbackCheck, mediaCheck) {
        if (a.title === "No Title Found" || a.playParams.id === "no-id-found") {
            return;
        } else if (mediaCheck && a.playParams.id === cache.playParams.id) {
            return;
        } else if (playbackCheck && a.status === playbackCache.status) {
            return;
        } else if (playbackCheck && !a.status && a.remainingTime === playbackCache.time) { /* Pretty much have to do this to prevent multiple runs when a song starts playing */
            return;
        }
        cache = a;
        if (playbackCheck) playbackCache = {status: a.status, time: a.remainingTime};
        return true;
    },

    pausePlay: function () {
        if (MusicKit.getInstance().isPlaying) {
            MusicKit.getInstance().pause();
        } else if (MusicKit.getInstance().nowPlayingItem != null) {
            MusicKit.getInstance().play().then(r => console.log(`[MusicKitInterop] Playing ${r}`));
        }
    },

    nextTrack: function () {
        MusicKit.getInstance().skipToNextItem().then(r => console.log(`[MusicKitInterop] Skipping to Next ${r}`));
    },

    previousTrack: function () {
        MusicKit.getInstance().skipToPreviousItem().then(r => console.log(`[MusicKitInterop] Skipping to Previous ${r}`));
    }

}


process.once('loaded', () => {
    console.log("Setting ipcRenderer")
    global.ipcRenderer = electron.ipcRenderer;
    global.MusicKitInterop = MusicKitInterop;
});