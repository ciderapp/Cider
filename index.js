require('v8-compile-cache');
const {app} = require('electron');
const {BrowserWindow} = require("electron-acrylic-window");

// Creating the Application Window and Calling all the Functions
function CreateWindow() {
    if (app.isQuiting) { app.quit(); return; }

    /** CIDER **/
    const ciderwin = require("./resources/functions/cider-base")
    app.win = ciderwin
    app.win.CreateBrowserWindow()
    /** CIDER **/
}


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* App Event Handlers
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

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