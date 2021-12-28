require('v8-compile-cache');
const { app } = require('electron'),
      {resolve} = require("path"),
      CiderBase = require ('./src/main/cider-base');

// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({ dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214" });

// Enable WebGPU and list adapters (EXPERIMENTAL.)
// Note: THIS HAS TO BE BEFORE ANYTHING GETS INITIALIZED.

// const {Init} = require("./src/main/cider-base");
// Init()
CiderBase.Init()

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
    const {Start} = require('./src/main/cider-base')
    Start()
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
        app.isQuiting = true
        app.quit()
    } else if (app.win && !app.cfg.get('advanced.allowMultipleInstances')) { // If a Second Instance has Been Started
        console.warn('[InstanceHandler][SecondInstanceHandler] Showing window.');
        app.win.show()
        app.win.focus()
    }
})

if (!app.requestSingleInstanceLock() && !app.cfg.get('advanced.allowMultipleInstances')) {
    console.warn("[InstanceHandler] Existing Instance is Blocking Second Instance.");
    app.quit();
    app.isQuiting = true
}



  