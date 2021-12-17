require('v8-compile-cache');
const {app} = require('electron');

// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

// Creating the Application Window and Calling all the Functions
function CreateWindow() {
    if (app.isQuiting) { app.quit(); return; }

    // store
    const Store = require("electron-store");
    app.cfg = new Store({
        defaults: {volume: 1},
    });

    /** CIDER **/
    const ciderwin = require("./resources/functions/cider-base")
    app.win = ciderwin
    app.win.CreateBrowserWindow()
    /** CIDER **/
}


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* App Event Handlers
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=1024')

app.on('ready', () => {
    if (app.isQuiting) { app.quit(); return; }
    console.log('[Cider] Application is Ready. Creating Window.')
    CreateWindow()
});

app.on('before-quit', () => {
    app.isQuiting = true;
    console.warn('---------------------------------------------------------------------');
    console.warn(`${app.getName()} has closed.`);
    console.warn('---------------------------------------------------------------------');
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