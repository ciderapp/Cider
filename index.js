require('v8-compile-cache');
const {app, session} = require('electron');

// Initialize the Preferences so verbose doesnt fuck up
const appFuncs = require('./resources/functions/app-init');
app.ame = appFuncs()

// Run all the Before App is Ready Stuff
app.ame.init.LoggingInit();
app.ame.handler.LaunchHandler();
app.ame.handler.InstanceHandler();
app.ame.init.BaseInit();
app.ame.wsapi.InitWebSockets()
app.ame.wsapi.InitWebServer()

// Creating the Application Window and Calling all the Functions
function CreateWindow() {
    if (app.isQuiting) { app.quit(); return; }

    app.win = app.ame.win.CreateBrowserWindow() // Create the BrowserWindow
    /** CIDER **/
    const cider = require("./resources/functions/cider-win")
    cider.CreateBrowserWindow()
    /** CIDER **/
    app.ame.handler.WindowStateHandler(); // Handling the Window
    app.ame.handler.PlaybackStateHandler(); // Playback Change Listener
    app.ame.handler.MediaStateHandler(); // Media Change Listener
    app.ame.handler.LyricsHandler(); // Lyrics Handling
    app.ame.handler.AudioHandler(); // Exclusive Audio Stuff
    app.ame.handler.GoogleCastHandler(); // Chromecast
    app.ame.handler.RendererListenerHandlers(); // Renderer Listeners
    app.ame.handler.SettingsHandler(); // Handles updates to settings

    if (process.platform === 'win32' && app.transparency) { app.win.show() } // Show the window so SetThumbarButtons doesnt break
    app.ame.win.SetButtons() // Set Inactive Thumbnail Toolbar Icons or TouchBar
    app.ame.win.SetApplicationMenu()
    app.ame.win.SetTaskList()
    app.ame.utils.checkForUpdates()

    app.ame.win.HandleBrowserWindow();
}


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* App Event Handlers
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.on('ready', () => {
    if (app.isQuiting) { app.quit(); return; }

    // Apple Header tomfoolery.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        if(details.url.match(/^https:\/\/store-\d{3}\.blobstore\.apple\.com/) || details.url.startsWith("https://store-037.blobstore.apple.com")){
        details.responseHeaders['Access-Control-Allow-Origin'] = '*';}
         if(details.url.includes('encoderWorker.umd.js')){
            details.responseHeaders['Content-Type'] = `text/javascript`;
         }
        details.responseHeaders['Content-Security-Policy'] = 'unsafe-inline'
        callback({ responseHeaders: details.responseHeaders })
    })

    const {AppReady} = require('./resources/functions/init')
    AppReady()
    
    console.log('[Apple-Music-Electron] Application is Ready. Creating Window.')
    CreateWindow()
});

// macOS Activate Handler
app.on('activate', () => {
    if (app.win === null) {
        CreateWindow()
    } else {
        app.win.show()
    }
})

app.on('before-quit', () => {
    console.verbose('before-quit');
    app.isQuiting = true;
    app.ame.mpris.clearActivity();
    app.ame.discord.disconnect();
    console.warn('---------------------------------------------------------------------');
    console.warn(`${app.getName()} has closed.`);
    console.warn('---------------------------------------------------------------------');
});

app.on('will-quit', () => { console.verbose('will-quit'); })
app.on('quit', () => { console.verbose('quit'); })
app.on("window-all-closed", () => { console.verbose('window-all-closed'); if (process.platform !== 'darwin') app.quit(); });

// Widevine Stuff
app.on('widevine-ready', (version, lastVersion) => {
    if (null !== lastVersion) {
        console.log('[Apple-Music-Electron][Widevine] Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!')
    } else {
        console.log('[Apple-Music-Electron][Widevine] Widevine ' + version + ' is ready to be used!')
    }
})

app.on('page-title-updated', function(e) {
    e.preventDefault()
});

app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
    console.log('[Apple-Music-Electron][Widevine] Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!')
})

app.on('widevine-error', (error) => {
    console.log('[Apple-Music-Electron][Widevine] Widevine installation encountered an error: ' + error)
    app.exit()
})