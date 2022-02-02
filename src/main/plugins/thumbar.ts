import {nativeImage, nativeTheme} from "electron";
import {utils} from "../base/utils";
import {join} from "path";

export default class Thumbar {
    /**
     * Private variables for interaction in plugins
     */
    private _win: any;
    private _app: any;

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'Thumbnail Toolbar Plugin';
    public description: string = 'Creates and managed the thumbnail toolbar buttons and their events';
    public version: string = '1.0.0';
    public author: string = 'Core';

    /**
     * Thumbnail Toolbar Assets
     */
    private icons: { pause: Electron.NativeImage, play: Electron.NativeImage, next: Electron.NativeImage, previous: Electron.NativeImage } = {
        pause: nativeImage.createFromPath(join(utils.getPath('resourcePath'), 'icons/thumbar', `${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}_pause.png`)).resize({width: 32, height: 32}),
        play: nativeImage.createFromPath(join(utils.getPath('resourcePath'), 'icons/thumbar', `${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}_play.png`)).resize({width: 32, height: 32}),
        next: nativeImage.createFromPath(join(utils.getPath('resourcePath'), 'icons/thumbar', `${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}_next.png`)).resize({width: 32, height: 32}),
        previous: nativeImage.createFromPath(join(utils.getPath('resourcePath'), 'icons/thumbar', `${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}_previous.png`)).resize({width: 32, height: 32}),
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
     * Blocks non-windows systems from running this plugin
     * @private
     * @decorator
     */
    private static windowsOnly(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
        if (process.platform !== 'win32') {
            descriptor.value = function () {
                return
            }
        }
    }

    /**
     * Update the thumbnail toolbar
     */
    @Thumbar.windowsOnly
    private updateButtons(attributes: any) {
        const runMediaEvent = this.runMediaEvent;

        const buttons = [
            {
                tooltip: 'Previous',
                icon: this.icons.previous,
                click() {
                    runMediaEvent('previous')
                }
            },
            {
                tooltip: this._app.media.status ? 'Pause' : 'Play',
                icon: attributes.state ? this.icons.pause : this.icons.play,
                click() {
                    runMediaEvent('playPause')
                }
            },
            {
                tooltip: 'Next',
                icon: this.icons.next,
                click() {
                    runMediaEvent('nextTrack')
                }
            }
        ];

        if (!attributes.playParams || attributes.playParams.id === 'no-id-found') {
            this._win.setThumbarButtons([])
        } else {
            this._win.setThumbarButtons(buttons);
        }
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
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        console.debug(`[Plugin][${this.name}] Stopped.`);
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.state = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {
        this.updateButtons(attributes)
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {
    }

}
