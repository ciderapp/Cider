import * as electron from 'electron';
import * as os from 'os';
import * as fs from 'fs';
import { join, resolve } from 'path';
import * as CiderReceiver from '../base/castreceiver';
import fetch from 'electron-fetch';
import {Stream} from "stream";
import {spawn} from 'child_process';


export default class RAOP {

    /**
     * Private variables for interaction in plugins
     */
    private _utils: any;
    private _win: any;
    private _app: any;
    private _store: any;
    private _cacheAttr: any;

    private ipairplay: any = "";
    private portairplay: any = "";
    private u = require('airtunes2');
    private airtunes: any;
    private device: any;
    private mdns = require('mdns-js');
    private ok: any = 1;
    private devices: any = [];
    private castDevices: any = [];
    private i: any = false;
    private audioStream: any = new Stream.PassThrough();
    private ffmpeg: any = null;

    private ondeviceup(name: any, host: any, port: any, addresses: any) {
        if (this.castDevices.findIndex((item: any) => item.name === host && item.port === port && item.addresses === addresses) === -1) {
            this.castDevices.push({
                name: host,
                host: addresses ? addresses[0] : '',
                port: port,
                addresses: addresses
            });
            if (this.devices.indexOf(host) === -1) {
                this.devices.push(host);
            }
            if (name) {
                this._win.webContents.executeJavaScript(`console.log('deviceFound','ip: ${host} name:${name}')`).catch((err: any) => console.error(err));
                console.log("deviceFound", host, name);
            }
        } else {
            this._win.webContents.executeJavaScript(`console.log('deviceFound (added)','ip: ${host} name:${name}')`).catch((err: any) => console.error(err));
            console.log("deviceFound (added)", host, name);
        }
    }

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'RAOP';
    public description: string = 'RAOP Plugin';
    public version: string = '0.0.1';
    public author: string = 'vapormusic / Cider Collective';

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

        electron.ipcMain.on('getKnownAirplayDevices', (event) => {
            event.returnValue = this.castDevices
        });
        
        electron.ipcMain.on("getAirplayDevice", (event, data) => {
            this.castDevices = [];
            console.log("scan for airplay devices");
            
            const browser = this.mdns.createBrowser(this.mdns.tcp('raop'));
            browser.on('ready', browser.discover);

            browser.on('update', (service: any) => {
                if (service.addresses && service.fullname && service.fullname.includes('_raop._tcp')) {
                this._win.webContents.executeJavaScript(`console.log(
                    "${service.name} ${service.host}:${service.port} ${service.addresses}"
                )`);}
                this.ondeviceup(service.name, service.host, service.port, service.addresses);
            });

        });



        electron.ipcMain.on("performAirplayPCM", (event, ipv4, ipport, sepassword, title, artist, album, artworkURL) => {

            if (ipv4 != this.ipairplay || ipport != this.portairplay) {
                if (this.airtunes == null) { this.airtunes = new this.u()}
                this.ipairplay = ipv4;
                this.portairplay = ipport;
                this.device = this.airtunes.add(ipv4, {
                    port: ipport,
                    volume: 60,
                    password: sepassword,
                });
                this.device.on('status', (status: any) => {
                    console.log('device status', status);
                    if (status == "ready"){
                        this._win.webContents.executeJavaScript(`CiderAudio.sendAudio()`).catch((err: any) => console.error(err));
                    }
                    if (status == 'stopped') {
                        this.airtunes.stopAll(() => {
                            console.log('end');
                        });
                        this.airtunes = null;
                        this.device = null;
                        this.ipairplay = '';
                        this.portairplay = '';
                        this.ok = 1;
                       
                    } else {
                        setTimeout(() => {
                            if (this.ok == 1) {
                                console.log(this.device.key, title ?? '', artist ?? '', album ?? '');
                                this.airtunes.setTrackInfo(this.device.key, title ?? '', artist?? '', album?? '');
                                this.uploadImageAirplay(artworkURL);
                                console.log('done');
                                this.ok == 2
                            }
                        }, 1000);
                    }


                });

            }




        });

        electron.ipcMain.on('writeWAV', (event) => {
            if (this.airtunes != null) {
                if (!this.i){
                this.ffmpeg != null ? this.ffmpeg.kill() : null;
                this.ffmpeg = spawn(this._utils.getStoreValue("advanced.ffmpegLocation"), [
                    '-f', 's16le',        // PCM 16bits, little-endian
                    '-ar', '48000', 
                    '-ac', "2",  
                    '-i', "http://localhost:9000/audio.wav",
                    '-acodec', 'pcm_s16le',
                    '-f', 's16le',        // PCM 16bits, little-endian
                    '-ar', '44100',       // Sampling rate
                    '-ac', "2",             // Stereo
                    'pipe:1'              // Output on stdout
                  ]);
                
                  // pipe data to AirTunes
                this.ffmpeg.stdout.pipe(this.airtunes);
                this.i = true;}}

        });
        


        electron.ipcMain.on('disconnectAirplay', (event) => {
            this.airtunes.stopAll(function () {
                console.log('end');
            });
            this.airtunes = null;
            this.device = null;
            this.ipairplay = '';
            this.portairplay = '';
            this.ok = 1;
            this.i = false;
        });

        electron.ipcMain.on('updateAirplayInfo', (event, title, artist, album, artworkURL) => {
            if (this.airtunes && this.device) {
                console.log(this.device.key, title, artist, album);
                this.airtunes.setTrackInfo(this.device.key, title, artist, album);
                this.uploadImageAirplay(artworkURL)
            }
        });

        electron.ipcMain.on('updateRPCImage', (_event, imageurl) => {
            this.uploadImageAirplay(imageurl)
        })



    }

    private uploadImageAirplay = (url: any) => {
        try {
            if (url != null && url != '') {
                //console.log(join(this._app.getPath('userData'), 'temp.png'), url);
                fetch(url)
                    .then(res => res.buffer())
                    .then((buffer) => {
                        this.airtunes.setArtwork(this.device.key, buffer, "image/png");
                    }).catch(err => {
                        console.log(err)
                    });
            }
        } catch (e) { console.log(e) }
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {

    }

    // /**
    //  * Runs on song change
    //  * @param attributes Music Attributes
    //  */
    // onNowPlayingItemDidChange(attributes: any): void {
    //     if (this.airtunes && this.device) {
    //         let title = attributes.name ? attributes.name : '';
    //         let artist = attributes.artistName ? attributes.artistName : '';
    //         let album = attributes.albumName ? attributes.albumName : '';
    //         let artworkURL = attributes?.artwork?.url?.replace('{w}', '1024').replace('{h}', '1024') ?? null;
    //         console.log(this.device.key, title, artist, album);
    //         this.airtunes.setTrackInfo(this.device.key, title, artist, album);
    //         if (artworkURL)
    //             this.uploadImageAirplay(artworkURL)
    //     }
    // }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.status = current state)
     */
    onPlaybackStateDidChange(attributes: any): void {
        if (this.airtunes && this.device) {
            let title = attributes?.name ?? '';
            let artist = attributes?.artistName ?? '';
            let album = attributes?.albumName ?? '';
            let artworkURL = attributes?.artwork?.url ?? null;
            console.log(this.device.key, title, artist, album);
            this.airtunes.setTrackInfo(this.device.key, title, artist, album);
            if (artworkURL != null){}
                this.uploadImageAirplay(artworkURL.replace('{w}', '1024').replace('{h}', '1024'))
        }
    }

}