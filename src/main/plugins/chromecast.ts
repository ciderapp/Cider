import * as electron from 'electron';
import * as os from 'os';
import {resolve} from 'path';
import * as CiderReceiver from '../base/castreceiver';

export default class ChromecastPlugin {

    /**
     * Private variables for interaction in plugins
     */
    private _win: any;
    private _app: any;
    private _lastfm: any;
    private _store: any;
    private _timer: any;
    private audioClient = require('castv2-client').Client;
    private mdns = require('mdns-js');

    private devices: any = [];
    private castDevices: any = [];

    // private GCRunning = false;
    // private GCBuffer: any;
    // private expectedConnections = 0;
    // private currentConnections = 0;
    private activeConnections: any = [];
    // private requests = [];
    // private GCstream = new Stream.PassThrough(),
    private connectedHosts: any = {};
    private connectedPlayer: any;
    private ciderPort :any = 9000;
    // private server = false;
    // private  bufcount = 0;
    // private bufcount2 = 0;
    // private headerSent = false;


    private searchForGCDevices() {
        try {

            let browser = this.mdns.createBrowser(this.mdns.tcp('googlecast'));
            browser.on('ready', browser.discover);

            browser.on('update', (service: any) => {
                if (service.addresses && service.fullname && service.fullname.includes('_googlecast._tcp')) {
                    let a = service.txt.filter((u: any) => String(u).startsWith('fn='))
                    let name = (((a[0] ?? "").substring(3)) != "") ? ((a[0] ?? "").substring(3)) : (service.fullname.substring(0, service.fullname.indexOf("._googlecast")) )
                    this.ondeviceup(service.addresses[0], name+ " (" + (service.type[0]?.description ?? "") + ")" , '', 'googlecast');
                }
            });
            const Client = require('node-ssdp').Client;
            // also do a SSDP/UPnP search
            let ssdpBrowser = new Client();
            ssdpBrowser.on('response', (headers: any, statusCode: any, rinfo: any) => {
                var location = getLocation(headers);
                if (location != null) {
                    this.getServiceDescription(location, rinfo.address);
                }

            });

            function getLocation(headers: any) {
                let location = null;
                if (headers["LOCATION"] != null) {
                    location = headers["LOCATION"]
                } else if (headers["Location"] != null) {
                    location = headers["Location"]
                }
                return location;
            }

            ssdpBrowser.search('urn:dial-multiscreen-org:device:dial:1');

            // // actual upnp devices  
            // if (app.cfg.get("audio.enableDLNA")) {
            //     let ssdpBrowser2 = new Client();
            //     ssdpBrowser2.on('response',  (headers, statusCode, rinfo) => {
            //          var location = getLocation(headers);
            //          if (location != null) {
            //              this.getServiceDescription(location, rinfo.address);
            //          }

            //     });
            //     ssdpBrowser2.search('urn:schemas-upnp-org:device:MediaRenderer:1');

            // }


        } catch (e) {
            console.log('Search GC err', e);
        }
    }

    private getServiceDescription(url: any, address: any) {
        const request = require('request');
        request.get(url, (error: any, response: any, body: any) => {
            if (!error && response.statusCode === 200) {
                this.parseServiceDescription(body, address, url);
            }
        });
    }

