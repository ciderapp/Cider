// @ts-ignore
import * as Player from 'mpris-service';

export default class mpris {
    /**
     * Private variables for interaction in plugins
     */
    private static utils: any;

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'MPRIS Service';
    public description: string = 'Handles MPRIS service calls for Linux systems.';
    public version: string = '1.0.0';
    public author: string = 'Core';

    /**
     * MPRIS Service
     */
    private static player: Player.Player;
    private static mprisEvents: Object = {
        "playpause": "playPause",
        "play": "play",
        "pause": "pause",
        "next": "next",
        "previous": "previous",
    }

    /*******************************************************************************************
     * Private Methods
     * ****************************************************************************************/

    /**
     * Runs a media event
     * @param type - pausePlay, next, previous
     * @private
     */
    private static runMediaEvent(type: string) {
        // console.debug(`[Plugin][${this.name}] ${type}.`);
        mpris.utils.getWindow().webContents.executeJavaScript(`MusicKitInterop.${type}()`).catch(console.error)
    }

    /**
     * Blocks non-linux systems from running this plugin
     * @private
     * @decorator
     */
    private static linuxOnly(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
        if (process.platform !== 'linux') {
            descriptor.value = function () {
                return
            }
        }
    }


    /**
     * Connects to MPRIS Service
     */
    private static connect() {

        const player = Player({
            name: 'cider',
            identity: 'Cider',
            supportedUriSchemes: [],
            supportedMimeTypes: [],
            supportedInterfaces: ['player']
        });

        console.debug(`[Plugin][${mpris.name}] Successfully connected.`);

        const pos_atr = {durationInMillis: 0};
        player.getPosition = function () {
            const durationInMicro = pos_atr.durationInMillis * 1000;
            const percentage = parseFloat("0") || 0;
            return durationInMicro * percentage;
        }

        for (const [key, value] of Object.entries(mpris.mprisEvents)) {
            player.on(key, function () {
                mpris.runMediaEvent(value)
            });
        }

        player.on('quit', function () {
            process.exit();
        });

        mpris.player = player;
    }

    /**
     * Update M.P.R.I.S Player Attributes
     */
    private static updatePlayer(attributes: any) {

        const MetaData = {
            'mpris:trackid': mpris.player.objectPath(`track/${attributes.playParams.id.replace(/[.]+/g, "")}`),
            'mpris:length': attributes.durationInMillis * 1000, // In microseconds
            'mpris:artUrl': (attributes.artwork.url.replace('/{w}x{h}bb', '/512x512bb')).replace('/2000x2000bb', '/35x35bb'),
            'xesam:title': `${attributes.name}`,
            'xesam:album': `${attributes.albumName}`,
            'xesam:artist': [`${attributes.artistName}`],
            'xesam:genre': attributes.genreNames
        }

        if (mpris.player.metadata["mpris:trackid"] === MetaData["mpris:trackid"]) {
            return
        }

        mpris.player.metadata = MetaData;
    }

    /**
     * Update M.P.R.I.S Player State
     * @private
     * @param attributes
     */
    private static updatePlayerState(attributes: any) {
        switch (attributes.status) {
            case true: // Playing
                mpris.player.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
                break;
            case false: // Paused
                mpris.player.playbackStatus = Player.PLAYBACK_STATUS_PAUSED;
                break;
            default:
                mpris.player.playbackStatus = Player.PLAYBACK_STATUS_STOPPED;
                break
        }
    }

    /**
     * Clear state
     * @private
     */
    private static clearState() {
        if (!mpris.player) {
            return
        }
        mpris.player.metadata = {'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack'}
        mpris.player.playbackStatus = Player.PLAYBACK_STATUS_STOPPED;
    }


    /*******************************************************************************************
     * Public Methods
     * ****************************************************************************************/

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(utils: any) {
        mpris.utils = utils

        console.debug(`[Plugin][${mpris.name}] Loading Complete.`);
    }

    /**
     * Runs on app ready
     */
    @mpris.linuxOnly
    onReady(_: any): void {
        console.debug(`[Plugin][${mpris.name}] Ready.`);
    }

    /**
     * Renderer ready
     */
    @mpris.linuxOnly
    onRendererReady(): void {
        mpris.connect()
    }

    /**
     * Runs on app stop
     */
    @mpris.linuxOnly
    onBeforeQuit(): void {
        console.debug(`[Plugin][${mpris.name}] Stopped.`);
        mpris.clearState()
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.status = current state)
     */
    @mpris.linuxOnly
    onPlaybackStateDidChange(attributes: object): void {
        // console.debug(`[Plugin][${mpris.name}] onPlaybackStateDidChange.`);
        mpris.updatePlayerState(attributes)
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    @mpris.linuxOnly
    onNowPlayingItemDidChange(attributes: object): void {
        // console.debug(`[Plugin][${mpris.name}] onMetadataDidChange.`);
        mpris.updatePlayer(attributes);
    }

}
