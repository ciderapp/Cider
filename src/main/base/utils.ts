import * as fs from "fs";
import * as path from "path";
import {Store} from "./store";
import {BrowserWindow as bw} from "./browserwindow";
import {app, BrowserWindow, ipcMain} from "electron";
import fetch from "electron-fetch";
import ElectronStore from "electron-store";

export class utils {

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
        },
        seek: (seconds: number) => {
            bw.win.webContents.executeJavaScript(`MusicKit.getInstance().seekToTime(${seconds})`)
        }
    }
    /**
     * Paths for the application to use
     */
    static paths: any = {
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
     * Get the IPCMain
     */
    static getIPCMain(): Electron.IpcMain {
        return ipcMain
    }
    
    /*
     * Get the Express instance
     * @returns {any}
     */
    static getExpress(): any {
        return bw.express
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
        /* else if (!fs.existsSync(path.join(this.paths.i18nPath, `${language}.json`))) {
            fetch(`https://raw.githubusercontent.com/ciderapp/Cider/main/src/i18n/${language}.json`)
                .then(res => res.json())
                .then(res => {
                    if (res) {
                        i18n = Object.assign(i18n, res);
                        fs.writeFileSync(path.join(this.paths.i18nPath, `${language}.json`), JSON.stringify(res));
                    } else {
                        i18n = Object.assign(i18n, JSON.parse(fs.readFileSync(path.join(this.paths.i18nPath, `en_US.json`), "utf8")));
                    }
                })
        } */
        
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
     * Pushes Store to Connect
     * @return Function
     */
    static pushStoreToConnect(): Function {
        return Store.pushToCloud
    }

    /**
     * Gets the browser window
     */
    static getWindow(): Electron.BrowserWindow {
        if (bw.win) {
            return bw.win
        } else {
            return BrowserWindow.getAllWindows()[0]
        }
    }

    static loadPluginFrontend(path: string): void {

    }

    static loadJSFrontend(path: string): void {
        bw.win.webContents.executeJavaScript(fs.readFileSync(path, "utf8"));
    }
}
