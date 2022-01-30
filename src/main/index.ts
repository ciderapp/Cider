require('v8-compile-cache');

// Analytics for debugging fun yeah.
import * as sentry from '@sentry/electron';
import * as electron from 'electron';
import {Win} from "./base/win";
import {ConfigStore} from "./base/store";
import {AppEvents} from "./base/app";
import PluginHandler from "./base/plugins";

sentry.init({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

const config = new ConfigStore();
const App = new AppEvents(config.store);
const Cider = new Win(electron.app, config.store)
const plug = new PluginHandler(config.store);

let win: Electron.BrowserWindow;

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * App Event Handlers
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

electron.app.on('ready', () => {
    App.ready(plug);

    console.log('[Cider] Application is Ready. Creating Window.')
    if (!electron.app.isPackaged) {
        console.info('[Cider] Running in development mode.')
        require('vue-devtools').install()
    }

    electron.components.whenReady().then(async () => {
        win = await Cider.createWindow()
        App.bwCreated(win);
        /// please dont change this for plugins to get proper and fully initialized Win objects
        plug.callPlugins('onReady', win);
        win.on("ready-to-show", () => {
            win.show();
        });
    });

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

electron.app.on('before-quit', () => {
    plug.callPlugins('onBeforeQuit');
    console.warn(`${electron.app.getName()} exited.`);
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Widevine Event Handlers
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

// @ts-ignore
electron.app.on('widevine-ready', (version, lastVersion) => {
    if (null !== lastVersion) {
        console.log('[Cider][Widevine] Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!')
    } else {
        console.log('[Cider][Widevine] Widevine ' + version + ' is ready to be used!')
    }
})

// @ts-ignore
electron.app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
    console.log('[Cider][Widevine] Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!')
})

// @ts-ignore
electron.app.on('widevine-error', (error) => {
    console.log('[Cider][Widevine] Widevine installation encountered an error: ' + error)
    electron.app.exit()
})
