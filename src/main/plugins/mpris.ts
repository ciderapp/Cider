// @ts-ignore
import * as Player from "mpris-service";

export default class mpris {
  /**
   * Private variables for interaction in plugins
   */
  private static utils: any;
  /**
   * MPRIS Service
   */
  private static player: Player.Player;
  /**
   * Base Plugin Details (Eventually implemented into a GUI in settings)
   */
  public name: string = "MPRIS Service";
  public description: string = "Handles MPRIS service calls for Linux systems.";
  public version: string = "1.0.0";
  public author: string = "Core";

  /*******************************************************************************************
   * Private Methods
   * ****************************************************************************************/

  /**
   * Runs on plugin load (Currently run on application start)
   */
  constructor(utils: any) {
    mpris.utils = utils;
    console.debug(`[Plugin][${mpris.name}] Loading Complete.`);
  }

  /**
   * Blocks non-linux systems from running this plugin
   * @private
   * @decorator
   */
  private static linuxOnly(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    if (process.platform !== "linux") {
      descriptor.value = function () {
        return;
      };
    }
  }

  /**
   * Connects to MPRIS Service
   */
  private static connect() {
    const player = Player({
      name: "cider",
      identity: "Cider",
      supportedInterfaces: ["player"],
    });

    console.debug(`[${mpris.name}:connect] Successfully connected.`);

    const renderer = mpris.utils.getWindow().webContents;
    const loopType: { [key: string]: number } = {
      none: 0,
      track: 1,
      playlist: 2,
    };

    player.on("next", () => mpris.utils.playback.next());
    player.on("previous", () => mpris.utils.playback.previous());
    player.on("playpause", () => mpris.utils.playback.playPause());
    player.on("play", () => mpris.utils.playback.play());
    player.on("pause", () => mpris.utils.playback.pause());
    player.on("quit", () => mpris.utils.getApp().exit());
    player.on("position", (args: { position: any }) => mpris.utils.playback.seek(args.position / 1000 / 1000));
    player.on("loopStatus", (status: string) => renderer.executeJavaScript(`app.mk.repeatMode = ${loopType[status.toLowerCase()]}`));
    player.on("shuffle", () => renderer.executeJavaScript("app.mk.shuffleMode = (app.mk.shuffleMode === 0) ? 1 : 0"));

    mpris.utils.getIPCMain().on("mpris:playbackTimeDidChange", (event: any, time: number) => {
      player.getPosition = () => time;
    });

    mpris.utils.getIPCMain().on("repeatModeDidChange", (_e: any, mode: number) => {
      switch (mode) {
        case 0:
          player.loopStatus = Player.LOOP_STATUS_NONE;
          break;
        case 1:
          player.loopStatus = Player.LOOP_STATUS_TRACK;
          break;
        case 2:
          player.loopStatus = Player.LOOP_STATUS_PLAYLIST;
          break;
      }
    });

    mpris.utils.getIPCMain().on("shuffleModeDidChange", (_e: any, mode: number) => {
      player.shuffle = mode === 1;
    });

    mpris.player = player;
  }

  /**
   * Update M.P.R.I.S Player Attributes
   */
  private static updateMetaData(attributes: any) {
    mpris.player.metadata = {
      "mpris:trackid": mpris.player.objectPath(`track/${attributes.playParams.id.replace(/[.]+/g, "")}`),
      "mpris:length": attributes.durationInMillis * 1000, // In microseconds
      "mpris:artUrl": attributes.artwork.url.replace("/{w}x{h}bb", "/512x512bb").replace("/2000x2000bb", "/35x35bb"),
      "xesam:title": `${attributes.name}`,
      "xesam:album": `${attributes.albumName}`,
      "xesam:artist": [`${attributes.artistName}`],
      "xesam:genre": attributes.genreNames,
    };
  }

  /*******************************************************************************************
   * Public Methods
   * ****************************************************************************************/

  /**
   * Clear state
   * @private
   */
  private static clearState() {
    if (!mpris.player) {
      return;
    }
    mpris.player.metadata = {
      "mpris:trackid": "/org/mpris/MediaPlayer2/TrackList/NoTrack",
    };
    mpris.player.playbackStatus = Player.PLAYBACK_STATUS_STOPPED;
  }

  /**
   * Runs on app ready
   */
  @mpris.linuxOnly
  onReady(_: any): void {
    console.debug(`[${mpris.name}:onReady] Ready.`);
  }

  /**
   * Renderer ready
   */
  @mpris.linuxOnly
  onRendererReady(): void {
    mpris.connect();
  }

  /**
   * Runs on app stop
   */
  @mpris.linuxOnly
  onBeforeQuit(): void {
    console.debug(`[Plugin][${mpris.name}] Stopped.`);
    mpris.clearState();
  }

  /**
   * Runs on playback State Change
   * @param attributes Music Attributes (attributes.status = current state)
   */
  @mpris.linuxOnly
  onPlaybackStateDidChange(attributes: any): void {
    mpris.player.playbackStatus = attributes?.status ? Player.PLAYBACK_STATUS_PLAYING : Player.PLAYBACK_STATUS_PAUSED;
  }

  /**
   * Runs on song change
   * @param attributes Music Attributes
   */
  @mpris.linuxOnly
  onNowPlayingItemDidChange(attributes: object): void {
    mpris.updateMetaData(attributes);
  }
}
