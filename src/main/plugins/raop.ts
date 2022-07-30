import * as electron from 'electron';
import * as os from 'os';
import * as fs from 'fs';
import { join, resolve } from 'path';
import * as CiderReceiver from '../base/castreceiver';
import fetch from 'electron-fetch';
import {Stream} from "stream";
import {spawn} from 'child_process';
import {Worker} from 'worker_threads';
import { Blob } from 'buffer'; 


export default class RAOP {

    /**
     * Private variables for interaction in plugins
     */
    private _utils: any;
    private _win: any;
    private _app: any;
    private _store: any;
    private _cacheAttr: any;
    private u: any;
    private ipairplay: any = "";
    private portairplay: any = "";
    
    private airtunes: any;
    private device: any;
    private mdns = require('mdns-js');
    private ok: any = 1;
    private devices: any = [];
    private castDevices: any = [];
    private i: any = false;
    private audioStream: any = new Stream.PassThrough();
    private ffmpeg: any = null;
    private worker: any = null;
    

    private processNode = `
    import {parentPort, workerData} from "worker_threads";
    function getAudioConv (buffers) {
        
        function interleave16(leftChannel, rightChannel) {
            var length = leftChannel.length + rightChannel.length;
            var result = new Int16Array(length);

            var inputIndex = 0;

            for (var index = 0; index < length;) {
                result[index++] = leftChannel[inputIndex];
                result[index++] = rightChannel[inputIndex];
                inputIndex++;
            }
            return result;
        }



        function convert(n) {
            var v = n < 0 ? n * 32768 : n * 32767;       // convert in range [-32768, 32767]
            return Math.max(-32768, Math.min(32768, v)); // clamp
        }

        function bitratechange(e) {
            var t = e.length;
            let sampleRate = 96.0;
            let outputSampleRate = 44.1;
            var s = 0,
                o = sampleRate / outputSampleRate,
                u = Math.ceil(t * outputSampleRate / sampleRate),
                a = new Int16Array(u);
            for (let i = 0; i < u; i++) {
                a[i] = e[Math.floor(s)];
                s += o;
            }

            return a;
        }

        let newaudio = buffers;

        let pcmData = new Int8Array(interleave16(bitratechange(Int16Array.from(newaudio[0], x => convert(x))), bitratechange(Int16Array.from(newaudio[1], x => convert(x)))).buffer);
        return pcmData;
    }
    parentPort.on("message", data => {
        parentPort.postMessage({buffer: data.buffer, outbuffer: getAudioConv(data.buffer)});
    });

`;

    private ondeviceup(name: any, host: any, port: any, addresses: any, text: any, airplay2: any = null) {
        console.log(this.castDevices.findIndex((item: any) => {return (item.name == host.replace(".local","") && item.port == port )}))
        if (this.castDevices.findIndex((item: any) => {return (item.name == host.replace(".local","") && item.port == port )}) == -1) {
            this.castDevices.push({
                name: host.replace(".local",""),
                host: addresses ? addresses[0] : '',
                port: port,
                addresses: addresses,
                txt: text,
                airplay2: airplay2
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
        this.u = require('airtunes2');
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
                 if (service.addresses && service.fullname && (service.fullname.includes('_raop._tcp'))) {
                    // console.log(service.txt)
                this._win.webContents.executeJavaScript(`console.log(
                    "${service.name} ${service.host}:${service.port} ${service.addresses}"
                )`);
                this.ondeviceup(service.name, service.host, service.port, service.addresses, service.txt);
             }
            });

            const browser2 = this.mdns.createBrowser(this.mdns.tcp('airplay'));
            browser2.on('ready', browser2.discover);

            browser2.on('update', (service: any) => {
                 if (service.addresses && service.fullname && (service.fullname.includes('_airplay._tcp'))) {
                    // console.log(service.txt)
                this._win.webContents.executeJavaScript(`console.log(
                    "${service.name} ${service.host}:${service.port} ${service.addresses}"
                )`);
                this.ondeviceup(service.name, service.host, service.port, service.addresses, service.txt, true);
             }
            });
            
            // const browser2 = this.mdns.createBrowser(this.mdns.tcp('airplay'));
            // browser2.on('ready', browser2.discover);

            // browser2.on('update', (service: any) => {
            //      if (service.addresses && service.fullname && (service.fullname.includes('_raop._tcp') ||  service.fullname.includes('_airplay._tcp'))) {
            //         // console.log(service.txt)
            //     this._win.webContents.executeJavaScript(`console.log(
            //         "${service.name} ${service.host}:${service.port} ${service.addresses}"
            //     )`);
            //     this.ondeviceup(service.name, service.host, service.port, service.addresses, service.txt);
            //  }
            // });
    
        });