    private ondeviceup(host: any, name: any, location: any, type: any) {
        if (this.castDevices.findIndex((item: any) => item.host === host && item.name === name && item.location === location && item.type === type) === -1) {
            this.castDevices.push({
                name: name,
                host: host,
                location: location,
                type: type
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

    private parseServiceDescription(body: any, address: any, url: any) {
        const parseString = require('xml2js').parseString;
        parseString(body, (err: any, result: any) => {
            if (!err && result && result.root && result.root.device) {
                const device = result.root.device[0];
                console.log('device', device);
                let devicetype = 'googlecast';
                console.log()
                if (device.deviceType && device.deviceType.toString() === 'urn:schemas-upnp-org:device:MediaRenderer:1') {
                    devicetype = 'upnp';
                }
                this.ondeviceup(address, device.friendlyName.toString(), url, devicetype);
            }
        });
    }


    private loadMedia(client: any, song: any, artist: any, album: any, albumart: any, cb?: any) {
        // const u = 'http://' + this.getIp() + ':' + server.address().port + '/';
        //  const DefaultMediaReceiver : any = require('castv2-client').DefaultMediaReceiver;
        client.launch(CiderReceiver, (err: any, player: any) => {
            if (err) {
                console.log(err);
                return;
            }
            let media = {
                // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                contentId: 'http://' + this.getIp() + ':'+ this.ciderPort +'/audio.wav',
                contentType: 'audio/wav',
                streamType: 'LIVE', // or LIVE

                // Title and cover displayed while buffering
                metadata: {
                    type: 0,
                    metadataType: 3,
                    title: song ?? "",
                    albumName: album ?? "",
                    artist: artist ?? "",
                    images: [
                        {url: albumart ?? ""}]
                }
            };

            player.on('status', (status: any) => {
                console.log('status broadcast playerState=%s', status);
            });

            console.log('app "%s" launched, loading media %s ...', player, media);

            player.load(media, {
                autoplay: true
            }, (err: any, status: any) => {
                console.log('media loaded playerState=%s', status);
            });


            client.getStatus((x: any, status: any) => {
                if (status && status.volume) {
                    client.volume = status.volume.level;
                    client.muted = status.volume.muted;
                    client.stepInterval = status.volume.stepInterval;
                }
            })

            // send websocket ip

            player.sendIp("ws://" + this.getIp() + ":26369");
            electron.ipcMain.on('stopGCast', (_event) => {
                player.kill();
            })
            electron.app.on('before-quit', (_event) => {
                player.kill();
            })
            

        });
    }

    private getIp(){
        let ip: string = '';
        let ip2: any = [];
        let alias = 0;
        const ifaces: any = os.networkInterfaces();
        for (let dev in ifaces) {
            ifaces[dev].forEach((details: any) => {
                if (details.family === 'IPv4' && !details.internal) {
                    if (!/(loopback|vmware|internal|hamachi|vboxnet|virtualbox)/gi.test(dev + (alias ? ':' + alias : ''))) {
                        if (details.address.substring(0, 8) === '192.168.' ||
                            details.address.substring(0, 7) === '172.16.' ||
                            details.address.substring(0, 3) === '10.'
                        ) {
                            if (!ip.startsWith('192.168.') ||
                                (ip2.startsWith('192.168.') && !ip.startsWith('192.168.')) &&
                                (ip2.startsWith('172.16.') && !ip.startsWith('192.168.') && !ip.startsWith('172.16.')) ||
                                (ip2.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('172.16.') && !ip.startsWith('10.'))
                            ){ip = details.address;}
                            ++alias;
                        }
                    }
                }
            });
        }
        return ip;
    }

    private stream(device: any, song: any, artist: any, album: any, albumart: any) {
        let castMode = 'googlecast';
        let UPNPDesc = '';
        castMode = device.type;
        UPNPDesc = device.location;

        let client;
        if (castMode === 'googlecast') {
            let client = new this.audioClient();
            client.volume = 100;
            client.stepInterval = 0.5;
            client.muted = false;

            client.connect(device.host, () => {
                // console.log('connected, launching app ...', 'http://' + this.getIp() + ':' + server.address().port + '/');
                if (!this.connectedHosts[device.host]) {
                    this.connectedHosts[device.host] = client;
                    this.activeConnections.push(client);
                }
                this.loadMedia(client, song, artist, album, albumart);
            });

            client.on('close', () => {
                console.info("Client Closed");
                for (let i = this.activeConnections.length - 1; i >= 0; i--) {
                    if (this.activeConnections[i] === client) {
                        this.activeConnections.splice(i, 1);
                        return;
                    }
                }
            });

            client.on('error', (err: any) => {
                console.log('Error: %s', err.message);
                client.close();
                delete this.connectedHosts[device.host];
            });

        } else {
            // upnp devices
            //try {
            //     client = new MediaRendererClient(UPNPDesc);
            //     const options = {
            //         autoplay: true,
            //         contentType: 'audio/x-wav',
            //         dlnaFeatures: 'DLNA.ORG_PN=-;DLNA.ORG_OP=01;DLNA.ORG_FLAGS=01700000000000000000000000000000',
            //         metadata: {
            //             title: 'Apple Music Electron',
            //             creator: 'Streaming ...',
            //             type: 'audio', // can be 'video', 'audio' or 'image'
            //             //  url: 'http://' + getIp() + ':' + server.address().port + '/',
            //             //  protocolInfo: 'DLNA.ORG_PN=MP3;DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000;
            //         }
            //     };

            //     client.load('http://' + getIp() + ':' + server.address().port + '/a.wav', options, function (err, _result) {
            //         if (err) throw err;
            //         console.log('playing ...');
            //     });

            // } catch (e) {
            // }
        }
    }

    private async setupGCServer() {
        return ''
    }


    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'Chromecast';
    public description: string = 'LastFM plugin for Cider';
    public version: string = '0.0.1';
    public author: string = 'vapormusic / Cider Collective';

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(utils: { getApp: () => any; getStore: () => any; }) {
        this._app = utils.getApp();
        this._store = utils.getStore()
    }

    /**
     * Runs on app ready
     */
    onReady(win: any): void {
        this._win = win;
        electron.ipcMain.on('getKnownCastDevices', (event) => {
            event.returnValue = this.castDevices
        });

        electron.ipcMain.on('performGCCast', (event, device, song, artist, album, albumart) => {
            // this.setupGCServer().then( () => {
            this._win.webContents.setAudioMuted(true);
            console.log(device);
            this.stream(device, song, artist, album, albumart);
            // })
        });

        electron.ipcMain.on('getChromeCastDevices', (_event, _data) => {
            this.searchForGCDevices();
        });

        electron.ipcMain.on('stopGCast', (_event) => {
            this._win.webContents.setAudioMuted(false);
            this.activeConnections.forEach((client: any) => {
                try{
                    client.stop();
                } catch(e){}
            })
            this.activeConnections = [];
            this.connectedHosts = {};

        })
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {

    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: any): void {

    }

    onRendererReady(): void {
        this._win.webContents.executeJavaScript(
            `ipcRenderer.sendSync('get-port')`
        ).then((result: any) => { 
            this.ciderPort = result;       
        });
    }

}