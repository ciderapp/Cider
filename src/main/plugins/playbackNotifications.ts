import fetch from "node-fetch";
import { app, nativeImage, Notification } from "electron";
import NativeImage = Electron.NativeImage;
import { createWriteStream } from "fs";
import { join } from "path";

export default class playbackNotifications {
  /**
   * Base Plugin Details (Eventually implemented into a GUI in settings)
   */
  public name: string = "Playback Notifications";
  public description: string = "Creates notifications on playback.";
  public version: string = "1.0.0";
  public author: string = "Core";
  public contributors: string[] = ["Core", "Monochromish"];

  private _utils: any;
  private _notification: Notification | undefined;
  private _artworkImage: { [key: string]: NativeImage } = {};
  private _artworkNums: string[] = [];

  /**
   * Creates playback notification
   * @param a: Music Attributes
   */
  createNotification(a: any): void {
    if (this._notification) {
      this._notification.close();
    }

    this._notification = new Notification({
      title: a.name,
      body: `${a.artistName} — ${a.albumName}`,
      silent: true,
      icon: this._artworkImage[a.artwork.url],
      urgency: "low",
      actions: [
        {
          type: "button",
          text: `${this._utils.getLocale(this._utils.getStoreValue("general.language"), "term.skip")}`,
        },
      ],
      toastXml: `
                <toast>
                    <audio silent="true" />
                    <visual>
                        <binding template="ToastImageAndText02">
                            <image id="1" src="${join(app.getPath("temp"), `${a.songId}-${a.artwork.url.split("/").pop()}`)}" name="Image" />
                            <text id="1">${a?.name.replace(/&/g, "&amp;")}</text>
                            <text id="2">${a?.artistName.replace(/&/g, "&amp;")} — ${a?.albumName.replace(/&/g, "&amp;")}</text>
                        </binding>
                    </visual>
                    <actions>
                        <action content="${this._utils.getLocale(this._utils.getStoreValue("general.language"), "term.playpause")}" activationType="protocol" arguments="cider://playpause/"/>
                        <action content="${this._utils.getLocale(this._utils.getStoreValue("general.language"), "term.next")}" activationType="protocol" arguments="cider://nextitem/"/>
                    </actions>
                </toast>`,
    });

    this._notification.on("click", (_: any) => {
      this._utils.getWindow().show();
      this._utils.getWindow().focus();
    });

    this._notification.on("close", (_: any) => {
      this._notification = undefined;
    });

    this._notification.on("action", (event: any, action: any) => {
      this._utils.playback.next();
    });

    this._notification.show();
  }

  /*******************************************************************************************
   * Public Methods
   * ****************************************************************************************/

  /**
   * Runs on plugin load (Currently run on application start)
   */
  constructor(utils: any) {
    this._utils = utils;
    console.debug(`[Plugin][${this.name}] Loading Complete.`);

    utils.getIPCMain().on("playbackNotifications:create", (event: any, a: any) => {
      a.artwork.url = a.artwork.url.replace("/{w}x{h}bb", "/512x512bb").replace("/2000x2000bb", "/35x35bb");

      if (this._artworkNums.length > 20) {
        delete this._artworkImage[this._artworkNums[0]];
        this._artworkNums.shift();
      }

      if (this._artworkImage[a.artwork.url]) {
        this.createNotification(a);
      } else {
        if (process.platform === "win32") {
          fetch(a.artwork.url).then((res) => {
            console.log(join(app.getPath("temp"), `${a.songId}-${a.artwork.url.split("/").pop()}`));
            const dest = createWriteStream(join(app.getPath("temp"), `${a.songId}-${a.artwork.url.split("/").pop()}`));
            // @ts-ignore
            let stream = res.body.pipe(dest);
            stream.on("finish", () => {
              this.createNotification(a);
            });
          });
        } else {
          fetch(a.artwork.url).then(async (blob) => {
            this._artworkImage[a.artwork.url] = nativeImage.createFromBuffer(Buffer.from(await blob.arrayBuffer()));
            this._artworkNums[this._artworkNums.length] = a.artwork.url;
            this.createNotification(a);
          });
        }
      }
    });
  }
}
