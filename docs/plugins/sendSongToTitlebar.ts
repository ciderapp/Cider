class sendSongToTitlebar {
  /**
   * Base Plugin Details (Eventually implemented into a GUI in settings)
   */
  public name: string = "sendSongToTitlebar";
  public description: string = "Sets the app's titlebar to the Song title";
  public version: string = "0.0.1";
  public author: string = "Cider Collective (credit to 8times9 via #147)";
  /**
   * Runs on plugin load (Currently run on application start)
   */
  private _win: any;
  private _app: any;
  constructor() {}
  /**
   * Runs on app ready
   */
  onReady(win: any): void {
    this._win = win;
  }
  /**
   * Runs on app stop
   */
  onBeforeQuit(): void {}
  /**
   * Runs on playback State Change
   * @param attributes Music Attributes (attributes.status = current state)
   */
  onPlaybackStateDidChange(attributes: any): void {
    this._win.setTitle(`${attributes != null && attributes.name != null && attributes.name.length > 0 ? attributes.name + " - " : ""}Cider`);
  }
  /**
   * Runs on song change
   * @param attributes Music Attributes
   */
  onNowPlayingItemDidChange(attributes: object): void {}
}

module.exports = sendSongToTitlebar;