        electron.ipcMain.on("performAirplayPCM", (event, ipv4, ipport, sepassword, title, artist, album, artworkURL,txt,airplay2dv) => {

            if (ipv4 != this.ipairplay || ipport != this.portairplay) {
                if (this.airtunes == null) { this.airtunes = new this.u()}
                this.ipairplay = ipv4;
                this.portairplay = ipport;
                this.device = this.airtunes.add(ipv4, {
                    port: ipport,
                    volume: 50,
                    password: sepassword,
                    txt: txt,
                    airplay2: airplay2dv,
                    debug: true
                });
                // console.log('lol',txt)
                this.device.on('status', (status: any) => {
                    console.log('device status', status);
                    if (status == "ready"){
                        this._win.webContents.setAudioMuted(true);
                        this._win.webContents.executeJavaScript(`CiderAudio.sendAudio()`).catch((err: any) => console.error(err));
                    }
                    if (status == "need_password"){
                        this._win.webContents.executeJavaScript(`app.setAirPlayCodeUI()`)
                    }
                    if (status == "pair_success"){
                        this._win.webContents.executeJavaScript(`app.sendAirPlaySuccess()`)
                    }
                    if (status == "pair_failed"){
                        this._win.webContents.executeJavaScript(`app.sendAirPlayFailed()`)
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

        electron.ipcMain.on('setAirPlayPasscode', (event, passcode) => {
            if (this.device){
                this.device.setPasscode(passcode)
            }
        })

        electron.ipcMain.on('writeWAV', (event, leftbuffer, rightbuffer) => {
            if (this.airtunes != null) {
                if (this.worker == null) {
                try{
                const toDataUrl = (js: any) => new URL(`data:text/javascript,${encodeURIComponent(js)}`);
                // let blob = new Blob([this.processNode], { type: 'application/javascript' });
                //Create new worker
                this.worker = new Worker(toDataUrl(this.processNode));

                //Listen for a message from worker
                this.worker.on("message", (result: any) => {
                // fs.writeFile(join(electron.app.getPath('userData'), 'buffer.raw'), Buffer.from(Int8Array.from(result.outbuffer)),{flag: 'a+'}, function (err) {
                //     if (err) throw err;
                //     console.log('It\'s saved!');
                // });
                this.airtunes.circularBuffer.write(Buffer.from(Int8Array.from(result.outbuffer)));
                });

                this.worker.on("error", (error: any) => {
                    console.log("bruh",error); 
                });
                this.worker.postMessage({buffer: [leftbuffer, rightbuffer]});   
                } catch (e){console.log(e)}
                

                // this.ffmpeg != null ? this.ffmpeg.kill() : null;
                // this.ffmpeg = spawn(this._utils.getStoreValue("advanced.ffmpegLocation"), [
                //     '-f', 's16le',        // PCM 16bits, little-endian
                //     '-ar', '48000', 
                //     '-ac', "2",  
                //     '-err_detect','ignore_err',
                //     '-i', "http://localhost:9000/audio.wav",
                //     '-acodec', 'pcm_s16le',
                //     '-f', 's16le',        // PCM 16bits, little-endian
                //     '-ar', '44100',       // Sampling rate
                //     '-ac', "2",             // Stereo
                //     'pipe:1'              // Output on stdout
                //   ]);
                
                //   // pipe data to AirTunes
                // this.ffmpeg.stdout.pipe(this.airtunes);
                // this.i = true;
                } else {
                 this.worker.postMessage({buffer: [leftbuffer, rightbuffer]});
                }
            }

        });
        


        electron.ipcMain.on('disconnectAirplay', (event) => {
            this._win.webContents.setAudioMuted(false);
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
