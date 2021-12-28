require('v8-compile-cache');
const { app } = require('electron'),
      {resolve} = require("path"),
      CiderBase = require ('./src/main/cider-base');

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
        "enabled": false,
        "scrobble_after": 30,
        "auth_token": "",
        "enabledRemoveFeaturingArtists" : true,
        "NowPlaying": "true"
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

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('cider', process.execPath, [resolve(process.argv[1])])
        app.setAsDefaultProtocolClient('ame', process.execPath, [resolve(process.argv[1])])
        app.setAsDefaultProtocolClient('itms', process.execPath, [resolve(process.argv[1])])
        app.setAsDefaultProtocolClient('itmss', process.execPath, [resolve(process.argv[1])])
        app.setAsDefaultProtocolClient('musics', process.execPath, [resolve(process.argv[1])])
        app.setAsDefaultProtocolClient('music', process.execPath, [resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('cider') // Custom AME Protocol
    app.setAsDefaultProtocolClient('ame') // Custom AME Protocol
    app.setAsDefaultProtocolClient('itms') // iTunes HTTP Protocol
    app.setAsDefaultProtocolClient('itmss') // iTunes HTTPS Protocol
    app.setAsDefaultProtocolClient('musics') // macOS Client Protocol
    app.setAsDefaultProtocolClient('music') // macOS Client Protocol
}

app.on('open-url', (event, url) => {
    event.preventDefault()
    if (url.includes('ame://') || url.includes('itms://') || url.includes('itmss://') || url.includes('musics://') || url.includes('music://')) {
        CiderBase.LinkHandler(url)
    }
})

app.on('second-instance', (_e, argv) => {
    console.warn(`[InstanceHandler][SecondInstanceHandler] Second Instance Started with args: [${argv.join(', ')}]`)

    // Checks if first instance is authorized and if second instance has protocol args
    argv.forEach((value) => {
        if (value.includes('ame://') || value.includes('itms://') || value.includes('itmss://') || value.includes('musics://') || value.includes('music://')) {
            console.warn(`[InstanceHandler][SecondInstanceHandler] Found Protocol!`)
            CiderBase.LinkHandler(value);
        }
    })

    if (argv.includes("--force-quit")) {
        console.warn('[InstanceHandler][SecondInstanceHandler] Force Quit found. Quitting App.');
        // app.isQuiting = true
        app.quit()
    } else if (CiderBase.win && true) { // If a Second Instance has Been Started
        console.warn('[InstanceHandler][SecondInstanceHandler] Showing window.');
        app.win.show()
        app.win.focus()
    }
})

if (!app.requestSingleInstanceLock() && true) {
    console.warn("[InstanceHandler] Existing Instance is Blocking Second Instance.");
    app.quit();
   // app.isQuiting = true
}


  