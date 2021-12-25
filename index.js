require('v8-compile-cache');
const {app} = require('electron');

// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

// Enable WebGPU and list adapters (EXPERIMENTAL.)
app.commandLine.appendSwitch('enable-unsafe-webgpu');

const configSchema = {
    "general": {
        "close_behavior": {
            type: "number",
            default: 0
        },
        "startup_behavior": {
            type: "number",
            default: 0
        },
        "discord_rpc": {
            type: "number",
            default: 1
        },
    },
    "behavior": {
        "hw_acceleration": {
            type: "number",
            default: 0 // 0 = default, 1 = webgpu, 2 = gpu disabled
        }
    },
    "audio": {
        "quality": {
            type: "string",
            default: "extreme",
        },
        "seamless_audio": {
            type: "boolean",
            default: true,
        }
    },
    "visual": {
        "theme": {
            type: "string",
            default: ""
        },
        "scrollbars": {
            type: "number",
            default: 0
        },
        "refresh_rate": {
            type: "number",
            default: 0
        },
        "animated_artwork": {
            type: "number",
            default: 0 // 0 = always, 1 = limited, 2 = never
        }
    },
    "lyrics": {
        "enable_mxm": {
            type: "boolean",
            default: false
        },
        "mxm_language": {
            type: "string",
            default: "en"
        }
    },
    "lastfm": {
        "enabled": {
            type: "boolean",
            default: false
        },
        "scrobble_after": {
            type: "number",
            default: 30
        },
        "auth_token": {
            type: "string",
            default: ""
        }
    }
}


// Creating the Application Window and Calling all the Functions
function CreateWindow() {
    if (app.isQuiting) { app.quit(); return; }

    // store
    const Store = require("electron-store");
    app.cfg = new Store({
        defaults: {volume: 1},
    });

    /** CIDER **/
    const ciderwin = require("./src/main/cider-base")
    app.win = ciderwin
    app.win.Start()
    /** CIDER **/
}


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* App Event Handlers
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=1024')

app.on('ready', () => {
    if (app.isQuiting) { app.quit(); return; }
    console.log('[Cider] Application is Ready. Creating Window.')
    if(!app.isPackaged) {
        console.info('[Cider] Running in development mode.')
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