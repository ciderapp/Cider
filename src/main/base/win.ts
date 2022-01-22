// @ts-nocheck
import * as path from "path";
import * as electron from "electron";
import * as windowStateKeeper from "electron-window-state";
import * as express from "express";
import * as getPort from "get-port";
import * as yt from "youtube-search-without-api-key";
import * as fs from "fs";
import { Stream } from "stream";
import * as qrcode from "qrcode-terminal";
import * as qrcode2 from "qrcode";
import * as os from "os";
import {wsapi} from "./wsapi";

export class Win {
    win: any | undefined = null;
    app: any | undefined = null;
    store: any | undefined = null;
    devMode: boolean = !electron.app.isPackaged;

    constructor(app: electron.App, store: any) {
        this.app = app;
        this.store = store;
    }

    private paths: any = {
        srcPath: path.join(__dirname, "../../src"),
        resourcePath: path.join(__dirname, "../../resources"),
        ciderCache: path.resolve(electron.app.getPath("userData"), "CiderCache"),
        themes: path.resolve(electron.app.getPath("userData"), "Themes"),
        plugins: path.resolve(electron.app.getPath("userData"), "Plugins"),
    };
    private audioStream: any = new Stream.PassThrough();
    private clientPort: number = 0;
    private remotePort: number = 6942;
    private EnvironmentVariables: object = {
        env: {
            platform: process.platform,
            dev: electron.app.isPackaged,
        },
    };
    private options: any = {
        icon: path.join(
            this.paths.resourcePath,
            `icons/icon.` + (process.platform === "win32" ? "ico" : "png")
        ),
        width: 1024,
        height: 600,
        x: undefined,
        y: undefined,
        minWidth: 844,
        minHeight: 410,
        frame: false,
        title: "Cider",
        vibrancy: "dark",
        transparent: process.platform === "darwin",
        hasShadow: false,
        show: false,
        backgroundColor: "#1E1E1E",
        webPreferences: {
            nodeIntegration: true,
            sandbox: true,
            allowRunningInsecureContent: true,
            contextIsolation: false,

            webviewTag: true,
            plugins: true,
            nodeIntegrationInWorker: false,
            webSecurity: false,
            preload: path.join(this.paths.srcPath, "./preload/cider-preload.js"),
        },
    };

