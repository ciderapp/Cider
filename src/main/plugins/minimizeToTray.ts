import * as electron from 'electron';
import * as path from 'path';


export default class MinimizeToTray {
    /**
     * Private variables for interaction in plugins
     */
    private _win: any;
    private _app: any;
    private _store: any;
    private _tray: any;
    private _forceQuit = false;

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'Minimize to tray';
    public description: string = 'Allow Cider to minimize to tray';
    public version: string = '1.0.0';
    public author: string = 'vapormusic';

    constructor(app: any, store: any) {
        this._app = app;
        this._store = store;
    }

    private SetContextMenu(visibility : any) {
        let self = this
        if (visibility) {
            this._tray.setContextMenu(electron.Menu.buildFromTemplate([
                // {
                //     label: 'Check for Updates',
                //     click: function () {
                //         app.ame.utils.checkForUpdates(true)
                //     }
                // },
                {
                    label: 'Minimize to Tray',
                    click: function () {
                        if (typeof self._win.hide === 'function') {
                            self._win.hide();
                            self.SetContextMenu(false);
                        }
                    }
                },
                {
                    label: 'Quit',
                    click: function () {
                        self._forceQuit = true; self._app.quit();
                    }
                }
            ]));
        } else {
            this._tray.setContextMenu(electron.Menu.buildFromTemplate([
                // {
                //     label: 'Check for Updates',
                //     click: function () {
                //         this._app.ame.utils.checkForUpdates(true)
                //     }
                // },
                {
                    label: `Show ${electron.app.getName()}`,
                    click: function () {
                        if (typeof self._win.show === 'function') {
                            self._win.show();
                            self.SetContextMenu(true);
                        }
                    }
                },
                {
                    label: 'Quit',
                    click: function () {
                        self._forceQuit = true; self._app.quit();
                    }
                }
            ]));
        }
        return true

    }

    /**
     * Runs on app ready
     */
    onReady(win: any): void {
        this._win = win;
        const winTray = electron.nativeImage.createFromPath(path.join(__dirname, `../../resources/icons/icon.ico`)).resize({
            width: 32,
            height: 32
        })
        const macTray = electron.nativeImage.createFromPath(path.join(__dirname, `../../resources/icons/icon.png`)).resize({
            width: 20,
            height: 20
        })
        const linuxTray = electron.nativeImage.createFromPath(path.join(__dirname, `../../resources/icons/icon.png`)).resize({
            width: 32,
            height: 32
        })
        let trayIcon : any ;
        if (process.platform === "win32") {
            trayIcon = winTray
        } else if (process.platform === "linux") {
            trayIcon = linuxTray
        } else if (process.platform === "darwin") {
            trayIcon = macTray
        }

        this._tray = new electron.Tray(trayIcon)
        this._tray.setToolTip(this._app.getName());
        this.SetContextMenu(true);

        this._tray.on('double-click', () => {
            if (typeof this._win.show === 'function') {
                if (this._win.isVisible()) {
                    this._win.focus()
                } else {
                    this._win.show()
                }
            }
        }) 
        electron.ipcMain.on("minimizeTray", (event, value) => {
            // listen for close event
            this._win.hide();
            this.SetContextMenu(false);
        });  
        electron.ipcMain.handle("update-store-mtt", (event, value) => {
            this._store.general["close_behavior"] = value;
        }) 
        this._win.on("close", (e :any) => {
            if (this._forceQuit || this._store.general["close_behavior"] == '0'  ) {
                this._app.quit();
            } else if (this._store.general["close_behavior"] == '1') {
                e.preventDefault();
                this._win.minimize();
            } else {
                e.preventDefault();
                this._win.hide();
                this.SetContextMenu(false);
            }
        }); 
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {

    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.state = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {
    }

}
