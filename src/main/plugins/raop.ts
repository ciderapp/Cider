import * as electron from 'electron';
import * as os from 'os';
import * as fs from 'fs';
import { join } from 'path';
import * as CiderReceiver from '../base/castreceiver';
import fetch from 'electron-fetch';


export default class RAOP {

    /**
     * Private variables for interaction in plugins
     */
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
    constructor(app: any, store: any) {
        this._app = app;
        this._store = store

    }

    /**
     * Runs on app ready
     */
    onReady(win: any): void {
        this._win = win;
        electron.ipcMain.on("getAirplayDevice", (event, data) => {
            console.log("scan for airplay devices");
            const browser = this.mdns.createBrowser(this.mdns.tcp('raop'));
            browser.on('ready', browser.discover);

            browser.on('update', (service: any) => {
                if (service.fullname.includes('_raop._tcp')) {
                this._win.webContents.executeJavaScript(`console.log(
                    "${service.name} ${service.host}:${service.port} ${service.addresses}"
                )`);}
            });
        });



        electron.ipcMain.on("performAirplayPCM", (event, ipv4, ipport, sepassword, title, artist, album, artworkURL) => {

            if (ipv4 != this.ipairplay || ipport != this.portairplay) {
                if (this.airtunes == null) { this.airtunes = new this.u(); }
                this.ipairplay = ipv4;
                this.portairplay = ipport;
                this.device = this.airtunes.add(ipv4, {
                    port: ipport,
                    volume: 100,
                    password: sepassword,
                });
                this.device.on('status', (status: any) => {
                    console.log('device status', status);
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
                                console.log(this.device.key, title, artist, album);
                                this.airtunes.setTrackInfo(this.device.key, title, artist, album);
                                this.uploadImageAirplay(artworkURL);
                                console.log('done');
                                this.ok == 2
                            }
                        }, 1000);
                    }


                });

            }




        });

        electron.ipcMain.on('writeWAV', (event, leftpcm, rightpcm, bufferlength) => {
            function interleave16(leftChannel: any, rightChannel: any) {
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

            //https://github.com/HSU-ANT/jsdafx

            function quantization(audiobufferleft: any, audiobufferright: any) {

                let h = Float32Array.from([1]);
                let nsState = new Array(0);
                let ditherstate = new Float32Array(0);
                let qt = Math.pow(2, 1 - 16);

                //noise shifting order 3
                h = Float32Array.from([1.623, -0.982, 0.109]);
                for (let i = 0; i < nsState.length; i++) {
                    nsState[i] = new Float32Array(h.length);
                }


                function setChannelCount(nc: any) {
                    if (ditherstate.length !== nc) {
                        ditherstate = new Float32Array(nc);
                    }
                    if (nsState.length !== nc) {
                        nsState = new Array(nc);
                        for (let i = 0; i < nsState.length; i++) {
                            nsState[i] = new Float32Array(h.length);
                        }
                    }
                }

                function hpDither(channel: any) {
                    const rnd = Math.random() - 0.5;
                    const d = rnd - ditherstate[channel];
                    ditherstate[channel] = rnd;
                    return d;
                }




                setChannelCount(2);
                const inputs = [audiobufferleft, audiobufferright];
                const outputs = [audiobufferleft, audiobufferright];

                for (let channel = 0; channel < inputs.length; channel++) {
                    const inputData = inputs[channel];
                    const outputData = outputs[channel];
                    for (let sample = 0; sample < bufferlength; sample++) {
                        let input = inputData[sample];
                        // console.log('a2',inputData.length);
                        for (let i = 0; i < h.length; i++) {
                            input -= h[i] * nsState[channel][i];
                        }
                        // console.log('a3',input);
                        let d_rand = 0.0;
                        // ditherstate = new Float32Array(h.length);
                        // d_rand = hpDither(channel);
                        const tmpOutput = qt * Math.round(input / qt + d_rand);
                        for (let i = h.length - 1; i >= 0; i--) {
                            nsState[channel][i] = nsState[channel][i - 1];
                        }
                        nsState[channel][0] = tmpOutput - input;
                        outputData[sample] = tmpOutput;
                    }
                }
                return outputs;
            }

            function bitratechange(e: any) {
                var t = e.length;
                let sampleRate = 48.0;
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


            function convert(n: any) {
                var v = n < 0 ? n * 32768 : n * 32767;       // convert in range [-32768, 32767]
                return Math.max(-32768, Math.min(32768, v)); // clamp
            }

            if (this.airtunes != null) {
                let newaudio = quantization(leftpcm, rightpcm);
                //let newaudio = [leftpcm, rightpcm];
                //let newbuffer = Buffer.from(new Int8Array(interleave16(bitratechange(Int16Array.from(newaudio[0], x => x * 32767)),bitratechange(Int16Array.from(newaudio[1], x => x * 32767))).buffer)); 
                let pcmData = Buffer.from(new Int8Array(interleave16(bitratechange(Int16Array.from(newaudio[0], x => convert(x))), bitratechange(Int16Array.from(newaudio[1], x => convert(x)))).buffer));
                this.airtunes.circularBuffer.write(pcmData);
                // fs.writeFile(join(this._app.getPath('userData'), 'buffer.raw'), pcmData,{flag: 'a+'}, function (err) {
                // if (err) throw err;
                // console.log('It\'s saved!');
                //});
            } else {
             //   console.log('airtunes not ready');
            }
        })

        electron.ipcMain.on('disconnectAirplay', (event) => {
            this.airtunes.stopAll(function () {
                console.log('end');
            });
            this.airtunes = null;
            this.device = null;
            this.ipairplay = '';
            this.portairplay = '';
            this.ok = 1;
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
                console.log(join(this._app.getPath('userData'), 'temp.png'), url);
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
            let title = attributes.name ? attributes.name : '';
            let artist = attributes.artistName ? attributes.artistName : '';
            let album = attributes.albumName ? attributes.albumName : '';
            let artworkURL = attributes?.artwork?.url?.replace('{w}', '1024').replace('{h}', '1024') ?? null;
            console.log(this.device.key, title, artist, album);
            this.airtunes.setTrackInfo(this.device.key, title, artist, album);
            if (artworkURL)
                this.uploadImageAirplay(artworkURL)
        }
    }

}