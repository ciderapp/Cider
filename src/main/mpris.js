let mediaPlayer = null;

module.exports = {
    /**
     * Connects to the MPRIS interface.
     * @param {Object} win - The BrowserWindow.
     */
    connect: (win) => {
        if (process.platform !== 'linux') return;

        const Player = require('mpris-service');

        mediaPlayer = Player({
            name: 'Cider',
            identity: 'Cider',
            supportedUriSchemes: [],
            supportedMimeTypes: [],
            supportedInterfaces: ['player']
        });
        mediaPlayer = Object.assign(mediaPlayer, {
            canQuit: true,
            canControl: true,
            canPause: true,
            canPlay: true,
            canGoNext: true
        });

        let pos_atr = { durationInMillis: 0 };
        mediaPlayer.getPosition = function () {
            const durationInMicro = pos_atr.durationInMillis * 1000;
            const percentage = parseFloat('0') || 0;
            return durationInMicro * percentage;
        };

        mediaPlayer.active = true;

        mediaPlayer.on('playpause', async () => {
            win.webContents
                .executeJavaScript('MusicKitInterop.pausePlay()')
                .catch((err) => console.error(err));
        });

        mediaPlayer.on('play', async () => {
            win.webContents
                .executeJavaScript('MusicKitInterop.pausePlay()')
                .catch((err) => console.error(err));
        });

        mediaPlayer.on('pause', async () => {
            win.webContents
                .executeJavaScript('MusicKitInterop.pausePlay()')
                .catch((err) => console.error(err));
        });

        mediaPlayer.on('next', async () => {
            win.webContents
                .executeJavaScript('MusicKitInterop.nextTrack()')
                .catch((err) => console.error(err));
        });

        mediaPlayer.on('previous', async () => {
            win.webContents
                .executeJavaScript('MusicKitInterop.previousTrack()')
                .catch((err) => console.error(err));
        });
    },

    /**
     * Updates the MPRIS interface.
     * @param {Object} attributes - The attributes of the track.
     */
    updateAttributes: (attributes) => {
        if (process.platform !== 'linux') return;

        const MetaData = {
            'mpris:trackid': mediaPlayer.objectPath(
                `track/${attributes.playParams.id.replace(/[.]+/g, '')}`
            ),
            'mpris:length': attributes.durationInMillis * 1000, // In microseconds
            'mpris:artUrl': attributes.artwork.url
                .replace('/{w}x{h}bb', '/512x512bb')
                .replace('/2000x2000bb', '/35x35bb'),
            'xesam:title': `${attributes.name}`,
            'xesam:album': `${attributes.albumName}`,
            'xesam:artist': [`${attributes.artistName}`],
            'xesam:genre': attributes.genreNames
        };

        if (
            mediaPlayer.metadata['mpris:trackid'] === MetaData['mpris:trackid']
        ) {
            return;
        }

        mediaPlayer.metadata = MetaData;
    },

    /**
     * Updates the playback state of the MPRIS interface.
     * @param {Object} attributes - The attributes of the track.
     */
    updateState: (attributes) => {
        if (process.platform !== 'linux') return;

        function setPlaybackIfNeeded(status) {
            if (mediaPlayer.playbackStatus === status) {
                return;
            }
            mediaPlayer.playbackStatus = status;
        }

        switch (attributes.status) {
            case true: // Playing
                setPlaybackIfNeeded('Playing');
                break;
            case false: // Paused
                setPlaybackIfNeeded('Paused');
                break;
            default:
                // Stopped
                setPlaybackIfNeeded('Stopped');
                break;
        }
    },

    /**
     * Closes the MPRIS interface.
     */
    clearActivity: () => {
        if (process.platform !== 'linux') return;
        mediaPlayer.metadata = {
            'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack'
        };
        mediaPlayer.playbackStatus = 'Stopped';
    }
};
