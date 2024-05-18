import { BrowserWindow, app, ipcMain } from "electron";
import ElectronStore from "electron-store";
import fetch from "node-fetch";
import { readFileSync } from "node:fs";
import { join, resolve,dirname } from "node:path";
import { BrowserWindow as bw } from "./browserwindow.js";
import { Store } from "./store.js";
import { fileURLToPath } from "node:url";

export class utils {
  static hash = "fda9a6528649ea90dee35390wog"
  static i18n: any = {};

  /**
   * Playback Functions
   */
  static playback = {
    pause: () => {
      bw.win.webContents.executeJavaScript("MusicKitInterop.pause()");
    },
    play: () => {
      bw.win.webContents.executeJavaScript("MusicKitInterop.play()");
    },
    playPause: () => {
      bw.win.webContents.executeJavaScript("MusicKitInterop.playPause()");
    },
    next: () => {
      bw.win.webContents.executeJavaScript("MusicKitInterop.next()");
    },
    previous: () => {
      bw.win.webContents.executeJavaScript("MusicKitInterop.previous()");
    },
    seek: (seconds: number) => {
      bw.win.webContents.executeJavaScript(`MusicKit.getInstance().seekToTime(${seconds})`);
    },
  };
  /**
   * Paths for the application to use
   */
  static paths: any = {
    srcPath: join(dirname(fileURLToPath(import.meta.url)), "../../src"),
    rendererPath: join(dirname(fileURLToPath(import.meta.url)), "../../src/renderer"),
    mainPath: join(dirname(fileURLToPath(import.meta.url)), "../../src/main"),
    resourcePath: join(dirname(fileURLToPath(import.meta.url)), "../../resources"),
    ciderCache: resolve(app.getPath("userData"), "CiderCache"),
    themes: resolve(app.getPath("userData"), "Themes"),
    plugins: resolve(app.getPath("userData"), "Plugins"),
    externals: resolve(app.getPath("userData"), "externals"),
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
    return ipcMain;
  }

  /*
   * Get the Express instance
   * @returns {any}
   */
  static getExpress(): any {
    return bw.express;
  }

  /**
   * MitM the electron fetch for a function that proxies github.
   * Written in TS so Maikiwi doesn't fuck up
   */
  static async fetch(url: string, opts: object = {}) {
    Object.assign(opts, {
      headers: {
        "User-Agent": utils.getWindow().webContents.getUserAgent(),
      },
    });
    if (this.getStoreValue("advanced.experiments").includes("cider_mirror") === true) {
      if (url.includes("api.github.com/")) {
        return await fetch(url.replace("api.github.com/", "mirror.api.cider.sh/v2/api/"), opts);
      } else if (url.includes("raw.githubusercontent.com/")) {
        return await fetch(url.replace("raw.githubusercontent.com/", "mirror.api.cider.sh/v2/raw/"), opts);
      } else {
        return await fetch(url, opts);
      }
    } else {
      return await fetch(url, opts);
    }
  }

  static async initializeTranslations() {
    const otaClient = (await import('@crowdin/ota-client')).default.default;
    const crowdin = new otaClient(this.hash)

    this.i18n = await crowdin.getTranslations();
  }

  /**
   * Fetches the i18n locale for the given language.
   * @param language {string} The language to fetch the locale for.
   * @param key {string} The key to search for.
   * @returns {string | Object} The locale value.
   */
  static getLocale(language: string, key?: string): string | object {
    let i18n: any = {};
    if (!this.i18n[language]) {
      i18n = this.i18n["en"][0].content;
    } else {
      i18n = this.i18n[language ?? "en"][0].content;
    }

    if (key) {
      return i18n[key];
    } else {
      return i18n;
    }
  }

  /**
   * Gets a store value
   * @param key
   * @returns store value
   */
  static getStoreValue(key: string): any {
    return Store.cfg.get(key);
  }

  /**
   * Sets a store
   * @returns store
   */
  static getStore(): Object {
    return Store.cfg.store;
  }

  /**
   * Get the store instance
   * @returns {Store}
   */
  static getStoreInstance(): ElectronStore {
    return Store.cfg;
  }

  /**
   * Sets a store value
   * @param key
   * @param value
   */
  static setStoreValue(key: string, value: any): void {
    Store.cfg.set(key, value);
  }

  /**
   * Pushes Store to Connect
   * @return Function
   */
  static pushStoreToConnect(): Function {
    return Store.pushToCloud;
  }

  /**
   * Gets the browser window
   */
  static getWindow(): Electron.BrowserWindow {
    if (bw.win) {
      return bw.win;
    } else {
      return BrowserWindow.getAllWindows()[0];
    }
  }

  static loadPluginFrontend(path: string): void {}

  static loadJSFrontend(path: string): void {
    bw.win.webContents.executeJavaScript(readFileSync(path, "utf8"));
  }
}
