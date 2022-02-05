import * as fs from "fs";
import * as path from "path";
import {jsonc} from "jsonc";
import {Store} from "./store";
import {BrowserWindow as bw} from "./browserwindow";

export class utils {

    /**
     * Fetches the i18n locale for the given language.
     * @param language {string} The language to fetch the locale for.
     * @param key {string} The key to search for.
     * @returns {string | Object} The locale value.
     */
    static getLocale(language: string, key?: string): string | object {
        let i18n: { [index: string]: Object } = jsonc.parse(fs.readFileSync(path.join(__dirname, "../../src/i18n/en_US.jsonc"), "utf8"));

        if (language !== "en_US" && fs.existsSync(path.join(__dirname, `../../src/i18n/${language}.jsonc`))) {
            i18n = Object.assign(i18n, jsonc.parse(fs.readFileSync(path.join(__dirname, `../../src/i18n/${language}.jsonc`), "utf8")));
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
}