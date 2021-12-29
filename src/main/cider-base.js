const lastfm = require('./plugins/lastfm');
const win = require('./base/win')

// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
const {app} = require("electron");
ElectronSentry.init({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

module.exports = {

    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
    * Starts the application (called on on-ready). - Starts BrowserWindow and WebServer
    */
    Start() {
        app.win = win.createBrowserWindow()
    },

    /**
     * Initializes the main application (run before on-ready)
     */
    async Init() {
        // Initialize the config.
        const {init} = require("./base/store");
        await init()

        //-------------------------------------------------------------------------------
        // Append Commandline Arguments
        //-------------------------------------------------------------------------------

        // Hardware Acceleration
        // Enable WebGPU and list adapters (EXPERIMENTAL.)
        // Note: THIS HAS TO BE BEFORE ANYTHING GETS INITIALIZED.
        switch (app.cfg.get("visual.hw_acceleration")) {
            default:
            case "default":

                break;
            case "webgpu":
                console.info("WebGPU is enabled.");
                app.commandLine.appendSwitch('enable-unsafe-webgpu')
                break;
            case "disabled":
                console.info("Hardware acceleration is disabled.");
                app.commandLine.appendSwitch('disable-gpu')
                break;
        }

        if (process.platform === "linux") {
            app.commandLine.appendSwitch('disable-features', 'MediaSessionService');
        }

        app.commandLine.appendSwitch('high-dpi-support', 'true');
        app.commandLine.appendSwitch('force-device-scale-factor', '1');
        app.commandLine.appendSwitch('disable-pinch');
        app.commandLine.appendSwitch('js-flags', '--max-old-space-size=1024')
    },

    /**
    * Handles all links being opened in the application.
     */
    LinkHandler(startArgs) {
        if (!startArgs) return;
        console.log("lfmtoken", String(startArgs))
        if (String(startArgs).includes('auth')) {
            let authURI = String(startArgs).split('/auth/')[1]
            if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                const authKey = authURI.split('lastfm?token=')[1];
                app.cfg.set('lastfm.enabled', true);
                app.cfg.set('lastfm.auth_token', authKey);
                app.win.webContents.send('LastfmAuthenticated', authKey);
                lastfm.authenticate()
            }
        } else {
            const formattedSongID = startArgs.replace('ame://', '').replace('/', '');
            console.warn(`[LinkHandler] Attempting to load song id: ${formattedSongID}`);

            // setQueue can be done with album, song, url, playlist id
            this.win.webContents.executeJavaScript(`
                MusicKit.getInstance().setQueue({ song: '${formattedSongID}'}).then(function(queue) {
                    MusicKit.getInstance().play();
                });
            `).catch((err) => console.error(err));
        }

    },
}