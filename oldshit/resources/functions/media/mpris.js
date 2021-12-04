const {app} = require('electron'),
    Player = require('mpris-service'),
    {initAnalytics} = require('../utils');
initAnalytics();

// Remember to use playerctl when debugging this.
// I'm just putting this here as I keep forgetting the command.

module.exports = {
    connect: function () {
        if (process.platform !== "linux") {
            app.mpris = {active: false}
            return;
        }
        console.log('[MPRIS][connect] Initializing Connection.')

        try {
            app.mpris = Player({
                name: 'AppleMusic',
                identity: 'Apple Music',
                supportedUriSchemes: [],
                supportedMimeTypes: [],
                supportedInterfaces: ['player']
            });
            app.mpris = Object.assign(app.mpris, { active: false, canQuit: true, canControl: true, canPause: true, canPlay: true, canGoNext: true })
        } catch (err) {
            app.mpris.active = false
            console.error(`[MPRIS][connect] ${err}`)
            return
        }

        let pos_atr = {durationInMillis: 0};
        app.mpris.getPosition = function () {
            const durationInMicro = pos_atr.durationInMillis * 1000;
            const percentage = parseFloat(0) || 0;
            return durationInMicro * percentage;
        }

        app.mpris.active = true

        this.clearActivity()
        this.stateHandler()
    },

    stateHandler: function () {
        app.mpris.on('playpause', async () => {
            app.win.webContents.executeJavaScript('MusicKitInterop.pausePlay()').catch(err => console.error(err))
        });

        app.mpris.on('play', async () => {
            app.win.webContents.executeJavaScript('MusicKitInterop.pausePlay()').catch(err => console.error(err))
        });

        app.mpris.on('pause', async () => {
            app.win.webContents.executeJavaScript('MusicKitInterop.pausePlay()').catch(err => console.error(err))
        });

        app.mpris.on('next', async () => {
            app.win.webContents.executeJavaScript('MusicKitInterop.nextTrack()').catch(err => console.error(err))
        });

        app.mpris.on('previous', async () => {
            app.win.webContents.executeJavaScript('MusicKitInterop.previousTrack()').catch(err => console.error(err))
        });
    },

    updateActivity: function (attributes) {
        if (!app.mpris.active) return;

        console.verbose('[MPRIS][updateActivity] Updating Song Activity.')

        const MetaData = {
            'mpris:trackid': app.mpris.objectPath(`track/${attributes.playParams.id.replace(/[.]+/g, "")}`),
            'mpris:length': attributes.durationInMillis * 1000, // In microseconds
            'mpris:artUrl': (attributes.artwork.url.replace('/{w}x{h}bb', '/512x512bb')).replace('/2000x2000bb', '/35x35bb'),
            'xesam:title': `${attributes.name}`,
            'xesam:album': `${attributes.albumName}`,
            'xesam:artist': [`${attributes.artistName}`,],
            'xesam:genre': attributes.genreNames
        }

        if (app.mpris.metadata["mpris:trackid"] === MetaData["mpris:trackid"]) {
            return
        }

        app.mpris.metadata = MetaData
    },

    updateState: function (attributes) {
        if (!app.mpris.active) return;

        console.verbose('[MPRIS][updateState] Updating Song Playback State.')

        function setPlaybackIfNeeded(status) {
            if (app.mpris.playbackStatus === status) {
                return
            }
            app.mpris.playbackStatus = status;
        }

        switch (attributes.status) {
            case true: // Playing
                setPlaybackIfNeeded('Playing');
                break;
            case false: // Paused
                setPlaybackIfNeeded('Paused');
                break;
            default: // Stopped
                setPlaybackIfNeeded('Stopped');
                break;
        }
    },

    clearActivity: function () {
        if (!app.mpris.active) return;
        app.mpris.metadata = {'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack'}
        app.mpris.playbackStatus = 'Stopped';
    },
}