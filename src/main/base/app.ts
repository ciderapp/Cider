import * as electron from 'electron';
import * as path from 'path';

export class AppEvents {
    private protocols: string[] = [
        "ame",
        "cider",
        "itms",
        "itmss",
        "musics",
        "music"
    ]
    private plugin: any = undefined;
    private store: any = undefined;
    private win: any = undefined;
    private tray: any = undefined;

    constructor(store: any) {
        this.store = store
        this.start(store);
    }

    /**
     * Handles all actions that occur for the app on start (Mainly commandline arguments)
     * @returns {void}
     */
    private start(store: any): void {
        console.info('[AppEvents] App started');

        /**********************************************************************************************************************
         * Startup arguments handling
         **********************************************************************************************************************/
        if (electron.app.commandLine.hasSwitch('version') || electron.app.commandLine.hasSwitch('v')) {
            console.log(electron.app.getVersion())
            electron.app.exit()
        }

        // Verbose Check
        if (electron.app.commandLine.hasSwitch('verbose')) {
            console.log("[Cider] User has launched the application with --verbose");
        }

        // Log File Location
        if (electron.app.commandLine.hasSwitch('log') || electron.app.commandLine.hasSwitch('l')) {
            console.log(path.join(electron.app.getPath('userData'), 'logs'))
            electron.app.exit()
        }

        // Expose GC
        electron.app.commandLine.appendSwitch('js-flags', '--expose_gc')

        if (process.platform === "win32") {
            electron.app.setAppUserModelId(electron.app.getName()) // For notification name
        }

        /***********************************************************************************************************************
         * Commandline arguments
         **********************************************************************************************************************/
        switch (store.visual.hw_acceleration) {
            default:
            case "default":
                electron.app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode')
                electron.app.commandLine.appendSwitch('enable-accelerated-video')
                electron.app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds')
                electron.app.commandLine.appendSwitch('ignore-gpu-blacklist')
                electron.app.commandLine.appendSwitch('enable-native-gpu-memory-buffers')
                electron.app.commandLine.appendSwitch('enable-accelerated-video-decode');
                electron.app.commandLine.appendSwitch('enable-gpu-rasterization');
                electron.app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
                electron.app.commandLine.appendSwitch('enable-oop-rasterization');
                break;

            case "webgpu":
                console.info("WebGPU is enabled.");
                electron.app.commandLine.appendSwitch('enable-unsafe-webgpu')
                break;

            case "disabled":
                console.info("Hardware acceleration is disabled.");
                electron.app.commandLine.appendSwitch('disable-gpu')
                break;
        }

        if (process.platform === "linux") {
            electron.app.commandLine.appendSwitch('disable-features', 'MediaSessionService');
        }

        /***********************************************************************************************************************
         * Protocols
         **********************************************************************************************************************/
        if (process.defaultApp) {
            if (process.argv.length >= 2) {
                this.protocols.forEach((protocol: string) => {
                    electron.app.setAsDefaultProtocolClient(protocol, process.execPath, [path.resolve(process.argv[1])])
                })
            }
        } else {
            this.protocols.forEach((protocol: string) => {
                electron.app.setAsDefaultProtocolClient(protocol)
            })
        }


    }

    public quit() {
        console.log('[AppEvents] App quit');
    }

    public ready(plug: any) {
        this.plugin = plug
        console.log('[AppEvents] App ready');
    }

    public bwCreated(win: Electron.BrowserWindow) {
        this.win = win

        electron.app.on('open-url', (event, url) => {
            event.preventDefault()
            if (this.protocols.some((protocol: string) => url.includes(protocol))) {
                this.LinkHandler(url)
                console.log(url)
            }
        })

        this.InstanceHandler()
        this.InitTray()
    }

    /***********************************************************************************************************************
     * Private methods
     **********************************************************************************************************************/

