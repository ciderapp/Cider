import * as electron from 'electron';
import * as os from 'os';
import * as fs from 'fs';
import { join, resolve } from 'path';
import * as CiderReceiver from '../base/castreceiver';
import fetch from 'electron-fetch';
import {Stream} from "stream";
import {spawn} from 'child_process';


export default class NightCore {

    /**
     * Private variables for interaction in plugins
     */
    private _utils: any;
    private _win: any;
    private _app: any;
    private _store: any;
    private _cacheAttr: any;
    public audioStream: any = new Stream.PassThrough();
    private ffmpeg: any = null;

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'NightCore';
    public description: string = 'NightCore Plugin';
    public version: string = '0.0.1';
    public author: string = 'Amaru8 / Cider Collective';

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(utils: { getStore: () => any; getApp: () => any; }) {
        this._utils = utils;
        console.debug(`[Plugin][${this.name}] Loading Complete.`);
        this._app = utils.getApp();
    }

    /**
     * Runs on app ready
     */
    onReady(win: any): void {
        this._win = win;
        this._win.webContents.executeJavaScript(`CiderAudio.sendAudio()`).catch((err: any) => console.error(err));
        console.log("[Plugin][NightCore] Ready");

        electron.ipcMain.on('writeWAV', (event) => {
            this.ffmpeg != null ? this.ffmpeg.kill() : null;
            this.ffmpeg = spawn(this._utils.getStoreValue("advanced.ffmpegLocation"), [
                '-i', "http://localhost:9000/audio.wav",
                '-acodec', 'pcm_s16le',                             // PCM 16bits, little-endian
                '-filter:a', 'atempo=1.06,asetrate=44100*1.25',     // NightCore filter
                '-ar', '44100',                                     // Sampling rate
                '-ac', "2",                                         // Stereo
                'pipe:1'                                            // Output on stdout
            ]);
                    
            // Pipe the output to the audio stream
            this.ffmpeg.stdout.pipe(this.audioStream);
        });
    }

        /**
         * Runs on app stop
         */
        onBeforeQuit(): void {}
}