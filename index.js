require('v8-compile-cache');
const { app } = require('electron');

// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({ dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214" });

const configSchema = {
    "general": {
        "close_behavior": 0, // 0 = close, 1 = minimize, 2 = minimize to tray
        "startup_behavior": 0, // 0 = nothing, 1 = open on startup
        "discord_rpc": 1, // 0 = disabled, 1 = enabled as Cider, 2 = enabled as Apple Music
        "discordClearActivityOnPause" : 0, // 0 = disabled, 1 = enabled
        "volume": 1
    },
    "audio": {
        "quality": "extreme",
        "seamless_audio": true
    },
    "visual": {
        "theme": "",
        "scrollbars": 0, // 0 = show on hover, 2 = always hide, 3 = always show
        "refresh_rate": 0,
        "animated_artwork": "always", // 0 = always, 1 = limited, 2 = never
        "animated_artwork_qualityLevel": 1,
        "hw_acceleration": "default", // default, webgpu, disabled
        "window_transparency": "default"
    },
    "lyrics": {
        "enable_mxm": false,
        "mxm_karaoke" : false,
        "mxm_language": "en",
        "enable_yt": false,
    },
    "lastfm": {
        "enabled": true,
        "scrobble_after": 30,
        "auth_token": ""
    }
}

// Enable WebGPU and list adapters (EXPERIMENTAL.)
// Note: THIS HAS TO BE BEFORE ANYTHING GETS INITIALIZED.

const Store = require("electron-store");
app.cfg = new Store({
    defaults: configSchema,
});

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

// Creating the Application Window and Calling all the Functions
function CreateWindow() {
    if (app.isQuiting) { app.quit(); return; }

    /** CIDER **/
    const ciderwin = require("./src/main/cider-base")
    app.win = ciderwin
    app.win.Start()
    /** CIDER **/
}

if (process.platform === "linux") {
    app.commandLine.appendSwitch('disable-features', 'MediaSessionService');
}


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* App Event Handlers
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=1024')

app.on('ready', () => {
    if (app.isQuiting) { app.quit(); return; }
    app.commandLine.appendSwitch('high-dpi-support', 1)
    app.commandLine.appendSwitch('force-device-scale-factor', 1)
    app.commandLine.appendSwitch('disable-pinch');
    
    console.log('[Cider] Application is Ready. Creating Window.')
    if (!app.isPackaged) {
        console.info('[Cider] Running in development mode.')
        require('vue-devtools').install()
    }
    CreateWindow()
});

app.on('before-quit', () => {
    app.isQuiting = true;
    console.warn(`${app.getName()} exited.`);
});

// Widevine Stuff
app.on('widevine-ready', (version, lastVersion) => {
    if (null !== lastVersion) {
        console.log('[Cider][Widevine] Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!')
    } else {
        console.log('[Cider][Widevine] Widevine ' + version + ' is ready to be used!')
    }
})

app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
    console.log('[Cider][Widevine] Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!')
})

app.on('widevine-error', (error) => {
    console.log('[Cider][Widevine] Widevine installation encountered an error: ' + error)
    app.exit()
})