    /**
     * Creates the browser window
     */
    async createWindow(): Promise<void> {
        this.clientPort = await getPort({ port: 9000 });
        this.verifyFiles();

        // Load the previous state with fallback to defaults
        const windowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600,
        });
        this.options.width = windowState.width;
        this.options.height = windowState.height;

        // Start the webserver for the browser window to load

        this.startWebServer();

        this.win = new electron.BrowserWindow(this.options);
        this.win.on("ready-to-show", () => {
            this.win.show();
        });
        const ws = new wsapi(this.win)
        ws.InitWebSockets()
        // and load the renderer.
        this.startSession();
        this.startHandlers();

        // Register listeners on Window to track size and position of the Window.
        windowState.manage(this.win);

        return this.win;
    }

    /**
     * Verifies the files for the renderer to use (Cache, library info, etc.)
     */
    private verifyFiles(): void {
        const expectedDirectories = ["CiderCache"];
        const expectedFiles = [
            "library-songs.json",
            "library-artists.json",
            "library-albums.json",
            "library-playlists.json",
            "library-recentlyAdded.json",
        ];
        for (let i = 0; i < expectedDirectories.length; i++) {
            if (
                !fs.existsSync(
                    path.join(electron.app.getPath("userData"), expectedDirectories[i])
                )
            ) {
                fs.mkdirSync(
                    path.join(electron.app.getPath("userData"), expectedDirectories[i])
                );
            }
        }
        for (let i = 0; i < expectedFiles.length; i++) {
            const file = path.join(this.paths.ciderCache, expectedFiles[i]);
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, JSON.stringify([]));
            }
        }
    }

    /**
     * Starts the webserver for the renderer process.
     */
    private startWebServer(): void {
        const app = express();
        
        app.use(express.static(path.join(this.paths.srcPath, "./renderer/")));
        app.set("views", path.join(this.paths.srcPath, "./renderer/views"));
        app.set("view engine", "ejs");
        let firstRequest = true;
        app.use((req, res, next) => {
            // @ts-ignore
            if (
                req.url.includes("audio.webm") ||
                (req.headers.host.includes("localhost") &&
                    (this.devMode || req.headers["user-agent"].includes("Electron")))
            ) {
                next();
            } else {
                res.redirect("https://discord.gg/applemusic");
            }
        });
        
        app.get("/", (req, res) => {
            res.render("main", this.EnvironmentVariables);
        });

        app.get("/audio.webm", (req, res) => {
            try {
                req.socket.setTimeout(Number.MAX_SAFE_INTEGER);
                // CiderBase.requests.push({req: req, res: res});
                // var pos = CiderBase.requests.length - 1;
                // req.on("close", () => {
                //     console.info("CLOSED", CiderBase.requests.length);
                //     requests.splice(pos, 1);
                //     console.info("CLOSED", CiderBase.requests.length);
                // });
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
        //app.use(express.static())

        app.listen(this.clientPort, () => {
            console.log(`Cider client port: ${this.clientPort}`);
        });

        /*
         * Remote Client (I had no idea how to add it to our existing express server, so I just made another one) -@quacksire 
         * TODO: Broadcast the remote so that /web-remote/ can connect
         * https://github.com/ciderapp/Apple-Music-Electron/blob/818ed18940ff600d76eb59d22016723a75885cd5/resources/functions/handler.js#L1173
         */
        const remote = express();
        remote.use(express.static(path.join(this.paths.srcPath, "./web-remote/")))
        remote.listen(this.remotePort, () => {
            console.log(`Cider remote port: ${this.remotePort}`);
            if (firstRequest) {
                console.log("---- Ignore Me ;) ---");
                qrcode.generate(`http://${os.hostname}:${this.remotePort}`);
                console.log("---- Ignore Me ;) ---");
                /*
                 *
                 *   USING https://www.npmjs.com/package/qrcode-terminal for terminal
                 *   WE SHOULD USE https://www.npmjs.com/package/qrcode for the remote (or others) for showing to user via an in-app dialog
                 *   -@quacksire
                 */
            }
            firstRequest = false;
        })
    }

    /**
     * Starts the session for the renderer process.
     */
    private startSession(): void {
        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        this.win.webContents.session.webRequest.onBeforeRequest(
            {
                urls: ["https://*/*.js"],
            },
            (
                details: { url: string | string[] },
                callback: (arg0: { redirectURL?: string; cancel?: boolean }) => void
            ) => {
                if (details.url.includes("hls.js")) {
                    callback({
                        redirectURL: `http://localhost:${this.clientPort}/apple-hls.js`,
                    });
                } else {
                    callback({
                        cancel: false,
                    });
                }
            }
        );

        this.win.webContents.session.webRequest.onBeforeSendHeaders(
            async (
                details: { url: string; requestHeaders: { [x: string]: string } },
                callback: (arg0: { requestHeaders: any }) => void
            ) => {
                if (details.url === "https://buy.itunes.apple.com/account/web/info") {
                    details.requestHeaders["sec-fetch-site"] = "same-site";
                    details.requestHeaders["DNT"] = "1";
                    let itspod = await this.win.webContents.executeJavaScript(
                        `window.localStorage.getItem("music.ampwebplay.itspod")`
                    );
                    if (itspod != null)
                        details.requestHeaders["Cookie"] = `itspod=${itspod}`;
                }
                callback({ requestHeaders: details.requestHeaders });
            }
        );

        let location = `http://localhost:${this.clientPort}/`;

        if (electron.app.isPackaged) {
            this.win.loadURL(location);
        } else {
            this.win.loadURL(location, {
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
        electron.ipcMain.on("cider-platform", (event) => {
            event.returnValue = process.platform;
        });

        electron.ipcMain.on("get-gpu-mode", (event) => {
            event.returnValue = process.platform;
        });

        electron.ipcMain.on("is-dev", (event) => {
            event.returnValue = this.devMode;
        });

        electron.ipcMain.on("close", () => {
            // listen for close event
            this.win.close();
        });

        electron.ipcMain.on("put-library-songs", (event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-songs.json"),
                JSON.stringify(arg)
            );
        });

        electron.ipcMain.on("put-library-artists", (event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-artists.json"),
                JSON.stringify(arg)
            );
        });

        electron.ipcMain.on("put-library-albums", (event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-albums.json"),
                JSON.stringify(arg)
            );
        });

        electron.ipcMain.on("put-library-playlists", (event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-playlists.json"),
                JSON.stringify(arg)
            );
        });

        electron.ipcMain.on("put-library-recentlyAdded", (event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-recentlyAdded.json"),
                JSON.stringify(arg)
            );
        });

        electron.ipcMain.on("get-library-songs", (event) => {
            let librarySongs = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-songs.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(librarySongs);
        });

        electron.ipcMain.on("get-library-artists", (event) => {
            let libraryArtists = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-artists.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(libraryArtists);
        });

        electron.ipcMain.on("get-library-albums", (event) => {
            let libraryAlbums = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-albums.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(libraryAlbums);
        });

        electron.ipcMain.on("get-library-playlists", (event) => {
            let libraryPlaylists = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-playlists.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(libraryPlaylists);
        });

        electron.ipcMain.on("get-library-recentlyAdded", (event) => {
            let libraryRecentlyAdded = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-recentlyAdded.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(libraryRecentlyAdded);
        });

        electron.ipcMain.handle("getYTLyrics", async (event, track, artist) => {
            const u = track + " " + artist + " official video";
            return await yt.search(u);
        });

        electron.ipcMain.handle("setVibrancy", (event, key, value) => {
            this.win.setVibrancy(value);
        });

        electron.ipcMain.on("maximize", () => {
            // listen for maximize event
            if (this.win.isMaximized()) {
                this.win.unmaximize();
            } else {
                this.win.maximize();
            }
        });

        electron.ipcMain.on("minimize", () => {
            // listen for minimize event
            this.win.minimize();
        });

        // Set scale
        electron.ipcMain.on("setScreenScale", (event, scale) => {
            this.win.webContents.setZoomFactor(parseFloat(scale));
        });

        //Fullscreen
        electron.ipcMain.on('setFullScreen', (event, flag) => {
            this.win.setFullScreen(flag)
        })

        function getIp() {
            let ip = false;
            let alias = 0;
            let ifaces = os.networkInterfaces();
            for (var dev in ifaces) {
                ifaces[dev].forEach(details => {
                    if (details.family === 'IPv4') {
                        if (!/(loopback|vmware|internal|hamachi|vboxnet|virtualbox)/gi.test(dev + (alias ? ':' + alias : ''))) {
                            if (details.address.substring(0, 8) === '192.168.' ||
                                details.address.substring(0, 7) === '172.16.' ||
                                details.address.substring(0, 3) === '10.'
                            ) {
                                ip = details.address;
                                ++alias;
                            }
                        }
                    }
                });
            }
            return ip;
        }

        //QR Code
        electron.ipcMain.handle('showQR', async (event , _) => {
            let url = `http://${getIp()}:${this.remotePort}`;
            electron.shell.openExternal(`https://cider.sh/pair-remote?url=${btoa(encodeURI(url))}`);
            /*
            *  Doing this because we can give them the link and let them send it via Pocket or another in-browser tool -q
            /
        })
        /* *********************************************************************************************
         * Window Events
         * **********************************************************************************************/
        if (process.platform === "win32") {
            let WND_STATE = {
                MINIMIZED: 0,
                NORMAL: 1,
                MAXIMIZED: 2,
                FULL_SCREEN: 3,
            };
            let wndState = WND_STATE.NORMAL;

            this.win.on("resize", (_: any) => {
                const isMaximized = this.win.isMaximized();
                const isMinimized = this.win.isMinimized();
                const isFullScreen = this.win.isFullScreen();
                const state = wndState;
                if (isMinimized && state !== WND_STATE.MINIMIZED) {
                    wndState = WND_STATE.MINIMIZED;
                } else if (isFullScreen && state !== WND_STATE.FULL_SCREEN) {
                    wndState = WND_STATE.FULL_SCREEN;
                } else if (isMaximized && state !== WND_STATE.MAXIMIZED) {
                    wndState = WND_STATE.MAXIMIZED;
                    this.win.webContents.executeJavaScript(`app.chrome.maximized = true`);
                } else if (state !== WND_STATE.NORMAL) {
                    wndState = WND_STATE.NORMAL;
                    this.win.webContents.executeJavaScript(
                        `app.chrome.maximized = false`
                    );
                }
            });
        }

        this.win.on("closed", () => {
            this.win = null;
        });

        // Set window Handler
        this.win.webContents.setWindowOpenHandler((x: any) => {
            if (x.url.includes("apple") || x.url.includes("localhost")) {
                return { action: "allow" };
            }
            electron.shell.openExternal(x.url).catch(console.error);
            return { action: "deny" };
        });
    }
}
