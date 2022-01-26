// @ts-ignore
import * as Player from 'mpris-service';

export default class MPRIS {
    /**
     * Private variables for interaction in plugins
     */
    private _win: any;
    private _app: any;

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
    private mpris: any;
    private mprisEvents: Object = {
        "playpause": "pausePlay",
        "play": "pausePlay",
        "pause": "pausePlay",
        "next": "nextTrack",
        "previous": "previousTrack",
    }

    /*******************************************************************************************
     * Private Methods
     * ****************************************************************************************/

    /**
     * Runs a media event
     * @param type - pausePlay, nextTrack, PreviousTrack
     * @private
     */
    private runMediaEvent(type: string) {
        if (this._win) {
            this._win.webContents.executeJavaScript(`MusicKitInterop.${type}()`).catch(console.error)
        }
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
    @MPRIS.linuxOnly
    private connect() {
        this.mpris = Player({
            name: 'Cider',
            identity: 'Cider',
            supportedUriSchemes: [],
            supportedMimeTypes: [],
            supportedInterfaces: ['player']
        });
        this.mpris = Object.assign(this.mpris, {
            canQuit: true,
            canControl: true,
            canPause: true,
            canPlay: true,
            canGoNext: true,
            active: true
        })


        const pos_atr = {durationInMillis: 0};
        this.mpris.getPosition = function () {
            const durationInMicro = pos_atr.durationInMillis * 1000;
            const percentage = parseFloat("0") || 0;
            return durationInMicro * percentage;
        }

        for (const [key, value] of Object.entries(this.mprisEvents)) {
            this.mpris.on(key, () => {
                this.runMediaEvent(value)
            });
        }
    }

    /**
     * Update MPRIS Player Attributes
     */
    @MPRIS.linuxOnly
    private updatePlayer(attributes: any) {

        const MetaData = {
            'mpris:trackid': this.mpris.objectPath(`track/${attributes.playParams.id.replace(/[.]+/g, "")}`),
            'mpris:length': attributes.durationInMillis * 1000, // In microseconds
            'mpris:artUrl': (attributes.artwork.url.replace('/{w}x{h}bb', '/512x512bb')).replace('/2000x2000bb', '/35x35bb'),
            'xesam:title': `${attributes.name}`,
            'xesam:album': `${attributes.albumName}`,
            'xesam:artist': [`${attributes.artistName}`,],
            'xesam:genre': attributes.genreNames
        }

        if (this.mpris.metadata["mpris:trackid"] === MetaData["mpris:trackid"]) {
            return
        }

        this.mpris.metadata = MetaData

    }

    /**
     * Update MPRIS Player State
     * @private
     * @param attributes
     */
    @MPRIS.linuxOnly
    private updatePlayerState(attributes: any) {

        let status = 'Stopped';
        if (attributes.status) {
            status = 'Playing';
        } else if (attributes.status === false) {
            status = 'Paused';
        }

        if (this.mpris.playbackStatus === status) {
            return
        }
        this.mpris.playbackStatus = status;
    }

    /**
     * Clear state
     * @private
     */
    private clearState() {
        this.mpris.metadata = {'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack'}
        this.mpris.playbackStatus = 'Stopped';
    }


    /*******************************************************************************************
     * Public Methods
     * ****************************************************************************************/

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(app: any, _store: any) {
        this._app = app;
        console.debug(`[Plugin][${this.name}] Loading Complete.`);
    }

    /**
     * Runs on app ready
     */
    onReady(win: any): void {
        this._win = win;
        console.debug(`[Plugin][${this.name}] Ready.`);
        this.connect()
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        console.debug(`[Plugin][${this.name}] Stopped.`);
        this.clearState()
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.state = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {
        this.updatePlayerState(attributes)
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {
        this.updatePlayer(attributes);
    }

}
