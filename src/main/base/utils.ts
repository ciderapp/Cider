import * as fs from "fs";
import * as path from "path";
import {Store} from "./store";
import {BrowserWindow as bw} from "./browserwindow";
import {app, dialog, ipcMain, Notification, shell } from "electron";
import fetch from "electron-fetch";
import {AppImageUpdater, NsisUpdater} from "electron-updater";
import * as log from "electron-log";
import ElectronStore from "electron-store";

export class utils {

    /**
     * Paths for the application to use
     */
    private static paths: any = {
        srcPath: path.join(__dirname, "../../src"),
        rendererPath: path.join(__dirname, "../../src/renderer"),
        mainPath: path.join(__dirname, "../../src/main"),
        resourcePath: path.join(__dirname, "../../resources"),
        i18nPath: path.join(__dirname, "../../src/i18n"),
        i18nPathSrc: path.join(__dirname, "../../src/il8n/source"),
        ciderCache: path.resolve(app.getPath("userData"), "CiderCache"),
        themes: path.resolve(app.getPath("userData"), "Themes"),
        plugins: path.resolve(app.getPath("userData"), "Plugins"),
        externals: path.resolve(app.getPath("userData"), "externals"),
    };

    /**
     * Get the path
     * @returns {string}
     * @param name
     */
    static getPath(name: string): string {
        return this.paths[name];
    }

    /**
     * Get the app
     * @returns {Electron.App}
     */
    static getApp(): Electron.App {
        return app;
    }

    /**
     * Fetches the i18n locale for the given language.
     * @param language {string} The language to fetch the locale for.
     * @param key {string} The key to search for.
     * @returns {string | Object} The locale value.
     */
    static getLocale(language: string, key?: string): string | object {
        let i18n: { [index: string]: Object } = JSON.parse(fs.readFileSync(path.join(this.paths.i18nPath, "en_US.json"), "utf8"));

        if (language !== "en_US" && fs.existsSync(path.join(this.paths.i18nPath, `${language}.json`))) {
            i18n = Object.assign(i18n, JSON.parse(fs.readFileSync(path.join(this.paths.i18nPath, `${language}.json`), "utf8")));
        }

        if (key) {
            return i18n[key]
        } else {
            return i18n
        }
    }

    /**
     * Gets a store value
     * @param key
     * @returns store value
     */
    static getStoreValue(key: string): any {
        return Store.cfg.get(key)
    }

    /**
     * Sets a store
     * @returns store
     */
    static getStore(): Object {
        return Store.cfg.store
    }

    /**
     * Get the store instance
     * @returns {Store}
     */
    static getStoreInstance(): ElectronStore {
        return Store.cfg
    }

    /**
     * Sets a store value
     * @param key
     * @param value
     */
    static setStoreValue(key: string, value: any): void {
        Store.cfg.set(key, value)
    }

    /**
     * Gets the browser window
     */
    static getWindow(): Electron.BrowserWindow {
        return bw.win
    }

    static loadPluginFrontend(path: string): void {

    }

    static loadJSFrontend(path: string): void {
        bw.win.webContents.executeJavaScript(fs.readFileSync(path, "utf8"));
    }

    /**
     * Playback Functions
     */
    static playback = {
        pause: () => {
            bw.win.webContents.executeJavaScript("MusicKitInterop.pause()")
        },
        play: () => {
            bw.win.webContents.executeJavaScript("MusicKitInterop.play()")
        },
        playPause: () => {
            bw.win.webContents.executeJavaScript("MusicKitInterop.playPause()")
        },
        next: () => {
            bw.win.webContents.executeJavaScript("MusicKitInterop.next()")
        },
        previous: () => {
            bw.win.webContents.executeJavaScript("MusicKitInterop.previous()")
        }
    }

    /**
     * Checks the application for updates
     */
    static async checkForUpdate(): Promise<void> {
        if (!app.isPackaged) {
            new Notification({ title: "Application Update", body: "Can't update as app is in DEV mode. Please build or grab a copy by clicking me"})
                .on('click', () => {shell.openExternal('https://download.cider.sh/?utm_source=app&utm_medium=dev-mode-warning')})
                .show()
            bw.win.webContents.send('update-response', "update-error")
            return;
        }
        const options: any = {
            provider: 'github',
            protocol: 'https',
            owner: 'ciderapp',
            repo: 'cider-releases',
            allowDowngrade: true,
        }
        let autoUpdater: any = null
        if (process.platform === 'win32') { //Windows
            autoUpdater = await new NsisUpdater(options)
        } else {
            autoUpdater = await new AppImageUpdater(options) //Linux and Mac (AppImages work on macOS btw)
        }

        autoUpdater.on('checking-for-update', () => {
            new Notification({ title: "Cider Update", body: "Cider is currently checking for updates."}).show()
        })

        autoUpdater.on('error', (error: any) => {
            console.error(`[AutoUpdater] Error: ${error}`)
            bw.win.webContents.send('update-response', "update-error")
        })

        autoUpdater.on('update-not-available', () => {
            console.log('[AutoUpdater] Update not available.')
            bw.win.webContents.send('update-response', "update-not-available");
        })
        autoUpdater.on('download-progress', (event: any, progress: any) => {
            bw.win.setProgressBar(progress.percent / 100)
        })

        autoUpdater.on('update-downloaded', (info: any) => {
            console.log('[AutoUpdater] Update downloaded.')
            bw.win.webContents.send('update-response', "update-downloaded");
            const dialogOpts = {
                type: 'info',
                buttons: ['Restart', 'Later'],
                title: 'Application Update',
                message: info,
                detail: 'A new version has been downloaded. Restart the application to apply the updates.'
              }
            
              dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) autoUpdater.quitAndInstall()
              })
              new Notification({ title: "Application Update", body: info}).on('click', () => {
                  bw.win.show()
              }).show()
        })

        log.transports.file.level = "debug"
        autoUpdater.logger = log
        await autoUpdater.checkForUpdatesAndNotify()
    }
}
