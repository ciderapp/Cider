let i = 1,
  k = 1;
class ExamplePlugin {
  /**
   * Private variables for interaction in plugins
   */
  private _win: any;
  private _app: any;
  private _store: any;

  /**
   * Base Plugin Details (Eventually implemented into a GUI in settings)
   */
  public name: string = "examplePlugin";
  public description: string = "Example plugin";
  public version: string = "1.0.0";
  public author: string = "Example author";

  /**
   * Runs on plugin load (Currently run on application start)
   */
  constructor(app: any, store: any) {
    this._app = app;
    this._store = store;
    console.debug(`[Plugin][${this.name}] Loading Complete.`);
  }

  /**
   * Runs on app ready
   */
  onReady(win: any): void {
    this._win = win;
    console.debug(`[Plugin][${this.name}] Ready.`);
  }

  /**
   * Runs on app stop
   */
  onBeforeQuit(): void {
    console.debug(`[Plugin][${this.name}] Stopped.`);
  }

  /**
   * Runs on playback State Change
   * @param attributes Music Attributes (attributes.status = current state)
   */
  onPlaybackStateDidChange(attributes: object): void {
    console.log("onPlaybackStateDidChange has been called " + i + " times");
    i++;
  }

  /**
   * Runs on song change
   * @param attributes Music Attributes
   */
  onNowPlayingItemDidChange(attributes: object): void {
    console.log("onNowPlayingDidChange has been called " + k + " times");
    k++;
  }
}

module.exports = ExamplePlugin;
