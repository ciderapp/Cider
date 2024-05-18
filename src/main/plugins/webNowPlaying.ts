import WebSocket from "ws";

/**
 * 0-pad a number.
 * @param {Number} number
 * @param {Number} length
 * @returns String
 */
const pad = (number: number, length: number) => String(number).padStart(length, "0");

/**
 * Convert seconds to a time string acceptable to Rainmeter
 * https://github.com/tjhrulz/WebNowPlaying-BrowserExtension/blob/master/WebNowPlaying.js#L50-L59
 * @param {Number} timeInSeconds
 * @returns String
 */
const convertTimeToString = (timeInSeconds: number) => {
  const timeInMinutes = Math.floor(timeInSeconds / 60);
  if (timeInMinutes < 60) {
    return timeInMinutes + ":" + pad(Math.floor(timeInSeconds % 60), 2);
  }
  return Math.floor(timeInMinutes / 60) + ":" + pad(Math.floor(timeInMinutes % 60), 2) + ":" + pad(Math.floor(timeInSeconds % 60), 2);
};

export default class WebNowPlaying {
  /**
   * Base Plugin Details (Eventually implemented into a GUI in settings)
   */
  public name: string = "WebNowPlaying";
  public description: string = "Song info and playback control for the Rainmeter WebNowPlaying plugin.";
  public version: string = "1.0.1";
  public author: string = "Zennn <me@jozen.blue>";

  private _win: any;
  private ws?: WebSocket;
  private wsapiConn?: WebSocket;
  private playerName: string = "Cider";

  constructor() {
    console.debug(`[Plugin][${this.name}] Loading Complete.`);
  }

  /**
   * Blocks non-windows systems from running this plugin
   * @private
   * @decorator
   */
  private static windowsOnly(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    if (process.platform !== "win32") {
      descriptor.value = () => void 0;
    }
  }

  private sendSongInfo(attributes: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const fields = ["STATE", "TITLE", "ARTIST", "ALBUM", "COVER", "DURATION", "POSITION", "VOLUME", "REPEAT", "SHUFFLE"];
    fields.forEach((field) => {
      try {
        let value: any = "";
        switch (field) {
          case "STATE":
            value = attributes.status ? 1 : 2;
            break;
          case "TITLE":
            value = attributes.name;
            break;
          case "ARTIST":
            value = attributes.artistName;
            break;
          case "ALBUM":
            value = attributes.albumName;
            break;
          case "COVER":
            value = attributes.artwork.url.replace("{w}", attributes.artwork.width).replace("{h}", attributes.artwork.height);
            break;
          case "DURATION":
            value = convertTimeToString(attributes.durationInMillis / 1000);
            break;
          case "POSITION":
            value = convertTimeToString((attributes.durationInMillis - attributes.remainingTime) / 1000);
            break;
          case "VOLUME":
            value = attributes.volume * 100;
            break;
          case "REPEAT":
            value = attributes.repeatMode;
            break;
          case "SHUFFLE":
            value = attributes.shuffleMode;
            break;
        }
        this.ws?.send(`${field}:${value}`);
      } catch (error) {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(`Error:Error updating ${field} for ${this.playerName}`);
          this.ws.send(`ErrorD:${error}`);
        }
      }
    });
  }

  private fireEvent(evt: WebSocket.MessageEvent) {
    if (!evt.data) return;
    const data = <string>evt.data;

    let value: string = "";
    if (data.split(/ (.+)/).length > 1) {
      value = data.split(/ (.+)/)[1];
    }
    const eventName = data.split(" ")[0].toLowerCase();

    try {
      switch (eventName) {
        case "playpause":
          this._win.webContents.executeJavaScript("MusicKitInterop.playPause()").catch(console.error);
          break;
        case "next":
          this._win.webContents.executeJavaScript("MusicKitInterop.next()").catch(console.error);
          break;
        case "previous":
          this._win.webContents.executeJavaScript("MusicKitInterop.previous()").catch(console.error);
          break;
        case "setposition":
          this._win.webContents.executeJavaScript(`MusicKit.getInstance().seekToTime(${parseFloat(value)})`);
          break;
        case "setvolume":
          this._win.webContents.executeJavaScript(`MusicKit.getInstance().volume = ${parseFloat(value) / 100}`);
          break;
        case "repeat":
          this._win.webContents.executeJavaScript("wsapi.toggleRepeat()").catch(console.error);
          break;
        case "shuffle":
          this._win.webContents.executeJavaScript("wsapi.toggleShuffle()").catch(console.error);
          break;
        case "togglethumbsup":
          // not implemented
          break;
        case "togglethumbsdown":
          // not implemented
          break;
        case "rating":
          // not implemented
          break;
      }
    } catch (error) {
      console.debug(error);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(`Error:Error sending event to ${this.playerName}`);
        this.ws.send(`ErrorD:${error}`);
      }
    }
  }

  /**
   * Runs on app ready
   */
  @WebNowPlaying.windowsOnly
  public onReady(win: any) {
    this._win = win;

    // Connect to Rainmeter plugin and retry on disconnect.
    const init = () => {
      try {
        this.ws = new WebSocket("ws://127.0.0.1:8974/");
        let retry: NodeJS.Timeout;
        this.ws.onopen = () => {
          console.info("[WebNowPlaying] Connected to Rainmeter");
          this.ws?.send(`PLAYER:${this.playerName}`);
        };

        this.ws.onclose = () => {
          clearTimeout(retry);
          retry = setTimeout(init, 2000);
        };

        this.ws.onerror = () => {
          clearTimeout(retry);
          this.ws?.close();
        };

        this.ws.onmessage = this.fireEvent?.bind(this);
      } catch (error) {
        console.error(error);
      }
    };

    init();

    // Connect to wsapi. Only used to update progress.
    try {
      this.wsapiConn = new WebSocket("ws://127.0.0.1:26369/");

      this.wsapiConn.onopen = () => {
        console.info("[WebNowPlaying] Connected to wsapi");
      };

      this.wsapiConn.onmessage = (evt: WebSocket.MessageEvent) => {
        const response = JSON.parse(<string>evt.data);
        if (response.type === "playbackStateUpdate") {
          this.sendSongInfo(response.data);
        }
      };
    } catch (error) {
      console.error(error);
    }

    console.debug(`[Plugin][${this.name}] Ready.`);
  }

  /**
   * Runs on app stop
   */
  @WebNowPlaying.windowsOnly
  public onBeforeQuit() {
    if (this.ws) {
      this.ws.send("STATE:0");
      this.ws.onclose = () => void 0; // disable onclose handler first to stop it from retrying
      this.ws.close();
    }
    if (this.wsapiConn) {
      this.wsapiConn.close();
    }
    console.debug(`[Plugin][${this.name}] Stopped.`);
  }

  /**
   * Runs on playback State Change
   * @param attributes Music Attributes (attributes.status = current state)
   */
  @WebNowPlaying.windowsOnly
  public onPlaybackStateDidChange(attributes: any) {
    this.sendSongInfo(attributes);
  }

  /**
   * Runs on song change
   * @param attributes Music Attributes
   */
  @WebNowPlaying.windowsOnly
  public onNowPlayingItemDidChange(attributes: any) {
    this.sendSongInfo(attributes);
  }
}