    /**
     * Handles links (URI) and protocols for the application
     * @param arg
     */
    private LinkHandler(arg: string) {
        if (!arg) return;

        // LastFM Auth URL
        if (arg.includes('auth')) {
            let authURI = arg.split('/auth/')[1]
            if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                const authKey = authURI.split('lastfm?token=')[1];
                this.store.set('lastfm.enabled', true);
                this.store.set('lastfm.auth_token', authKey);
                this.win.webContents.send('LastfmAuthenticated', authKey);
                this.plugin.callPlugin('lastfm', 'authenticate', authKey);
            }
        }
        // Play
        else if (arg.includes('/play/')) { //Steer away from protocol:// specific conditionals
            const playParam = arg.split('/play/')[1]

            const mediaType = {
                "s/": "song",
                "a/": "album",
                "p/": "playlist"
            }

            for (const [key, value] of Object.entries(mediaType)) {
                if (playParam.includes(key)) {
                    const id = playParam.split(key)[1]
                    this.win.webContents.send('play', value, id)
                    console.debug(`[LinkHandler] Attempting to load ${value} by id: ${id}`)
                }
            }

        } else if (arg.includes('music.apple.com')) { // URL (used with itms/itmss/music/musics uris)
            console.log(arg)
            let url = arg.split('//')[1]
            console.warn(`[LinkHandler] Attempting to load url: ${url}`);
            this.win.webContents.send('play', 'url', url)
        }
    }

    /**
     * Handles the creation of a new instance of the app
     */
    private InstanceHandler() {

        // Detects of an existing instance is running (So if the lock has been achieved, no existing instance has been found)
        const gotTheLock = electron.app.requestSingleInstanceLock()

        if (!gotTheLock) { // Runs on the new instance if another instance has been found
            console.log('[Cider] Another instance has been found, quitting.')
            electron.app.quit()
        } else { // Runs on the first instance if no other instance has been found
            electron.app.on('second-instance', (_event, startArgs) => {
                console.log("[InstanceHandler] (second-instance) Instance started with " + startArgs.toString())

                startArgs.forEach(arg => {
                    console.log(arg)
                    if (arg.includes("cider://")) {
                        console.debug('[InstanceHandler] (second-instance) Link detected with ' + arg)
                        this.LinkHandler(arg)
                    } else if (arg.includes("--force-quit")) {
                        console.warn('[InstanceHandler] (second-instance) Force Quit found. Quitting App.');
                        electron.app.quit()
                    } else if (this.win) {
                        if (this.win.isMinimized()) this.win.restore()
                        this.win.focus()
                    }
                })
            })
        }

    }

    /**
     * Initializes the applications tray
     */
    private InitTray() {
        const icons = {
            "win32": electron.nativeImage.createFromPath(path.join(__dirname, `../../resources/icons/icon.ico`)).resize({
                width: 32,
                height: 32
            }),
            "linux": electron.nativeImage.createFromPath(path.join(__dirname, `../../resources/icons/icon.png`)).resize({
                width: 32,
                height: 32
            }),
            "darwin": electron.nativeImage.createFromPath(path.join(__dirname, `../../resources/icons/icon.png`)).resize({
                width: 20,
                height: 20
            }),
        }

        this.tray = new electron.Tray(process.platform === 'win32' ? icons.win32 : (process.platform === 'darwin' ? icons.darwin : icons.linux))
        this.tray.setToolTip(electron.app.getName())
        this.setTray(false)

        this.tray.on('double-click', () => {
            if (this.win) {
                if (this.win.isVisible()) {
                    this.win.focus()
                } else {
                    this.win.show()
                }
            }
        })

        this.win.on('show', () => {
            this.setTray(true)
        })

        this.win.on('restore', () => {
            this.setTray(true)
        })

        this.win.on('hide', () => {
            this.setTray(false)
        })

        this.win.on('minimize', () => {
            this.setTray(false)
        })
    }

    /**
     * Sets the tray context menu to a given state
     * @param visible - BrowserWindow Visibility
     */
    private setTray(visible: boolean = this.win.isVisible()) {

        const menu = electron.Menu.buildFromTemplate([
            {
                label: (visible ? 'Minimize to Tray' : `Show ${electron.app.getName()}`),
                click: () => {
                    if (this.win) {
                        if (visible) {
                            this.win.hide()
                        } else {
                            this.win.show()
                        }
                    }
                }
            },
            {
                label: 'Quit',
                click: () => {
                    electron.app.quit()
                }
            }
        ])
        this.tray.setContextMenu(menu)
    }
}
