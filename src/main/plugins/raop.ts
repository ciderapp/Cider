import electron from "electron";
import fetch from "node-fetch";
import { Stream } from "stream";
import { Worker } from "worker_threads";
import mdnsjs from "mdns-js";

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
  // private device: any;
  private mdns = mdnsjs;
  private ok: any = 1;
  private devices: any = [];
  private castDevices: any = [];
  private i: any = false;
  private audioStream: any = new Stream.PassThrough();
  private ffmpeg: any = null;
  private worker: any = null;

  private processNode = `
  const {
    Worker, isMainThread, parentPort, workerData
  } = require('node:worker_threads');
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
    // console.log(this.castDevices.findIndex((item: any) => {return (item.name == host.replace(".local","") && item.port == port )}))

    let d = "";
    let audiook = true;
    try {
      d = text.filter((u: any) => String(u).startsWith("features="));
      if (d.length == 0) d = text.filter((u: any) => String(u).startsWith("ft="));
      let features_set = d.length > 0 ? d[0].substring(d[0].indexOf("=") + 1).split(",") : [];
      let features = [...(features_set.length > 0 ? parseInt(features_set[0]).toString(2).split("") : []), ...(features_set.length > 1 ? parseInt(features_set[1]).toString(2).split("") : [])];
      if (features.length > 0) {
        audiook = features[features.length - 1 - 9] == "1";
      }
    } catch (_) {}
    if (audiook) {
      let shown_name = name;
      try {
        let model = text.filter((u: any) => String(u).startsWith("model="));
        let manufacturer = text.filter((u: any) => String(u).startsWith("manufacturer="));
        let name1 = text.filter((u: any) => String(u).startsWith("name="));
        if (name1.length > 0) {
          shown_name = name1[0].split("=")[1];
        } else if (manufacturer.length > 0) {
          shown_name = (manufacturer.length > 0 ? manufacturer[0].substring(13) : "") + " " + (model.length > 0 ? model[0].substring(6) : "");
          shown_name = shown_name.trim().length > 1 ? shown_name : (host ?? "Unknown").replace(".local", "");
        }
      } catch (e) {}
      let host_name = addresses != null && typeof addresses == "object" && addresses.length > 0 ? addresses[0] : typeof addresses == "string" ? addresses : "";

      if (
        this.castDevices.findIndex((item: any) => {
          return item != null && item.name == shown_name && item.host == host_name && item.host != "Unknown";
        }) == -1
      ) {
        this.castDevices.push({
          name: shown_name,
          host: host_name,
          port: port,
          addresses: addresses,
          txt: text,
          airplay2: airplay2,
        });
        // if (this.devices.indexOf(host_name) === -1) {
        //   this.devices.push(host_name);
        // }
        if (shown_name) {
          this._win.webContents.executeJavaScript(`console.log('deviceFound','ip: ${host_name} name:${shown_name}')`).catch((err: any) => console.error(err));
          console.log("deviceFound", host_name, shown_name);
        }
      } else {
        this._win.webContents.executeJavaScript(`console.log('deviceFound (added)','ip: ${host_name} name:${shown_name}')`).catch((err: any) => console.error(err));
        console.log("deviceFound (added)", host_name, shown_name);
      }
    }
  }

  /**
   * Base Plugin Details (Eventually implemented into a GUI in settings)
   */
  public name: string = "RAOP";
  public description: string = "RAOP Plugin";
  public version: string = "0.0.1";
  public author: string = "vapormusic / Cider Collective";

  /**
   * Runs on plugin load (Currently run on application start)
   */
  constructor(utils: { getStore: () => any; getApp: () => any }) {
    this._utils = utils;
    console.debug(`[Plugin][${this.name}] Loading Complete.`);
    this._app = utils.getApp();
  }

  /**
   * Runs on app ready
   */
  async onReady(win: any): Promise<void> {
    this.u = (await import("airtunes2")).default;
    this._win = win;

    electron.ipcMain.on("getKnownAirplayDevices", (event) => {
      event.returnValue = this.castDevices;
    });

    electron.ipcMain.on("getAirplayDevice", (event, data) => {
      this.castDevices = [];
      console.debug("scan for airplay devices");

      const browser = this.mdns.createBrowser(this.mdns.tcp("raop"));
      browser.on("ready", browser.discover);

      browser.on("update", (service: any) => {
        if (service.addresses && service.fullname && service.fullname.includes("_raop._tcp")) {
          // console.log(service.txt)
          this._win.webContents.executeJavaScript(`console.log(
                    "${service.name} ${service.host}:${service.port} ${service.addresses} ${service.fullname}"
                )`);
          let itemname = service.fullname.substring(service.fullname.indexOf("@") + 1, service.fullname.indexOf("._raop._tcp"));
          this.ondeviceup(itemname, service.host, service.port, service.addresses, service.txt);
        }
      });

      const browser2 = this.mdns.createBrowser(this.mdns.tcp("airplay"));
      browser2.on("ready", browser2.discover);

      browser2.on("update", (service: any) => {
        if (service.addresses && service.fullname && service.fullname.includes("_airplay._tcp")) {
          // console.log(service.txt)
          this._win.webContents.executeJavaScript(`console.log(
                    "${service.name} ${service.host}:${service.port} ${service.addresses}"
                )`);
          let itemname = service.fullname.substring(service.fullname.indexOf("@") + 1, service.fullname.indexOf("._airplay._tcp"));
          this.ondeviceup(itemname, service.host, service.port, service.addresses, service.txt, true);
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

    electron.ipcMain.on("performAirplayPCM", (event, ipv4, ipport, sepassword, title, artist, album, artworkURL, txt, airplay2dv, silent) => {
      if (ipv4 != this.ipairplay || ipport != this.portairplay) {
        if (this.airtunes == null) {
          this.airtunes = new this.u();
        }
        this.ipairplay = ipv4;
        this.portairplay = ipport;
        let identifier = ipv4 + ":" + ipport + "ap";
        let idx = this.devices.findIndex((a: any) => {
          return a.id == identifier;
        });
        if (idx != -1) {
          delete this.devices[idx];
          this.devices = this.devices.filter((n: any) => n); // remove old controller
        }
        this.devices.push({
          id: identifier,
          ip: ipv4,
          port: ipport,
          state: 0,
          controller: this.airtunes.add(ipv4, {
            port: ipport,
            volume: airplay2dv ? 30 : 50,
            password: sepassword,
            txt: txt,
            airplay2: airplay2dv,
            debug: false,
            forceAlac: false,
          }),
        });

        idx = this.devices.findIndex((a: any) => {
          return a.id == identifier;
        });

        // console.log('lol', this.devices)
        this.devices[idx].controller.on("status", (status: any) => {
          console.log("device status", status);
          if (status == "ready") {
            this._win.webContents.setAudioMuted(true);
            this._win.webContents.executeJavaScript(`CiderAudio.sendAudio()`).catch((err: any) => console.error(err));
          }
          if (status == "need_password") {
            this._win.webContents.executeJavaScript(`app.setAirPlayCodeUI('${this.devices[idx].id}')`);
          }
          if (status == "pair_success") {
            this._win.webContents.executeJavaScript(`app.sendAirPlaySuccess(${silent},'${this.devices[idx].id}')`);
          }
          if (status == "pair_failed") {
            this._win.webContents.executeJavaScript(`app.sendAirPlayFailed()`);
            this.disconnectAirplay(this.devices[idx].id);
          }
          if (status == "stopped") {
            // this.airtunes.stopAll(() => {
            //   console.log("end");
            // });
            if (this.devices[idx]?.state != null && this.devices[idx].state != -1) this._win.webContents.executeJavaScript(`app.airplayDisconnect(true, ${JSON.stringify([ipv4, ipport, sepassword, title, artist, album, artworkURL, txt, airplay2dv])})`).catch((err: any) => console.error(err));
            // this.airtunes = null;
            // this.device = null;
            // this.ipairplay = "";
            // this.portairplay = "";
            // this.ok = 1;
          } else {
            setTimeout(() => {
              if (this.ok == 1) {
                console.log(this.devices[idx].controller.key, title ?? "", artist ?? "", album ?? "");
                this.airtunes.setTrackInfo(this.devices[idx].controller.key, title ?? "", artist ?? "", album ?? "");
                this.uploadImageAirplay(artworkURL);
                console.log("done", status);
                this.ok == 2;
              }
            }, 1000);
          }
        });
      }
    });

    electron.ipcMain.on("setAirPlayPasscode", (event, passcode, identifier) => {
      if (this.devices.length > 0) {
        let idx = this.devices.findIndex((a: any) => {
          return a.id == identifier;
        });
        if (idx != -1) {
          this.devices[idx].controller.setPasscode(passcode);
        }
      }
    });

    electron.ipcMain.on("setAirPlayVolume", (event, volume, identifier) => {
      if (this.devices.length > 0) {
        let idx = this.devices.findIndex((a: any) => {
          return a.id == identifier;
        });
        if (idx != -1) {
          this.devices[idx].controller.setVolume(volume);
        }
      }
    });

    electron.ipcMain.on("writeWAV", (event, leftbuffer, rightbuffer) => {
      if (this.airtunes != null) {
        if (this.worker == null) {
          try {
            // const toDataUrl = (js: any) => new URL(`data:text/javascript,${encodeURIComponent(js)}`);
            // let blob = new Blob([this.processNode], { type: 'application/javascript' });
            //Create new worker
            this.worker = new Worker(this.processNode, { eval: true });

            //Listen for a message from worker
            this.worker.on("message", (result: any) => {
              // fs.writeFile(join(electron.app.getPath('userData'), 'buffer.raw'), Buffer.from(Int8Array.from(result.outbuffer)),{flag: 'a+'}, function (err) {
              //     if (err) throw err;
              //     console.log('It\'s saved!');
              // });
              this.airtunes.circularBuffer.write(Buffer.from(new Uint8Array(result.outbuffer)));
            });

            this.worker.on("error", (error: any) => {
              console.log("worker err", error);
            });
            this.worker.postMessage({ buffer: [leftbuffer, rightbuffer] });
          } catch (e) {
            console.log(e);
          }

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
          this.worker.postMessage({ buffer: [leftbuffer, rightbuffer] });
        }
      }
    });

    electron.ipcMain.on("disconnectAirplay", (event, identifier = "") => {
      console.log("iden", identifier);
      this.disconnectAirplay(identifier);
    });

    electron.ipcMain.on("updateAirplayInfo", (event, title, artist, album, artworkURL) => {
      if (this.airtunes && this.devices.length > 0) {
        for (let i in this.devices) {
          console.log(this.devices[i].controller.key, title, artist, album);
          this.airtunes.setTrackInfo(this.devices[i].controller.key, title, artist, album);
        }
        this.uploadImageAirplay(artworkURL);
      }
    });

    electron.ipcMain.on("discordrpc:updateImage", (_event, imageurl) => {
      this.uploadImageAirplay(imageurl);
    });
  }
  private disconnectAirplay(identifier: any = "") {
    console.log("awdas");
    this._win.webContents
      .executeJavaScript(`app.airplayDisconnect(false, [], '${identifier}')`)
      .then(() => {
        if (identifier == "") {
          if (this.airtunes) {
            for (let i in this.devices) {
              this.devices[i].state = -1;
            }
            this.airtunes.stopAll(() => {
              console.log("endAll");
              this.airtunes = null;
              this.devices = [];
              this.airtunes = null;

              this.ipairplay = "";
              this.portairplay = "";
              this.ok = 1;
              this.i = false;
            });
          } else {
            this.devices = [];
          }
        } else {
          let idx = this.devices.findIndex((a: any) => {
            return a.id == identifier;
          });
          if (idx != -1) {
            this.devices[idx].state = -1;
            this.devices[idx].controller.stop(() => {
              console.log(this.devices[idx].id, "stopped");
            });

            delete this.devices[idx];
            this.devices = this.devices.filter((n: any) => n);
          }
        }
        if (this.devices.length == 0) {
          console.log("cleanup airtunes");
          this._win.webContents.setAudioMuted(false);
          this.airtunes = null;

          this.ipairplay = "";
          this.portairplay = "";
          this.ok = 1;
          this.i = false;
          this.devices = [];
        }
      })
      .catch((err: any) => console.error("lsdsd", err));
  }
  private uploadImageAirplay = (url: any) => {
    try {
      if (url != null && url != "") {
        //console.log(join(this._app.getPath('userData'), 'temp.png'), url);
        fetch(url)
          .then((res) => res.buffer())
          .then((buffer) => {
            if (this.airtunes && this.devices.length > 0) {
              for (let i in this.devices) {
                this.airtunes.setArtwork(this.devices[i].controller.key, buffer, "image/png");
              }
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Runs on app stop
   */
  onBeforeQuit(): void {}

  /**
   * Runs on song change
   * @param attributes Music Attributes
   */
  onNowPlayingItemDidChange(attributes: any): void {
    if (this.airtunes && this.devices.length > 0) {
      let title = attributes?.name ?? "";
      let artist = attributes?.artistName ?? "";
      let album = attributes?.albumName ?? "";
      for (let i in this.devices) {
        console.log(this.devices[i].controller.key, title, artist, album);
        this.airtunes.setTrackInfo(this.devices[i].controller.key, title, artist, album);
      }
      let artworkURL = attributes?.artwork?.url ?? null;

      if (artworkURL != null) {
        this.uploadImageAirplay(artworkURL.replace("{w}", "1024").replace("{h}", "1024"));
      }
    }
  }

  /**
   * Runs on playback State Change
   * @param attributes Music Attributes (attributes.status = current state)
   */
  onPlaybackStateDidChange(attributes: any): void {
    if (this.airtunes && this.devices.length > 0) {
      let title = attributes?.name ?? "";
      let artist = attributes?.artistName ?? "";
      let album = attributes?.albumName ?? "";
      for (let i in this.devices) {
        console.log(this.devices[i].controller.key, title, artist, album);
        this.airtunes.setTrackInfo(this.devices[i].controller.key, title, artist, album);
      }
      let artworkURL = attributes?.artwork?.url ?? null;

      if (artworkURL != null) {
        this.uploadImageAirplay(artworkURL.replace("{w}", "1024").replace("{h}", "1024"));
      }
    }
  }

  playbackTimeDidChange(attributes: any): void {
    // console.log(attributes)
    if (this.airtunes && this.devices.length > 0 && attributes?.currentPlaybackTime != null && attributes?.durationInMillis != null) {
      for (let i in this.devices) {
        this.airtunes.setProgress(this.devices[i].controller.key, Math.round(attributes.currentPlaybackTime), Math.floor(attributes.durationInMillis / 1000));
      }
    }
  }
}
