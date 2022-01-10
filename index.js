require('v8-compile-cache');
const {app, components} = require('electron'),
    {resolve, join} = require("path"),
    CiderBase = require('./src/main/cider-base');

const comps = components;


// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

const configDefaults = {
    "general": {
        "close_behavior": 0, // 0 = close, 1 = minimize, 2 = minimize to tray
        "startup_behavior": 0, // 0 = nothing, 1 = open on startup
        "discord_rpc": 1, // 0 = disabled, 1 = enabled as Cider, 2 = enabled as Apple Music
        "discordClearActivityOnPause": 1, // 0 = disabled, 1 = enabled
        "volume": 1
    },
    "home": {
        "followedArtists": [],
        "favoriteItems": []
    },
    "audio": {
        "quality": "990",
        "seamless_audio": true,
        "normalization": false,
        "spatial": false,
        "spatial_properties": {
            "presets": [],
            "gain": 0.8,
            "listener_position": [0, 0, 0],
            "audio_position": [0, 0, 0],
            "room_dimensions": {
                "width": 32,
                "height": 12,
                "depth": 32
            },
            "room_materials": {
                "left": 'metal',
                "right": 'metal',
                "front": 'brick-bare',
                "back": 'brick-bare',
                "down": 'acoustic-ceiling-tiles',
                "up": 'acoustic-ceiling-tiles',
            }
        }
    },
    "visual": {
        "theme": "",
        "scrollbars": 0, // 0 = show on hover, 2 = always hide, 3 = always show
        "refresh_rate": 0,
        "animated_artwork": "limited", // 0 = always, 1 = limited, 2 = never
        "animated_artwork_qualityLevel": 1,
        "bg_artwork_rotation": false,
        "hw_acceleration": "default", // default, webgpu, disabled
        "window_transparency": "disabled"
    },
    "lyrics": {
        "enable_mxm": false,
        "mxm_karaoke": false,
        "mxm_language": "en",
        "enable_yt": false,
    },
    "lastfm": {
        "enabled": false,
        "scrobble_after": 50,
        "auth_token": "",
        "enabledRemoveFeaturingArtists": true,
        "NowPlaying": "true"
    },
    "advanced": {
        "AudioContext": false,
    }
}

const merge = (target, source) => {
    // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]))
    }
    // Join `target` and modified `source`
    Object.assign(target || {}, source)
    return target
}


const Store = require("electron-store");
app.cfg = new Store({
    defaults: configDefaults
});
let currentCfg = app.cfg.get()
app.cfg.set(merge(configDefaults, currentCfg))

app.paths = {
    ciderCache: resolve(app.getPath("userData"), "CiderCache"),
    themes: resolve(app.getPath("userData"), "Themes"),
    plugins: resolve(app.getPath("userData"), "Plugins"),
}

switch (app.cfg.get("visual.hw_acceleration")) {
    default:
    case "default":
        app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode')
        app.commandLine.appendSwitch('enable-accelerated-video')
        app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds')
        app.commandLine.appendSwitch('ignore-gpu-blacklist')
        app.commandLine.appendSwitch('enable-native-gpu-memory-buffers')
        app.commandLine.appendSwitch('enable-accelerated-video-decode');
        app.commandLine.appendSwitch('enable-gpu-rasterization');
        app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
        app.commandLine.appendSwitch('enable-oop-rasterization');
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
    if (app.isQuiting) {
        app.quit();
        return;
    }

    /** CIDER **/
    const ciderwin = require("./src/main/cider-base")
    app.win = ciderwin
    app.win.Start()
    /** CIDER **/
}

if (process.platform === "linux") {
    app.commandLine.appendSwitch('disable-features', 'MediaSessionService');
}

app.commandLine.appendSwitch('no-sandbox');
// app.commandLine.appendSwitch('js-flags', '--max-old-space-size=1024')

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* App Event Handlers
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.whenReady().then(async () => {
    if (process.platform === "win32") {
        app.commandLine.appendSwitch('high-dpi-support', 'true')
        app.commandLine.appendSwitch('force-device-scale-factor', '1')
        app.commandLine.appendSwitch('disable-pinch');
    }
    if (comps == null) {
        app.on("widevine-ready", () => {
            console.log('[Cider] Application is Ready. Creating Window.')
            if (!app.isPackaged) {
                console.info('[Cider] Running in development mode.')
                require('vue-devtools').install()
            }
            CreateWindow()
        })
        return
    }
    await comps.whenReady();
    console.log('components ready:', comps.status());

    console.log('[Cider] Application is Ready. Creating Window.')
    if (!app.isPackaged) {
        console.info('[Cider] Running in development mode.')
        require('vue-devtools').install()
    }
    CreateWindow()
})


app.on('before-quit', () => {
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


  