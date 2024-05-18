import { nativeImage, nativeTheme } from "electron";
import { utils } from "../base/utils.js";
import { join } from "path";

export default class Thumbar {
  /**
   * Private variables for interaction in plugins
   */
  private _win: any;
  private _app: any;

  /**
   * Base Plugin Details (Eventually implemented into a GUI in settings)
   */
  public name: string = "Thumbnail Toolbar Plugin";
  public description: string = "Creates and managed the thumbnail toolbar buttons and their events";
  public version: string = "1.0.0";
  public author: string = "Core";

  /**
   * Thumbnail Toolbar Assets
   */
  private icons: { [key: string]: Electron.NativeImage } = {
    pause: nativeImage.createFromPath(join(utils.getPath("resourcePath"), "icons/thumbar", `${nativeTheme.shouldUseDarkColors ? "light" : "dark"}_pause.png`)),
    play: nativeImage.createFromPath(join(utils.getPath("resourcePath"), "icons/thumbar", `${nativeTheme.shouldUseDarkColors ? "light" : "dark"}_play.png`)),
    next: nativeImage.createFromPath(join(utils.getPath("resourcePath"), "icons/thumbar", `${nativeTheme.shouldUseDarkColors ? "light" : "dark"}_next.png`)),
    previous: nativeImage.createFromPath(join(utils.getPath("resourcePath"), "icons/thumbar", `${nativeTheme.shouldUseDarkColors ? "light" : "dark"}_previous.png`)),
  };

  /*******************************************************************************************
   * Private Methods
   * ****************************************************************************************/

  /**
   * Blocks non-windows systems from running this plugin
   * @private
   * @decorator
   */
  private static windowsOnly(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    if (process.platform !== "win32") {
      descriptor.value = function () {
        return;
      };
    }
  }

  /**
   * Update the thumbnail toolbar
   */
  private updateButtons(attributes: any) {
    console.log(attributes);

    if (!attributes) {
      return;
    }

    const buttons = [
      {
        tooltip: "Previous",
        icon: this.icons.previous,
        click() {
          utils.playback.previous();
        },
      },
      {
        tooltip: attributes.status ? "Pause" : "Play",
        icon: attributes.status ? this.icons.pause : this.icons.play,
        click() {
          utils.playback.playPause();
        },
      },
      {
        tooltip: "Next",
        icon: this.icons.next,
        click() {
          utils.playback.next();
        },
      },
    ];

    if (!attributes.playParams || attributes.playParams.id === "no-id-found") {
      this._win.setThumbarButtons([]);
    } else {
      this._win.setThumbarButtons(buttons);
    }
  }

  /*******************************************************************************************
   * Public Methods
   * ****************************************************************************************/

  /**
   * Runs on plugin load (Currently run on application start)
   */
  constructor(a: { getApp: () => any }) {
    this._app = utils.getApp();
    console.debug(`[Plugin][${this.name}] Loading Complete.`);
  }

  /**
   * Runs on app ready
   */
  @Thumbar.windowsOnly
  onReady(win: Electron.BrowserWindow): void {
    this._win = win;
    console.debug(`[Plugin][${this.name}] Ready.`);
  }

  /**
   * Runs on app stop
   */
  @Thumbar.windowsOnly
  onBeforeQuit(): void {
    console.debug(`[Plugin][${this.name}] Stopped.`);
  }

  /**
   * Runs on playback State Change
   * @param attributes Music Attributes (attributes.status = current state)
   */
  @Thumbar.windowsOnly
  onPlaybackStateDidChange(attributes: object): void {
    this.updateButtons(attributes);
  }

  /**
   * Runs on song change
   * @param attributes Music Attributes
   */
  @Thumbar.windowsOnly
  onNowPlayingItemDidChange(attributes: object): void {
    this.updateButtons(attributes);
  }
}
