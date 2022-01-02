"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('v8-compile-cache');
// import { app } from 'electron';
// import { resolve } from 'path';
const electron_1 = require("electron");
const path = require("path");
function createWindow() {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        width: 800,
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "./src/renderer/index.html"));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", () => {
    createWindow();
    electron_1.app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// Analytics for debugging fun yeah.
// const ElectronSentry = require("@sentry/electron");
// ElectronSentry.init({ dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214" });
//
// // const {Init} = require("./src/main/cider-base");
// // Init()
//
// /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// * App Event Handlers
// * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//
// app.on('ready', () => {
//     if (app.isQuiting) { app.quit(); return; }
//
//     console.log('[Cider] Application is Ready. Creating Window.')
//     if (!app.isPackaged) {
//         console.info('[Cider] Running in development mode.')
//         require('vue-devtools').install()
//     }
//
//     // CiderBase.Start()
// });
//
// app.on('before-quit', () => {
//     app.isQuiting = true;
//     console.warn(`${app.getName()} exited.`);
// });
//
// // Widevine Stuff
// app.on('widevine-ready', (version, lastVersion) => {
//     if (null !== lastVersion) {
//         console.log('[Cider][Widevine] Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!')
//     } else {
//         console.log('[Cider][Widevine] Widevine ' + version + ' is ready to be used!')
//     }
// })
//
// app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
//     console.log('[Cider][Widevine] Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!')
// })
//
// app.on('widevine-error', (error) => {
//     console.log('[Cider][Widevine] Widevine installation encountered an error: ' + error)
//     app.exit()
// })
//
// if (process.defaultApp) {
//     if (process.argv.length >= 2) {
//         app.setAsDefaultProtocolClient('cider', process.execPath, [resolve(process.argv[1])])
//         app.setAsDefaultProtocolClient('ame', process.execPath, [resolve(process.argv[1])])
//         app.setAsDefaultProtocolClient('itms', process.execPath, [resolve(process.argv[1])])
//         app.setAsDefaultProtocolClient('itmss', process.execPath, [resolve(process.argv[1])])
//         app.setAsDefaultProtocolClient('musics', process.execPath, [resolve(process.argv[1])])
//         app.setAsDefaultProtocolClient('music', process.execPath, [resolve(process.argv[1])])
//     }
// } else {
//     app.setAsDefaultProtocolClient('cider') // Custom AME Protocol
//     app.setAsDefaultProtocolClient('ame') // Custom AME Protocol
//     app.setAsDefaultProtocolClient('itms') // iTunes HTTP Protocol
//     app.setAsDefaultProtocolClient('itmss') // iTunes HTTPS Protocol
//     app.setAsDefaultProtocolClient('musics') // macOS Client Protocol
//     app.setAsDefaultProtocolClient('music') // macOS Client Protocol
// }
//
// app.on('open-url', (event, url) => {
//     event.preventDefault()
//     if (url.includes('ame://') || url.includes('itms://') || url.includes('itmss://') || url.includes('musics://') || url.includes('music://')) {
//         CiderBase.LinkHandler(url)
//     }
// })
//
// app.on('second-instance', (_e, argv) => {
//     console.warn(`[InstanceHandler][SecondInstanceHandler] Second Instance Started with args: [${argv.join(', ')}]`)
//
//     // Checks if first instance is authorized and if second instance has protocol args
//     argv.forEach((value) => {
//         if (value.includes('ame://') || value.includes('itms://') || value.includes('itmss://') || value.includes('musics://') || value.includes('music://')) {
//             console.warn(`[InstanceHandler][SecondInstanceHandler] Found Protocol!`)
//             CiderBase.LinkHandler(value);
//         }
//     })
//
//     if (argv.includes("--force-quit")) {
//         console.warn('[InstanceHandler][SecondInstanceHandler] Force Quit found. Quitting App.');
//         app.isQuiting = true
//         app.quit()
//     } else if (app.win && !app.cfg.get('advanced.allowMultipleInstances')) { // If a Second Instance has Been Started
//         console.warn('[InstanceHandler][SecondInstanceHandler] Showing window.');
//         app.win.show()
//         app.win.focus()
//     }
// })
//
// if (!app.requestSingleInstanceLock() && !app.cfg.get('advanced.allowMultipleInstances')) {
//     console.warn("[InstanceHandler] Existing Instance is Blocking Second Instance.");
//     app.quit();
//     app.isQuiting = true
// }
//# sourceMappingURL=index.js.map