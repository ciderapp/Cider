require('v8-compile-cache');

// Analytics for debugging fun yeah.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

import * as electron from 'electron';
import {Win} from "./base/win";
import {ConfigStore} from "./base/store";
import {AppEvents} from "./base/app";
import PluginHandler from "./base/plugins";

// const test = new PluginHandler();
const config = new ConfigStore();
const App = new AppEvents(config.store);
const Cider = new Win(electron.app, config.store)
const plug = new PluginHandler();

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* App Event Handlers
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

electron.app.on('ready', () => {
    App.ready();

    console.log('[Cider] Application is Ready. Creating Window.')
    if (!electron.app.isPackaged) {
        console.info('[Cider] Running in development mode.')
        require('vue-devtools').install()
    }

    electron.components.whenReady().then(async () => {
        await Cider.createWindow()
        plug.callPlugins('onReady', Cider);        
    })
    

});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Renderer Event Handlers
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

electron.ipcMain.on('playbackStateDidChange', (event, attributes) => {
    plug.callPlugins('onPlaybackStateDidChange', attributes);
});

electron.ipcMain.on('nowPlayingItemDidChange', (event, attributes) => {
    plug.callPlugins('onNowPlayingItemDidChange', attributes);
});

//
electron.app.on('before-quit', () => {
    plug.callPlugins('onBeforeQuit');
    console.warn(`${electron.app.getName()} exited.`);
});
//
// // @ts-ignore
// // Widevine Stuff
// electron.app.on('widevine-ready', (version, lastVersion) => {
//     if (null !== lastVersion) {
//         console.log('[Cider][Widevine] Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!')
//     } else {
//         console.log('[Cider][Widevine] Widevine ' + version + ' is ready to be used!')
//     }
// })

// // @ts-ignore
// electron.app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
//     console.log('[Cider][Widevine] Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!')
// })

// // @ts-ignore
// electron.app.on('widevine-error', (error) => {
//     console.log('[Cider][Widevine] Widevine installation encountered an error: ' + error)
//     electron.app.exit()
// })

//
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
