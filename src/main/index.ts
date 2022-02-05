require('v8-compile-cache');

import {app, components, ipcMain} from 'electron';
import {join} from 'path';
app.setPath('userData', join(app.getPath('appData'), 'Cider'));


// Analytics for debugging fun yeah.
import {init as Sentry} from '@sentry/electron';
import {Store} from "./base/store";
import {AppEvents} from "./base/app";
import {Plugins} from "./base/plugins";
import {utils} from "./base/utils";
import {BrowserWindow} from "./base/browserwindow";

Sentry({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

new Store();
const Cider = new AppEvents();
const CiderPlug = new Plugins();

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * App Event Handlers
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.on('ready', () => {
    Cider.ready(CiderPlug);

    console.log('[Cider] Application is Ready. Creating Window.')
    if (!app.isPackaged) {
        console.info('[Cider] Running in development mode.')
        require('vue-devtools').install()
    }

    components.whenReady().then(async () => {
        const bw = new BrowserWindow()
        const win = await bw.createWindow()

        win.on("ready-to-show", () => {
            Cider.bwCreated();
            CiderPlug.callPlugins('onReady', win);
            win.show();
        });
    });

});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Renderer Event Handlers
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

ipcMain.on('playbackStateDidChange', (event, attributes) => {
    CiderPlug.callPlugins('onPlaybackStateDidChange', attributes);
});

ipcMain.on('nowPlayingItemDidChange', (event, attributes) => {
    CiderPlug.callPlugins('onNowPlayingItemDidChange', attributes);
});

app.on('before-quit', () => {
    CiderPlug.callPlugins('onBeforeQuit');
    console.warn(`${app.getName()} exited.`);
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Widevine Event Handlers
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

// @ts-ignore
app.on('widevine-ready', (version, lastVersion) => {
    if (null !== lastVersion) {
        console.log('[Cider][Widevine] Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!')
    } else {
        console.log('[Cider][Widevine] Widevine ' + version + ' is ready to be used!')
    }
})

// @ts-ignore
app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
    console.log('[Cider][Widevine] Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!')
})

// @ts-ignore
app.on('widevine-error', (error) => {
    console.log('[Cider][Widevine] Widevine installation encountered an error: ' + error)
    app.exit()
})
