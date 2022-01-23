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

    private static store: any = null;

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

        electron.app.on('open-url', (event, url) => {
            event.preventDefault()
            if (this.protocols.some((protocol: string) => url.includes(protocol))) {
                AppEvents.LinkHandler(url)
            }
        })
    }

    public quit() {
        console.log('App stopped');
    }

    public ready() {
        console.log('App ready');
    }

    /***********************************************************************************************************************
     * Private methods
     **********************************************************************************************************************/

    private static LinkHandler(arg: string) {
        if (!arg) return;

        // LastFM Auth URL
        if (arg.includes('auth')) {
            let authURI = String(arg).split('/auth/')[1]
            if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                const authKey = authURI.split('lastfm?token=')[1];
                AppEvents.store.set('lastfm.enabled', true);
                AppEvents.store.set('lastfm.auth_token', authKey);
                // AppEvents.window.webContents.send('LastfmAuthenticated', authKey);
                // lastfm.authenticate()
            }
        }
        // Play
        else if (arg.includes('/play/')) { //Steer away from protocol:// specific conditionals
            const playParam = arg.split('/play/')[1]
            if (playParam.includes('s/')) { // song
                console.log(playParam)
                let song = playParam.split('s/')[1]
                console.warn(`[LinkHandler] Attempting to load song by id: ${song}`);
                electron.ipcRenderer.send('play', 'song', song)
            } else if (playParam.includes('a/')) { // album
                console.log(playParam)
                let album = playParam.split('a/')[1]
                console.warn(`[LinkHandler] Attempting to load album by id: ${album}`);
                electron.ipcRenderer.send('play', 'album', album)
            } else if (playParam.includes('p/')) { // playlist
                console.log(playParam)
                let playlist = playParam.split('p/')[1]
                console.warn(`[LinkHandler] Attempting to load playlist by id: ${playlist}`);
                electron.ipcRenderer.send('play', 'playlist', playlist)
            }
        } else if (arg.includes('music.apple.com')) { // URL (used with itms/itmss/music/musics uris)
                console.log(arg)
                let url = arg.split('//')[1]
                console.warn(`[LinkHandler] Attempting to load url: ${url}`);
                electron.ipcRenderer.send('play', 'url', url)
            }
    }
}