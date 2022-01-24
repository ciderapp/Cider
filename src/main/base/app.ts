import * as electron from 'electron';
import * as path from 'path';

export class AppEvents {
    private static protocols: any = [
        "ame",
        "cider",
        "itms",
        "itmss",
        "musics",
        "music"
    ]
    private static plugin: any = null;
    private static store: any = null;
    private static win: any = null;

    constructor(store: any) {
        console.log('App started');

        AppEvents.store = store
        AppEvents.start(store);
    }

    /**
     * Handles all actions that occur for the app on start (Mainly commandline arguments)
     * @returns {void}
     */
    private static start(store: any): void {
        console.log('App started');

        /**********************************************************************************************************************
         * Startup arguments handling
         **********************************************************************************************************************/
        if (electron.app.commandLine.hasSwitch('version') || electron.app.commandLine.hasSwitch('v')) {
            console.log(electron.app.getVersion())
            electron.app.exit()
        }

        // Verbose Check
        if (electron.app.commandLine.hasSwitch('verbose')) {
            console.log("[Apple-Music-Electron] User has launched the application with --verbose");
        }

        // Log File Location
        if (electron.app.commandLine.hasSwitch('log') || electron.app.commandLine.hasSwitch('l')) {
            console.log(path.join(electron.app.getPath('userData'), 'logs'))
            electron.app.exit()
        }

        /***********************************************************************************************************************
         * Commandline arguments
         **********************************************************************************************************************/
        switch (store.get("visual.hw_acceleration")) {
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
        console.log('App stopped');
    }

    public ready(plug: any) {
        AppEvents.plugin = plug
        console.log('App ready');
    }

    public bwCreated(win: Electron.BrowserWindow) {
        AppEvents.win = win

        electron.app.on('open-url', (event, url) => {
            event.preventDefault()
            if (AppEvents.protocols.some((protocol: string) => url.includes(protocol))) {
                AppEvents.LinkHandler(url)
                console.log(url)
            }
        })

        AppEvents.InstanceHandler()
    }

    /***********************************************************************************************************************
     * Private methods
     **********************************************************************************************************************/

    private static LinkHandler(arg: string) {
        console.log(arg)

        if (!arg) return;

        // LastFM Auth URL
        if (arg.includes('auth')) {
            let authURI = arg.split('/auth/')[1]
            if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                const authKey = authURI.split('lastfm?token=')[1];
                AppEvents.store.set('lastfm.enabled', true);
                AppEvents.store.set('lastfm.auth_token', authKey);
                AppEvents.win.webContents.send('LastfmAuthenticated', authKey);
                AppEvents.plugin.callPlugin('lastfm', 'authenticate', authKey);
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
                    AppEvents.win.webContents.send('play', value, id)
                    console.debug(`[LinkHandler] Attempting to load ${value} by id: ${id}`)
                }
            }

        } else if (arg.includes('music.apple.com')) { // URL (used with itms/itmss/music/musics uris)
            console.log(arg)
            let url = arg.split('//')[1]
            console.warn(`[LinkHandler] Attempting to load url: ${url}`);
            AppEvents.win.webContents.send('play', 'url', url)
        }
    }

    private static InstanceHandler() {

        // Detects of an existing instance is running (So if the lock has been achieved, no existing instance has been found)
        const gotTheLock = electron.app.requestSingleInstanceLock()

        if (!gotTheLock) { // Runs on the new instance if another instance has been found
            console.log('[Cider] Another instance has been found, quitting.')
            electron.app.quit()
        } else { // Runs on the first instance if no other instance has been found
            electron.app.on('second-instance', (_event, startArgs) => {
                console.log(startArgs)
                if (startArgs.includes("--force-quit")) {
                    console.warn('[InstanceHandler][SecondInstanceHandler] Force Quit found. Quitting App.');
                    electron.app.quit()
                } else if (startArgs.includes("cider://")) {
                    AppEvents.LinkHandler(startArgs.toString())
                } else if (AppEvents.win) {
                    if (AppEvents.win.isMinimized()) AppEvents.win.restore()
                    AppEvents.win.focus()
                }
            })
        }

    }
}