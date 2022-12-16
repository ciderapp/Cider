import { join } from "path";
import { app, BrowserWindow as bw, ipcMain, ShareMenu, shell, screen, dialog, nativeTheme } from "electron";
import * as windowStateKeeper from "electron-window-state";
import * as express from "express";
import * as getPort from "get-port";
import { search } from "youtube-search-without-api-key";
import { existsSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync, unlinkSync, rmdirSync, lstatSync } from "fs";
import { Stream } from "stream";
import { networkInterfaces } from "os";
import * as mm from "music-metadata";
import fetch from "electron-fetch";
import { wsapi } from "./wsapi";
import { utils } from "./utils";
import { Plugins } from "./plugins";
import { watch } from "chokidar";
import * as os from "os";
import wallpaper from "wallpaper";
import * as AdmZip from "adm-zip";
import { LocalFiles } from "../providers/local/";

/**
 * @file Creates the BrowserWindow
 * @author CiderCollective
 */

/** @namespace */
export class BrowserWindow {
  public static win: any | undefined = null;
  private devMode: boolean = !app.isPackaged;
  public static express: any | undefined = null;

  private audioStream: any = new Stream.PassThrough();
  private headerSent: any = false;
  private chromecastIP: any = [];
  private clientPort: number = 0;
  private remotePort: number = 6942;
  private EnvironmentVariables: object = {
    env: {
      platform: process.platform,
      dev: app.isPackaged,
      osRelease: os.release(),
      updatable: !process.windowsStore || !process.mas,
      useV3: utils.getStoreValue("advanced.experiments").includes("ampv3"),
      components: [
        "pages/podcasts",
        "pages/apple-account-settings",
        "pages/library-songs",
        "pages/library-albums",
        "pages/library-artists",
        "pages/library-recentlyadded",
        "pages/browse",
        "pages/groupings",
        "pages/charts",
        //"pages/installed-themes",
        "pages/listen_now",
        "pages/radio",
        "pages/home",
        "pages/artist-feed",
        "pages/cider-playlist",
        "pages/playlist-inline",
        "pages/recordLabel",
        "pages/cider-multiroom",
        "pages/collection-list",
        "pages/apple-curator",
        "pages/artist",
        "pages/search",
        "pages/about",
        "pages/library-videos",
        "pages/remote-pair",
        //"pages/themes-github",
        //"pages/plugins-github",
        "pages/replay",
        "pages/audiolabs",
        "pages/zoo",
        "pages/plugin-renderer",
        "pages/oobe",
        "pages/cider-profile",
        "components/app-content",
        "components/sidebar",
        "components/mediaitem-artwork",
        "components/artwork-material",
        "components/menu-panel",
        "components/sidebar-playlist",
        "components/audio-settings",
        "components/plugin-menu",
        "components/audio-controls",
        "components/audio-playbackrate",
        "components/qrcode-modal",
        "components/moreinfo-modal",
        "components/equalizer",
        "components/add-to-playlist",
        "components/queue",
        "components/smarthints",
        "components/mediaitem-scroller-horizontal",
        "components/mediaitem-scroller-horizontal-large",
        "components/mediaitem-scroller-horizontal-sp",
        "components/mediaitem-scroller-horizontal-mvview",
        "components/mediaitem-list-item",
        "components/mediaitem-hrect",
        "components/mediaitem-square",
        "components/mediaitem-mvview",
        // "components/libraryartist-item",
        "components/listennow-child",
        "components/mediaitem-mvview-sp",
        "components/animatedartwork-view",
        "components/listitem-horizontal",
        "components/lyrics-view",
        "components/fullscreen",
        "components/miniplayer",
        "components/castmenu",
        "components/pathmenu",
        "components/airplay-modal",
        "components/artist-chip",
        "components/hello-world",
        "components/inline-collection-list",
        "components/settings-window",
        "components/pagination",
        "components/settings-keybinds",
        "components/settings-themes",
        "components/settings-themes-github",
        "components/settings-plugins-github",
      ],
      appRoutes: [
        {
          page: "lzedit",
          component: `<i18n-editor></i18n-editor>`,
          condition: "$root.page == 'lzedit'",
        },
        {
          page: "library-recentlyadded",
          component: `<cider-recentlyadded></cider-recentlyadded>`,
          condition: "$root.page == 'library-recentlyadded'",
        },
        {
          page: "plugin-renderer",
          component: `<plugin-renderer></plugin-renderer>`,
          condition: "$root.page == 'plugin-renderer'",
        },
        {
          page: "zoo",
          component: "<cider-zoo></cider-zoo>",
          condition: "$root.page == 'zoo'",
        },
        {
          page: "podcasts",
          component: `<apple-podcasts></apple-podcasts>`,
          condition: `$root.page == 'podcasts'`,
        },
        {
          page: "library-videos",
          component: `<cider-library-videos></cider-library-videos>`,
          condition: `$root.page == 'library-videos'`,
        },
        {
          page: "apple-account-settings",
          component: `<apple-account-settings></apple-account-settings>`,
          condition: `$root.page == 'apple-account-settings'`,
        },
        {
          page: "about",
          component: `<about-page></about-page>`,
          condition: `$root.page == 'about'`,
        },
        {
          page: "cider-artist",
          component: `<cider-artist :data="$root.artistPage.data"></cider-artist>`,
          condition: `$root.page == 'artist-page' && $root.artistPage.data.attributes`,
        },
        {
          page: "collection-list",
          component: `<cider-collection-list :data="$root.collectionList.response" :type="$root.collectionList.type" :title="$root.collectionList.title"></cider-collection-list>`,
          condition: `$root.page == 'collection-list'`,
        },
        {
          page: "home",
          component: `<cider-home></cider-home>`,
          condition: `$root.page == 'home'`,
        },
        {
          page: "artist-feed",
          component: `<cider-artist-feed></cider-artist-feed>`,
          condition: `$root.page == 'artist-feed'`,
        },
        {
          page: "playlist-inline",
          component: `<playlist-inline :data="$root.showingPlaylist"></playlist-inline>`,
          condition: `$root.modals.showPlaylist`,
        },
        {
          page: "playlist_",
          component: `<cider-playlist :data="$root.showingPlaylist"></cider-playlist>`,
          condition: `$root.page.includes('playlist_')`,
        },
        {
          page: "album_",
          component: `<cider-playlist :data="$root.showingPlaylist"></cider-playlist>`,
          condition: `$root.page.includes('album_')`,
        },
        {
          page: "recordLabel_",
          component: `<cider-recordlabel :data="$root.showingPlaylist"></cider-recordlabel>`,
          condition: `$root.page.includes('recordLabel_')`,
        },
        {
          page: "social-profiles_",
          component: `<cider-socialprofile :data="$root.showingPlaylist"></cider-socialprofile>`,
          condition: `$root.page.includes('social-profiles_')`,
        },
        {
          page: "multiroom",
          component: `<cider-multiroom :data="$root.multiroom"></cider-multiroom>`,
          condition: `$root.page.includes('multiroom')`,
        },
        {
          page: "curator_",
          component: `<cider-recordlabel :data="$root.showingPlaylist"></cider-recordlabel>`,
          condition: `$root.page.includes('curator_')`,
        },
        {
          page: "browsepage",
          component: `<cider-browse :data="$root.browsepage"></cider-browse>`,
          condition: `$root.page == 'browse'`,
          onEnter: ``,
        },
        {
          page: "groupings",
          component: `<cider-groupings :data="$root.browsepage"></cider-groupings>`,
          condition: `$root.page == 'groupings'`,
          onEnter: ``,
        },
        {
          page: "charts",
          component: `<cider-charts :data="$root.browsepage"></cider-charts>`,
          condition: `$root.page == 'charts'`,
          onEnter: ``,
        },
        {
          page: "listen_now",
          component: `<cider-listen-now :data="$root.listennow"></cider-listen-now>`,
          condition: `$root.page == 'listen_now'`,
          onEnter: ``,
        },
        {
          page: "radio",
          component: `<cider-radio :data="$root.radio"></cider-radio>`,
          condition: `$root.page == 'radio'`,
          onEnter: ``,
        },
        {
          page: "settings",
          component: `<cider-settings></cider-settings>`,
          condition: `$root.page == 'settings'`,
        },
        {
          page: "installed-themes",
          component: `<installed-themes></installed-themes>`,
          condition: `$root.page == 'installed-themes'`,
        },
        {
          page: "search",
          component: `<cider-search :search="$root.search"></cider-search>`,
          condition: `$root.page == 'search'`,
        },
        {
          page: "library-songs",
          component: `<cider-library-songs :data="$root.library.songs"></cider-library-songs>`,
          condition: `$root.page == 'library-songs'`,
          onEnter: ``,
        },
        {
          page: "library-albums",
          component: `<cider-library-albums :data="$root.library.songs"></cider-library-albums>`,
          condition: `$root.page == 'library-albums'`,
          onEnter: ``,
        },
        {
          page: "library-artists",
          component: `<cider-library-artists></cider-library-artists>`,
          condition: `$root.page == 'library-artists'`,
          onEnter: ``,
        },
        {
          page: "appleCurator",
          component: `<cider-applecurator :data="$root.appleCurator"></cider-applecurator>`,
          condition: `$root.page.includes('appleCurator')`,
        },
        {
          page: "themes-github",
          component: `<themes-github></themes-github>`,
          condition: `$root.page == 'themes-github'`,
        },
        {
          page: "plugins-github",
          component: `<plugins-github></plugins-github>`,
          condition: `$root.page == 'plugins-github'`,
        },
        {
          page: "remote-pair",
          component: `<remote-pair></remote-pair>`,
          condition: `$root.page == 'remote-pair'`,
        },
        {
          page: "audiolabs",
          component: `<audiolabs-page></audiolabs-page>`,
          condition: `$root.page == 'audiolabs'`,
        },
        {
          page: "replay",
          component: `<replay-page></replay-page>`,
          condition: `$root.page == 'replay'`,
        },
        {
          page: "keydinds",
          component: `<keybinds-settings></keybinds-settings>`,
          condition: `$root.page == 'keybinds-settings'`,
        },
      ],
    },
  };
  private options: any = {
    icon: join(utils.getPath("resourcePath"), `icons/icon.` + (process.platform === "win32" ? "ico" : "png")),
    width: 1024,
    height: 600,
    x: undefined,
    y: undefined,
    minWidth: 900,
    minHeight: 390,
    frame: false,
    title: "Cider",
    show: false,
    // backgroundColor: "#1E1E1E",
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 15, y: 20 },
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true,
      sandbox: true,
      allowRunningInsecureContent: true,
      contextIsolation: false,
      webviewTag: true,
      plugins: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      preload: join(utils.getPath("srcPath"), "./preload/cider-preload.js"),
    },
  };

  public static watcher: any;

  StartWatcher(path: string) {
    BrowserWindow.watcher = watch(path, {
      ignored: /[\/\\]\./,
      persistent: true,
    });

    function onWatcherReady() {
      console.info("From here can you check for real changes, the initial scan has been completed.");
    }

    // Declare the listeners of the watcher
    BrowserWindow.watcher
      .on("add", function (path: string) {
        // console.log('File', path, 'has been added');
      })
      .on("addDir", function (path: string) {
        // console.log('Directory', path, 'has been added');
      })
      .on("change", function (path: string) {
        console.log("File", path, "has been changed");
        BrowserWindow.win.webContents.send("theme-update", "");
      })
      .on("unlink", function (path: string) {
        // console.log('File', path, 'has been removed');
      })
      .on("unlinkDir", function (path: string) {
        // console.log('Directory', path, 'has been removed');
      })
      .on("error", function (error: string) {
        // console.log('Error happened', error);
      })
      .on("ready", onWatcherReady)
      .on("raw", function (event: any, path: any, details: any) {
        // This event should be triggered everytime something happens.
        // console.log('Raw event info:', event, path, details);
      });
  }

  async StopWatcher() {
    await BrowserWindow.watcher.close();
  }

  /**
   * Creates the browser window
   * @generator
   * @function createWindow
   * @yields {object} Electron browser window
   */
  async createWindow(): Promise<Electron.BrowserWindow> {
    const envPort = process.env?.CIDER_PORT || "9000";
    this.clientPort = await getPort({ port: parseInt(envPort, 10) || 9000 });
    BrowserWindow.verifyFiles();
    this.StartWatcher(utils.getPath("themes"));

    // Load the previous state with fallback to defaults
    const windowState = windowStateKeeper({
      defaultWidth: 1024,
      defaultHeight: 600,
      fullScreen: false,
    });
    this.options.width = windowState.width;
    this.options.height = windowState.height;
    this.options.x = windowState.x;
    this.options.y = windowState.y;

    switch (process.platform) {
      default:
        break;
      case "win32":
        if (!(utils.getStoreValue("visual.transparent") ?? false)) {
          this.options.backgroundColor = "#1E1E1E";
        } else {
          this.options.transparent = true;
        }
        this.options.autoHideMenuBar = true;
        if (utils.getStoreValue("visual.nativeTitleBar")) {
          this.options.titleBarStyle = "visible";
          this.options.frame = true;
        }
        break;
      case "linux":
        this.options.backgroundColor = "#1E1E1E";
        this.options.autoHideMenuBar = true;
        if (utils.getStoreValue("visual.nativeTitleBar")) {
          this.options.titleBarStyle = "visible";
          this.options.frame = true;
        }
        break;
      case "darwin":
        this.options.transparent = true;
        this.options.vibrancy = "dark";
        this.options.hasShadow = true;
        break;
    }

    nativeTheme.themeSource = utils.getStoreValue("visual.overrideDisplayTheme");

    // Start the webserver for the browser window to load
    // LocalFiles.DB.init()
    this.startWebServer();

    BrowserWindow.win = new bw(this.options);
    // cant be built in CI
    // if (process.platform === "win32" && (utils.getStoreValue('visual.transparent') ?? false)) {
    //     var electronVibrancy = require('electron-vibrancy-updated');
    //     electronVibrancy.SetVibrancy(BrowserWindow.win, 0);

    // }
    const ws = new wsapi(BrowserWindow.win);
    ws.InitWebSockets();
    // and load the renderer.
    this.startSession();
    this.startHandlers();

    // Register listeners on Window to track size and position of the Window.
    windowState.manage(BrowserWindow.win);

    return BrowserWindow.win;
  }

  /**
   * Verifies the files for the renderer to use (Cache, library info, etc.)
   */
  private static verifyFiles(): void {
    const expectedDirectories = ["CiderCache"];
    const expectedFiles = ["library-songs.json", "library-artists.json", "library-albums.json", "library-playlists.json", "library-recentlyAdded.json"];
    for (let i = 0; i < expectedDirectories.length; i++) {
      if (!existsSync(join(app.getPath("userData"), expectedDirectories[i]))) {
        mkdirSync(join(app.getPath("userData"), expectedDirectories[i]));
      }
    }
    for (let i = 0; i < expectedFiles.length; i++) {
      const file = join(join(app.getPath("userData"), "CiderCache"), expectedFiles[i]);
      if (!existsSync(file)) {
        writeFileSync(file, JSON.stringify([]));
      }
    }
  }

  /**
   * Starts the webserver for the renderer process.
   */
  private startWebServer(): void {
    const app = express();
    BrowserWindow.express = app;
    app.use(express.static(join(utils.getPath("srcPath"), "./renderer/")));
    app.set("views", join(utils.getPath("srcPath"), "./renderer/views"));
    app.set("view engine", "ejs");
    let firstRequest = true;
    app.use((req, res, next) => {
      if (!req || !req.headers || !req.headers.host || !req.headers["user-agent"]) {
        console.error("Req not defined");
        return;
      }
      if (req.url.includes("api") || req.url.includes("audio.wav") || (req.headers.host.includes("localhost") && (this.devMode || req.headers["user-agent"].includes("Electron"))) || req.url.includes("/connect")) {
        next();
      } else {
        res.redirect("https://discord.gg/applemusic");
      }
    });

    app.get("/", (_req, res) => {
      res.render("main", this.EnvironmentVariables);
    });

    app.get("/audio/cideraudio.js", (_req, res) => {
      if (existsSync(join(utils.getPath("externals"), "/audio.js"))) {
        if (utils.getStoreValue("audio.maikiwiAudio.cloud") == true) {
          res.sendFile(join(utils.getPath("externals"), "/cloud/audio.js"));
        } else {
          res.sendFile(join(utils.getPath("externals"), "/audio.js"));
        }
      } else {
        res.sendFile(join(utils.getPath("srcPath"), "./renderer/audio/audio.js"));
      }
    });

    app.get("/cideraudio/impulses/:file", (req, res) => {
      const impulseExternals = join(utils.getPath("externals"), "/impulses/");
      const impulseFile = join(impulseExternals, req.params.file);
      if (existsSync(impulseFile)) {
        res.sendFile(impulseFile);
      } else {
        res.sendFile(join(utils.getPath("srcPath"), "./renderer/audio/impulses/" + req.params.file));
      }
    });

    app.get("/api/playback/:action", (req, res) => {
      const action = req.params.action;
      switch (action) {
        case "playpause":
          BrowserWindow.win.webContents.executeJavaScript("wsapi.togglePlayPause()");
          res.send("Play/Pause toggle");
          break;
        case "play":
          BrowserWindow.win.webContents.executeJavaScript("MusicKit.getInstance().play()");
          res.send("Playing");
          break;
        case "pause":
          BrowserWindow.win.webContents.executeJavaScript("MusicKit.getInstance().pause()");
          res.send("Paused");
          break;
        case "stop":
          BrowserWindow.win.webContents.executeJavaScript("MusicKit.getInstance().stop()");
          res.send("Stopped");
          break;
        case "next":
          BrowserWindow.win.webContents.executeJavaScript("if (MusicKit.getInstance().queue.nextPlayableItemIndex != -1 && MusicKit.getInstance().queue.nextPlayableItemIndex != null) {MusicKit.getInstance().changeToMediaAtIndex(MusicKit.getInstance().queue.nextPlayableItemIndex);}");
          res.send("Next");
          break;
        case "previous":
          BrowserWindow.win.webContents.executeJavaScript("if (MusicKit.getInstance().queue.previousPlayableItemIndex != -1 && MusicKit.getInstance().queue.previousPlayableItemIndex != null) {MusicKit.getInstance().changeToMediaAtIndex(MusicKit.getInstance().queue.previousPlayableItemIndex);}");
          res.send("Previous");
          break;
        default: {
          res.send("Invalid action");
        }
      }
    });

    app.get("/themes/:theme", (req, res) => {
      const theme = req.params.theme;
      const themePath = join(utils.getPath("srcPath"), "./renderer/themes/", theme);
      const userThemePath = join(utils.getPath("themes"), theme);
      if (existsSync(userThemePath)) {
        res.sendFile(userThemePath);
      } else if (existsSync(themePath)) {
        res.sendFile(themePath);
      } else {
        res.send(`// Theme not found - ${userThemePath}`);
      }
    });

    app.get("/themes/:theme/*", (req: { params: { theme: string; 0: string } }, res) => {
      const theme = req.params.theme;
      const file = req.params[0];
      const themePath = join(utils.getPath("srcPath"), "./renderer/themes/", theme);
      const userThemePath = join(utils.getPath("themes"), theme);
      if (existsSync(userThemePath)) {
        res.sendFile(join(userThemePath, file));
      } else if (existsSync(themePath)) {
        res.sendFile(join(themePath, file));
      } else {
        res.send(`// File not found - ${userThemePath}`);
      }
    });

    app.get("/plugins/:plugin/*", (req: { params: { plugin: string; 0: string } }, res) => {
      let plugin = req.params.plugin;
      if (Plugins.getPluginFromMap(plugin)) {
        plugin = Plugins.getPluginFromMap(plugin);
      }
      const file = req.params[0];
      const pluginPath = join(utils.getPath("plugins"), plugin);
      console.log(pluginPath);
      if (existsSync(pluginPath)) {
        res.sendFile(join(pluginPath, file));
      } else {
        res.send(`// Plugin not found - ${pluginPath}`);
      }
    });

    app.get("/audio.wav", (req, res) => {
      try {
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        if (!this.chromecastIP.includes(ip)) {
          this.headerSent = false;
          this.audioStream._readableState.buffer.clear();
          this.audioStream._readableState.length = 0;
          this.chromecastIP.push(ip);
        }
        req.socket.setTimeout(Number.MAX_SAFE_INTEGER);
        // CiderBase.requests.push({req: req, res: res});
        // var pos = CiderBase.requests.length - 1;
        req.on("close", () => {
          console.log("disconnected");
          this.headerSent = false;
          this.chromecastIP = this.chromecastIP.filter((item: any) => item !== ip);
        });

        this.audioStream.on("data", (data: any) => {
          try {
            res.write(data);
          } catch (ex) {
            console.log(ex);
          }
        });
      } catch (ex) {
        console.log(ex);
      }
    });
    //region Connect Integration
    app.get("/connect/set-cc-user/:data", (req, res) => {
      //utils.getStoreValue('connectUser', JSON.parse()) // [Connect] Save user in store
      utils.getWindow().webContents.send("setStoreValue", "connectUser", JSON.parse(req.params.data));
      res.redirect(`https://connect.cidercollective.dev/linked.html`);
    });

    LocalFiles.setupHandlers();

    // [Connect] Set auth URL in store for `shell.openExternal`
    utils.setStoreValue("cc_authURL", `https://connect.cidercollective.dev/callback/discord?app=cider&appPort=${this.clientPort}`);
    console.log(`[Connect] Auth URL: ${utils.getStoreValue("cc_authURL")}`);
    //endregion

    app.listen(this.clientPort, () => {
      console.log(`Cider client port: ${this.clientPort}`);
    });

    /*
     * Remote Client -@quacksire
     * https://github.com/ciderapp/Apple-Music-Electron/blob/818189ed40ff600d76eb59d22016723a75885cd5/resources/functions/handler.js#L1173
     */
    const remote = express();
    remote.use(express.static(join(utils.getPath("srcPath"), "./web-remote/")));
    remote.set("views", join(utils.getPath("srcPath"), "./web-remote/views"));
    remote.set("view engine", "ejs");
    getPort({ port: 6942 }).then((port: number) => {
      this.remotePort = port;
      // Start Remote Discovery
      this.broadcastRemote();
      remote.listen(this.remotePort, () => {
        console.log(`Cider remote port: ${this.remotePort}`);
        firstRequest = false;
      });
      remote.get("/", (_req, res) => {
        res.render("index", this.EnvironmentVariables);
      });
    });
  }

  /**
   * Starts the session for the renderer process.
   */
  private startSession(): void {
    // intercept "https://js-cdn.music.apple.com/hls.js/2.141.1/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
    BrowserWindow.win.webContents.session.webRequest.onBeforeRequest(
      {
        urls: ["https://*/*"],
      },
      (details: { url: string | string[] }, callback: (arg0: { redirectURL?: string; cancel?: boolean }) => void) => {
        if (details.url.includes("hls.js")) {
          callback({
            redirectURL: `http://localhost:${this.clientPort}/apple-hls.js`,
          });
        } else if (details.url.includes("ciderlocal") && !details.url.includes("https://apic-desktop.musixmatch.com")) {
          let text = details.url.toString().includes("ids=") ? decodeURIComponent(details.url.toString()).split("?ids=")[1] : decodeURIComponent(details.url.toString().substring(details.url.toString().lastIndexOf("/") + 1));
          //console.log('localurl',text)
          callback({
            redirectURL: `http://localhost:${this.clientPort}/ciderlocal/${Buffer.from(text).toString("base64url")}`,
          });
        } else {
          callback({
            cancel: false,
          });
        }
      }
    );

    BrowserWindow.win.webContents.session.webRequest.onBeforeSendHeaders(async (details: { url: string; requestHeaders: { [x: string]: string } }, callback: (arg0: { requestHeaders: any }) => void) => {
      if (details.url === "https://buy.itunes.apple.com/account/web/info") {
        details.requestHeaders["sec-fetch-site"] = "same-site";
        details.requestHeaders["DNT"] = "1";
        let itspod = await BrowserWindow.win.webContents.executeJavaScript(`window.localStorage.getItem("music.ampwebplay.itspod")`);
        if (itspod != null) details.requestHeaders["Cookie"] = `itspod=${itspod}`;
      }
      if (details.url.includes("apple.com")) {
        details.requestHeaders["DNT"] = "1";
        details.requestHeaders["authority"] = "amp-api.music.apple.com";
        details.requestHeaders["origin"] = "https://beta.music.apple.com";
        details.requestHeaders["referer"] = "https://beta.music.apple.com";
        details.requestHeaders["sec-fetch-dest"] = "empty";
        details.requestHeaders["sec-fetch-mode"] = "cors";
        details.requestHeaders["sec-fetch-site"] = "same-site";
      }
      if (details.url.startsWith("https://music.163.com")) {
        details.requestHeaders["Referer"] = "https://music.163.com/";
        details.requestHeaders["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cider/1.0.0 Chrome/96.0.4664.45 Electron/16.0.0 Safari/537.36";
      }
      if (details.url.includes("https://qq.com")) {
        (details.requestHeaders["Accept"] = "*/*"), (details.requestHeaders["Accept-Encoding"] = "gzip, deflate, br"), (details.requestHeaders["Accept-Language"] = "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6"), (details.requestHeaders["Referer"] = "https://y.qq.com/"), (details.requestHeaders["User-Agent"] = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X; zh-CN) AppleWebKit/537.51.1 (");
        ("KHTML, like Gecko) Mobile/17D50 UCBrowser/12.8.2.1268 Mobile AliApp(TUnionSDK/0.1.20.3) ");
      }
      if (details.url.includes("https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg")) {
        (details.requestHeaders["Accept"] = "*/*"), (details.requestHeaders["Accept-Encoding"] = "gzip, deflate, br"), (details.requestHeaders["Accept-Language"] = "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6"), (details.requestHeaders["User-Agent"] = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X; zh-CN) AppleWebKit/537.51.1 (");
        ("KHTML, like Gecko) Mobile/17D50 UCBrowser/12.8.2.1268 Mobile AliApp(TUnionSDK/0.1.20.3) ");
        details.requestHeaders["Referer"] = "https://y.qq.com/portal/player.html";
      }
      callback({ requestHeaders: details.requestHeaders });
    });

    let location = `http://localhost:${this.clientPort}/`;

    if (app.isPackaged) {
      BrowserWindow.win.loadURL(location);
    } else {
      BrowserWindow.win.loadURL(location, {
        userAgent: "Cider Development Environment",
      });
    }
  }

  /**
   * Initializes the window handlers
   */
  private startHandlers(): void {
    /**********************************************************************************************************************
     * ipcMain Events
     ****************************************************************************************************************** */

    ipcMain.handle("mkv3", async (event, args) => {
      const options = {
        route: "",
        token: "",
        mediaToken: "",
        GETBody: {},
      };
      Object.assign(options, args);

      let res = await fetch(
        `https://amp-api.music.apple.com/${options.route}?${new URLSearchParams({
          ...options.GETBody,
        }).toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${options.token}`,
            path: options.route,
            authority: "amp-api.music.apple.com",
            "media-user-token": options.mediaToken,
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cider/1.4.2 Chrome/100.0.4896.75 Electron/18.0.3 Safari/537.36",
          },
        }
      );
      let json = await res.json();
      return json;
    });

    ipcMain.on("get-wallpaper", async (event, args) => {
      const wpPath: string = await wallpaper.get();
      const Jimp = require("jimp");
      const img = await Jimp.read(wpPath);
      const blurAmount = args.blurAmount ?? 256;
      if (blurAmount) {
        img.blur(blurAmount);
      }
      const screens = await screen.getAllDisplays();
      const width = screens.reduce((a, b) => a + b.size.width, 0);
      const height = screens.reduce((a, b) => a + b.size.height, 0);

      img.cover(width, height, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_MIDDLE);
      const result = await img.getBase64Async(Jimp.MIME_PNG);

      event.returnValue = {
        path: wpPath,
        data: result,
        res: {
          width: width,
          height: height,
        },
      };
    });

    ipcMain.handle("uninstall-theme", async (event, path) => {
      await this.StopWatcher();
      const themesDir = utils.getPath("themes");
      // validate the path is in the themes directory
      try {
        if (path.startsWith(themesDir)) {
          // get last dir in path, can be either / or \ and may have a trailing slash
          const themeName = path.split(/[\\\/]/).pop();
          if (themeName == "Themes" || themeName == "themes") {
            BrowserWindow.win.webContents.send("theme-uninstalled", {
              path: path,
              status: 3,
            });
            return;
          }
          // if path is directory, delete it
          if (lstatSync(path).isDirectory()) {
            await rmdirSync(path, { recursive: true });
          } else {
            // if path is file, delete it
            await unlinkSync(path);
          }
          // return the path
          BrowserWindow.win.webContents.send("theme-uninstalled", {
            path: path,
            status: 0,
          });
        } else {
          BrowserWindow.win.webContents.send("theme-uninstalled", {
            path: path,
            status: 1,
          });
        }
      } catch (e: any) {
        BrowserWindow.win.webContents.send("theme-uninstalled", {
          path: path,
          message: e.message,
          status: 2,
        });
      }

      this.StartWatcher(utils.getPath("themes"));
    });

    ipcMain.handle("reinstall-widevine-cdm", () => {
      // remove WidevineCDM from appdata folder
      const widevineCdmPath = join(app.getPath("userData"), "./WidevineCdm");
      if (existsSync(widevineCdmPath)) {
        rmSync(widevineCdmPath, { recursive: true, force: true });
      }
      // reinstall WidevineCDM
      app.relaunch();
      app.exit();
    });

    ipcMain.handle("get-github-plugin", async (event, url) => {
      await this.StopWatcher();
      const returnVal = {
        success: true,
        theme: null,
        message: "",
      };
      try {
        if (!existsSync(utils.getPath("plugins"))) {
          mkdirSync(utils.getPath("plugins"));
        }
        if (url.endsWith("/")) url = url.slice(0, -1);
        let response = await utils.fetch(`${url}/archive/refs/heads/main.zip`);
        let repo = url.split("/").slice(-2).join("/");
        let apiRepo = await utils.fetch(`https://api.github.com/repos/${repo}`).then((res) => res.json());
        console.debug(`REPO ID: ${apiRepo.id}`);
        // extract the files from the first folder in the zip response
        let zip = new AdmZip(await response.buffer());
        let entry = zip.getEntries()[0];
        if (!existsSync(join(utils.getPath("plugins"), "gh_" + apiRepo.id))) {
          mkdirSync(join(utils.getPath("plugins"), "gh_" + apiRepo.id));
        }
        console.log(join(utils.getPath("plugins"), "gh_" + apiRepo.id));
        zip.extractEntryTo(entry, join(utils.getPath("plugins"), "gh_" + apiRepo.id), false, true);
        let commit = await utils.fetch(`https://api.github.com/repos/${repo}/commits`).then((res) => res.json());
        console.debug(`COMMIT SHA: ${commit[0].sha}`);
        let theme = JSON.parse(readFileSync(join(utils.getPath("plugins"), "gh_" + apiRepo.id, "package.json"), "utf8"));
        theme.id = apiRepo.id;
        theme.commit = commit[0].sha;
        writeFileSync(join(utils.getPath("plugins"), "gh_" + apiRepo.id, "package.json"), JSON.stringify(theme, null, 4), "utf8");
      } catch (e) {
        returnVal.success = false;
      }
      BrowserWindow.win.webContents.send("plugin-installed", returnVal);
      this.StartWatcher(utils.getPath("themes"));
    });

    ipcMain.handle("get-github-theme", async (event, url) => {
      await this.StopWatcher();
      const returnVal = {
        success: true,
        theme: null,
        message: "",
      };
      try {
        if (!existsSync(utils.getPath("themes"))) {
          mkdirSync(utils.getPath("themes"));
        }
        if (url.endsWith("/")) url = url.slice(0, -1);
        let response = await utils.fetch(`${url}/archive/refs/heads/main.zip`);
        let repo = url.split("/").slice(-2).join("/");
        let apiRepo = await utils
          .fetch(`https://api.github.com/repos/${repo}`, {
            headers: {
              "User-Agent": utils.getWindow().webContents.getUserAgent(),
            },
          })
          .then((res) => res.json());
        console.error(apiRepo);
        console.debug(`REPO ID: ${apiRepo.id}`);
        // extract the files from the first folder in the zip response
        let zip = new AdmZip(await response.buffer());
        let entry = zip.getEntries()[0];
        if (!existsSync(join(utils.getPath("themes"), "gh_" + apiRepo.id))) {
          mkdirSync(join(utils.getPath("themes"), "gh_" + apiRepo.id));
        }
        console.log(join(utils.getPath("themes"), "gh_" + apiRepo.id));
        zip.extractEntryTo(entry, join(utils.getPath("themes"), "gh_" + apiRepo.id), false, true);
        let commit = await utils.fetch(`https://api.github.com/repos/${repo}/commits`).then((res) => res.json());
        console.debug(`COMMIT SHA: ${commit[0].sha}`);
        let theme = JSON.parse(readFileSync(join(utils.getPath("themes"), "gh_" + apiRepo.id, "theme.json"), "utf8"));
        theme.id = apiRepo.id;
        theme.commit = commit[0].sha;
        writeFileSync(join(utils.getPath("themes"), "gh_" + apiRepo.id, "theme.json"), JSON.stringify(theme, null, 4), "utf8");
      } catch (e) {
        console.error(e);
        returnVal.success = false;
      }
      BrowserWindow.win.webContents.send("theme-installed", returnVal);
      this.StartWatcher(utils.getPath("themes"));
      BrowserWindow.win.webContents.send("theme-update", "");
    });

    ipcMain.on("get-themes", (event, _key) => {
      if (existsSync(utils.getPath("themes"))) {
        let files = readdirSync(utils.getPath("themes"));
        let themes = [];
        for (let file of files) {
          if (file.endsWith(".less")) {
            themes.push(file);
          } else if (statSync(join(utils.getPath("themes"), file)).isDirectory()) {
            let subFiles = readdirSync(join(utils.getPath("themes"), file));
            for (let subFile of subFiles) {
              if (subFile.endsWith("index.less")) {
                themes.push(join(file, subFile));
              }
            }
          }
        }
        let themeObjects = [];
        for (let theme of themes) {
          let themePath = join(utils.getPath("themes"), theme);
          let themeName = theme;
          let themeDescription = "";
          if (theme.includes("/")) {
            themeName = theme.split("/")[1];
            themeDescription = theme.split("/")[0];
          }
          if (themePath.endsWith("index.less")) {
            themePath = themePath.slice(0, -10);
          }
          if (existsSync(join(themePath, "theme.json"))) {
            try {
              let themeJson = JSON.parse(readFileSync(join(themePath, "theme.json"), "utf8"));
              themeObjects.push({
                name: themeJson.name || themeName,
                description: themeJson.description || themeDescription,
                path: themePath,
                file: theme,
                github_repo: themeJson.github_repo || "",
                commit: themeJson.commit || "",
                pack: themeJson.pack || false,
              });
            } catch (e) {
              console.error(e);
            }
          } else {
            themeObjects.push({
              name: themeName,
              description: themeDescription,
              path: themePath,
              file: theme,
              github_repo: "",
              commit: "",
              pack: false,
            });
          }
        }
        event.returnValue = themeObjects;
      } else {
        event.returnValue = [];
      }
    });

    ipcMain.handle("open-path", async (event, path) => {
      switch (path) {
        default:
        case "plugins":
          if (existsSync(utils.getPath("plugins"))) {
            shell.openPath(utils.getPath("plugins"));
          } else {
            mkdirSync(utils.getPath("plugins"));
            shell.openPath(utils.getPath("plugins"));
          }
          break;
        case "userdata":
          shell.openPath(app.getPath("userData"));
          break;
        case "themes":
          if (existsSync(utils.getPath("themes"))) {
            shell.openPath(utils.getPath("themes"));
          } else {
            mkdirSync(utils.getPath("themes"));
            shell.openPath(utils.getPath("themes"));
          }
          break;
      }
    });

    ipcMain.on("get-i18n", (event, key) => {
      event.returnValue = utils.getLocale(key);
    });

    ipcMain.on("get-i18n-listing", (event) => {
      console.debug("[i18n] Getting i18n listing from " + utils.getPath("i18nPath"));
      const i18nFiles = readdirSync(utils.getPath("i18nPath")).filter((file) => file.endsWith(".json")),
        i18nListing = [];

      for (let i = 0; i < i18nFiles.length; i++) {
        if (i18nFiles[i] == "index.json") continue;
        console.debug("[i18n] Processing file: " + join(utils.getPath("i18nPath"), i18nFiles[i]));
        const i18n: { [index: string]: Object } = JSON.parse(readFileSync(join(utils.getPath("i18nPath"), i18nFiles[i]), "utf8"));
        i18nListing.push({
          code: i18nFiles[i].replace(".json", ""),
          nameNative: i18n["i18n.languageName"] ?? i18nFiles[i].replace(".json", ""),
          nameEnglish: i18n["i18n.languageNameEnglish"] ?? i18nFiles[i].replace(".json", ""),
          category: i18n["i18n.category"] ?? "",
          authors: i18n["i18n.authors"] ?? "",
        });
      }
      event.returnValue = i18nListing;
    });

    ipcMain.on("get-gpu-mode", (event) => {
      event.returnValue = process.platform;
    });

    ipcMain.on("get-port", (event) => {
      event.returnValue = this.clientPort;
    });

    ipcMain.on("is-dev", (event) => {
      event.returnValue = this.devMode;
    });

    ipcMain.handle("put-cache", (_event, arg) => {
      writeFileSync(join(join(app.getPath("userData"), "CiderCache"), `${arg.file}.json`), arg.data);
    });

    ipcMain.on("get-cache", (event, arg) => {
      let read = "";
      if (existsSync(join(join(app.getPath("userData"), "CiderCache"), `${arg}.json`))) {
        read = readFileSync(join(join(app.getPath("userData"), "CiderCache"), `${arg}.json`), "utf8");
      }
      event.returnValue = read;
    });

    ipcMain.handle("getYTLyrics", async (_event, track, artist) => {
      const u = track + " " + artist + " official video";
      return await search(u);
    });

    ipcMain.on("close", (_event) => {
      BrowserWindow.win.close();
    });

    ipcMain.on("maximize", (_event) => {
      // listen for maximize event
      if (BrowserWindow.win.isMaximized()) {
        BrowserWindow.win.unmaximize();
      } else {
        BrowserWindow.win.maximize();
      }
    });
    ipcMain.on("unmaximize", () => {
      // listen for maximize event
      BrowserWindow.win.unmaximize();
    });

    ipcMain.on("minimize", () => {
      // listen for minimize event
      BrowserWindow.win.minimize();
    });

    // Set scale
    ipcMain.on("setScreenScale", (_event, scale) => {
      BrowserWindow.win.webContents.setZoomFactor(parseFloat(scale));
    });

    ipcMain.on("windowmin", (_event, width, height) => {
      BrowserWindow.win.setMinimumSize(width, height);
    });

    ipcMain.on("windowontop", (_event, ontop) => {
      BrowserWindow.win.setAlwaysOnTop(ontop);
    });

    // Set scale
    ipcMain.on("windowresize", (_event, width, height, lock = false) => {
      BrowserWindow.win.setContentSize(width, height);
      BrowserWindow.win.setResizable(!lock);
    });

    // Move window
    ipcMain.on("windowmove", (_event, x, y) => {
      BrowserWindow.win.setBounds({ x, y });
    });

    // Override light, dark
    ipcMain.on("changeDisplayTheme", (event, theme) => {
      nativeTheme.themeSource = theme;
    });

    //Fullscreen
    ipcMain.on("setFullScreen", (_event, flag) => {
      BrowserWindow.win.setFullScreen(flag);
    });

    //Fullscreen
    ipcMain.on("getFullScreen", (event, flag) => {
      event.returnValue = BrowserWindow.win.isFullScreen();
    });

    //Fullscreen
    ipcMain.on("detachDT", (_event, _) => {
      BrowserWindow.win.webContents.openDevTools({ mode: "detach" });
    });

    ipcMain.handle("relaunchApp", (_event, _) => {
      const opt: Electron.RelaunchOptions = {};
      opt.args = process.argv.slice(1).concat(["--relaunch"]);
      opt.execPath = process.execPath;
      if (app.isPackaged && process.env.PORTABLE_EXECUTABLE_FILE != undefined) {
        opt.execPath = process.env.PORTABLE_EXECUTABLE_FILE;
      } else if (app.isPackaged && process.env.APPIMAGE != undefined) {
        opt.execPath = process.env.APPIMAGE;
        opt.args.unshift("--appimage-extract-and-run");
      } else if (app.isPackaged && process.env.CHROME_DESKTOP != undefined && process.env.PLATFORM == "Linux") {
        opt.execPath = "cider";
      }
      app.relaunch(opt);
      app.quit();
    });

    ipcMain.handle("quit-app", (_event, _) => {
      app.quit();
    });

    ipcMain.on("play", (_event, type, id) => {
      BrowserWindow.win.webContents.executeJavaScript(`
			    MusicKit.getInstance().setQueue({ ${type}: '${id}', parameters : {l : app.mklang}}).then(function(queue) {
				    MusicKit.getInstance().play();
			    });
		    `);
    });

    // ipcMain.handle("scanLibrary", async (event, folders) => {
    //   // const oldmetadatalist = await LocalFiles.sendOldLibrary();
    //   // BrowserWindow.win.webContents.send("getUpdatedLocalList", oldmetadatalist);
    //   const metadatalist = await LocalFiles.scanLibrary();
    //   BrowserWindow.win.webContents.send("getUpdatedLocalList", metadatalist);
    //   LocalFiles.localSongs = metadatalist;
    //   // LocalFiles.cleanUpDB();
    // });

    LocalFiles.eventEmitter.on("newtracks", (data) => {
      BrowserWindow.win.webContents.send("getUpdatedLocalList", data);
    });

    ipcMain.on("writeWAV", (event, leftpcm, rightpcm, bufferlength) => {
      function interleave16(leftChannel: any, rightChannel: any) {
        var length = leftChannel.length + rightChannel.length;
        var result = new Int16Array(length);

        var inputIndex = 0;

        for (var index = 0; index < length; ) {
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

      function convert(n: any) {
        var v = n < 0 ? n * 32768 : n * 32767; // convert in range [-32768, 32767]
        return Math.max(-32768, Math.min(32768, v)); // clamp
      }

      function bitratechange(e: any) {
        var t = e.length;
        let sampleRate = 96.0;
        let outputSampleRate = 48.0;
        var s = 0,
          o = sampleRate / outputSampleRate,
          u = Math.ceil((t * outputSampleRate) / sampleRate),
          a = new Int16Array(u);
        for (let i = 0; i < u; i++) {
          a[i] = e[Math.floor(s)];
          s += o;
        }

        return a;
      }

      let newaudio = quantization(leftpcm, rightpcm);
      //let newaudio = [leftpcm, rightpcm];
      // console.log(newaudio.length);

      let pcmData = Buffer.from(new Int8Array(interleave16(bitratechange(Int16Array.from(newaudio[0], (x) => convert(x))), bitratechange(Int16Array.from(newaudio[1], (x) => convert(x)))).buffer));

      if (!this.headerSent) {
        console.log("new header");
        const header = Buffer.alloc(44);
        header.write("RIFF", 0);
        header.writeUInt32LE(2147483600, 4);
        header.write("WAVE", 8);
        header.write("fmt ", 12);
        header.writeUInt8(16, 16);
        header.writeUInt8(1, 20);
        header.writeUInt8(2, 22);
        header.writeUInt32LE(48000, 24);
        header.writeUInt32LE(16, 28);
        header.writeUInt8(4, 32);
        header.writeUInt8(16, 34);
        header.write("data", 36);
        header.writeUInt32LE(2147483600 + 44 - 8, 40);
        this.audioStream.write(Buffer.concat([header, pcmData]));
        this.headerSent = true;
      } else {
        this.audioStream.write(pcmData);
      }
    });

    //QR Code
    ipcMain.handle("showQR", async (_event, _) => {
      //macOS
      let url = `http://${BrowserWindow.getIP()}:${this.remotePort}`;
      BrowserWindow.win.webContents.send("send-remote-pair-url", `https://cider.sh/remote/pair?url=${Buffer.from(encodeURI(url)).toString("base64")}`.toString());
    });

    ipcMain.on("get-remote-pair-url", (_event, _) => {
      // Linux and Windows
      let url = `http://${BrowserWindow.getIP()}:${this.remotePort}`;
      //if (app.isPackaged) {
      BrowserWindow.win.webContents.send("send-remote-pair-url", `https://cider.sh/remote/pair?url=${Buffer.from(encodeURI(url)).toString("base64")}`.toString());
      //} else {
      //    BrowserWindow.win.webContents.send('send-remote-pair-url', (`http://127.0.0.1:5500/pair-remote.html?url=${Buffer.from(encodeURI(url)).toString('base64')}`).toString());
      //}
    });

    if (process.platform === "darwin") {
      //macOS
      app.setUserActivity(
        "com.CiderCollective.remote.pair",
        {
          ip: `${BrowserWindow.getIP()}`,
        },
        `http://${BrowserWindow.getIP()}:${this.remotePort}`
      );
    }
    // Get previews for normalization
    ipcMain.on("getPreviewURL", (_event, url) => {
      fetch(url)
        .then((res) => res.buffer())
        .then(async (buffer) => {
          const metadata = await mm.parseBuffer(buffer, "audio/x-m4a");
          let SoundCheckTag = metadata.native.iTunes[1].value;
          console.debug("sc", SoundCheckTag);
          BrowserWindow.win.webContents.send("SoundCheckTag", SoundCheckTag);
        })
        .catch((err) => {
          console.log(err);
        });
    });

    ipcMain.on("share-menu", async (_event, url) => {
      if (process.platform !== "darwin") return;
      //https://www.electronjs.org/docs/latest/api/share-menu
      console.log("[Share Sheet - App.ts]", url);
      const options = {
        title: "Share",
        urls: [url],
      };
      const shareMenu = new ShareMenu(options);
      shareMenu.popup();
    });

    ipcMain.on("get-version", (_event) => {
      if (app.isPackaged) {
        _event.returnValue = app.getVersion();
      } else {
        _event.returnValue = `Experimental running on Electron ${app.getVersion()}`;
      }
    });

    ipcMain.on("open-appdata", (_event) => {
      shell.openPath(app.getPath("userData"));
    });

    ipcMain.handle("folderSelector", async (_event) => {
      let u = await dialog.showOpenDialog({
        properties: ["openDirectory", "multiSelections"],
      });
      return u.filePaths;
    });

    //#region Cider Connect
    ipcMain.on("cc-auth", (_event) => {
      shell.openExternal(String(utils.getStoreValue("cc_authURL")));
    });

    ipcMain.on("cc-logout", (_event) => {
      //Make sure to update the default store
      utils.setStoreValue("connectUser", {
        auth: null,
        sync: {
          themes: false,
          plugins: false,
          settings: false,
        },
      });
      utils.getWindow().reload();
    });

    ipcMain.on("cc-push", (_event) => {
      utils.pushStoreToConnect();
    });
    /* *********************************************************************************************
     * Window Events
     * **********************************************************************************************/
    let WND_STATE = {
      MINIMIZED: 0,
      NORMAL: 1,
      MAXIMIZED: 2,
      FULL_SCREEN: 3,
    };
    let wndState = WND_STATE.NORMAL;
    const win = BrowserWindow.win;
    let isQuitting = false;

    win.on("resize", (_: any) => {
      const isMaximized = win.isMaximized();
      const isMinimized = win.isMinimized();
      const isFullScreen = win.isFullScreen();
      const state = wndState;
      if (isMinimized && state !== WND_STATE.MINIMIZED) {
        wndState = WND_STATE.MINIMIZED;
        win.webContents.send("window-state-changed", "minimized");
      } else if (isFullScreen && state !== WND_STATE.FULL_SCREEN) {
        wndState = WND_STATE.FULL_SCREEN;
        win.webContents.send("window-state-changed", "fullscreen");
      } else if (isMaximized && state !== WND_STATE.MAXIMIZED) {
        wndState = WND_STATE.MAXIMIZED;
        win.webContents.send("window-state-changed", "maximized");
        win.webContents.executeJavaScript(`app.chrome.maximized = true`);
      } else if (state !== WND_STATE.NORMAL) {
        wndState = WND_STATE.NORMAL;
        win.webContents.send("window-state-changed", "normal");
        win.webContents.executeJavaScript(`app.chrome.maximized = false`);
      }
    });

    win.on("close", async (e: any) => {
      if ((process.platform === "darwin" || utils.getStoreValue("general.close_button_hide")) && !isQuitting) {
        e.preventDefault();
        win.hide();
      } else {
        await win.webContents.executeJavaScript(`
            window.localStorage.setItem("currentTrack", JSON.stringify(app.mk.nowPlayingItem));
            window.localStorage.setItem("currentTime", JSON.stringify(app.mk.currentPlaybackTime));
            window.localStorage.setItem("currentQueue", JSON.stringify(app.mk.queue._unplayedQueueItems));
            ipcRenderer.send('stopGCast','');
            MusicKit.getInstance().stop();
        `);
      }
    });

    app.on("before-quit", () => {
      isQuitting = true;
    });

    app.on("activate", function () {
      win.show();
    });

    // Quit when all windows are closed.
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // Set window Handler
    BrowserWindow.win.webContents.setWindowOpenHandler((x: any) => {
      if (x.url.includes("apple.com") || x.url.includes("localhost")) {
        return { action: "allow" };
      }
      shell.openExternal(x.url).catch(console.error);
      return { action: "deny" };
    });
  }

  /**
   * Gets ip
   * @private
   */
  private static getIP(): string {
    let ip: string = "";
    let ip2: any = [];
    let alias = 0;
    const ifaces: any = networkInterfaces();
    for (let dev in ifaces) {
      ifaces[dev].forEach((details: any) => {
        if (details.family === "IPv4" && !details.internal) {
          if (!/(loopback|vmware|internal|hamachi|vboxnet|virtualbox)/gi.test(dev + (alias ? ":" + alias : ""))) {
            if (details.address.substring(0, 8) === "192.168." || details.address.substring(0, 7) === "172.16." || details.address.substring(0, 3) === "10.") {
              if (!ip.startsWith("192.168.") || (String(ip2).startsWith("192.168.") && !ip.startsWith("192.168.") && String(ip2).startsWith("172.16.") && !ip.startsWith("192.168.") && !ip.startsWith("172.16.")) || (String(ip2).startsWith("10.") && !ip.startsWith("192.168.") && !ip.startsWith("172.16.") && !ip.startsWith("10."))) {
                ip = details.address;
              }
              ++alias;
            }
          }
        }
      });
    }
    return ip;
  }

  /**
   * Broadcast the remote to the IP
   * @private
   */
  private async broadcastRemote() {
    const myString = `http://${BrowserWindow.getIP()}:${this.remotePort}`;
    const mdns = require("mdns-js");
    const encoded = Buffer.from(myString).toString("base64");
    const x = mdns.tcp("cider-remote");
    const txt_record = {
      Ver: "131077",
      DvSv: "3689",
      DbId: "D41D8CD98F00B205",
      DvTy: "Cider",
      OSsi: "0x212F0",
      txtvers: "1",
      CtlN: "Cider",
      iV: "196623",
    };
    let server2 = mdns.createAdvertisement(x, `${await getPort({ port: 3839 })}`, {
      name: encoded,
      txt: txt_record,
    });
    server2.start();
    console.log("remote broadcasted");
  }
}
