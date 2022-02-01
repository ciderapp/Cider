import * as path from "path";
import {app, BrowserWindow as bw, ipcMain, shell} from "electron";
import * as windowStateKeeper from "electron-window-state";
import * as express from "express";
import * as getPort from "get-port";
import * as yt from "youtube-search-without-api-key";
import * as fs from "fs";
import {Stream} from "stream";
import * as qrcode from "qrcode-terminal";
import * as os from "os";
import * as mm from 'music-metadata';
import fetch from 'electron-fetch'
import {wsapi} from "./wsapi";
import {jsonc} from "jsonc";
import {NsisUpdater} from "electron-updater";
import {utils} from './utils'

export class BrowserWindow {
    public static win: any | undefined = null;
    private devMode: boolean = !app.isPackaged;

    private paths: any = {
        srcPath: path.join(__dirname, "../../src"),
        resourcePath: path.join(__dirname, "../../resources"),
        ciderCache: path.resolve(app.getPath("userData"), "CiderCache"),
        themes: path.resolve(app.getPath("userData"), "Themes"),
        plugins: path.resolve(app.getPath("userData"), "Plugins"),
    };
    private audioStream: any = new Stream.PassThrough();
    private clientPort: number = 0;
    private remotePort: number = 6942;
    private EnvironmentVariables: object = {
        env: {
            platform: process.platform,
            dev: app.isPackaged,
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
        minWidth: 900,
        minHeight: 390,
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
    async createWindow(): Promise<Electron.BrowserWindow> {
        this.clientPort = await getPort({port: 9000});
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

        BrowserWindow.win = new bw(this.options);
        const ws = new wsapi(BrowserWindow.win)
        ws.InitWebSockets()
        // and load the renderer.
        this.startSession();
        this.startHandlers();

        // Register listeners on Window to track size and position of the Window.
        windowState.manage(BrowserWindow.win);

        return BrowserWindow.win
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
                    path.join(app.getPath("userData"), expectedDirectories[i])
                )
            ) {
                fs.mkdirSync(
                    path.join(app.getPath("userData"), expectedDirectories[i])
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
            if (!req || !req.headers || !req.headers.host || !req.headers["user-agent"]) {
                console.error('Req not defined')
                return
            }
            if (req.url.includes("audio.webm") || (req.headers.host.includes("localhost") && (this.devMode || req.headers["user-agent"].includes("Electron")))) {
                next();
            } else {
                res.redirect("https://discord.gg/applemusic");
            }
        });

        app.get("/", (_req, res) => {
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
        remote.set("views", path.join(this.paths.srcPath, "./web-remote/views"));
        remote.set("view engine", "ejs");
        getPort({port: 6942}).then((port) => {
            this.remotePort = port;
            // Start Remote Discovery
            this.broadcastRemote()
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
            remote.get("/", (_req, res) => {
                res.render("index", this.EnvironmentVariables);
            });
        })
    }

    /**
     * Starts the session for the renderer process.
     */
    private startSession(): void {
        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.1/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        BrowserWindow.win.webContents.session.webRequest.onBeforeRequest(
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

        BrowserWindow.win.webContents.session.webRequest.onBeforeSendHeaders(
            async (
                details: { url: string; requestHeaders: { [x: string]: string } },
                callback: (arg0: { requestHeaders: any }) => void
            ) => {
                if (details.url === "https://buy.itunes.apple.com/account/web/info") {
                    details.requestHeaders["sec-fetch-site"] = "same-site";
                    details.requestHeaders["DNT"] = "1";
                    let itspod = await BrowserWindow.win.webContents.executeJavaScript(
                        `window.localStorage.getItem("music.ampwebplay.itspod")`
                    );
                    if (itspod != null)
                        details.requestHeaders["Cookie"] = `itspod=${itspod}`;
                }
                callback({requestHeaders: details.requestHeaders});
            }
        );

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
        ipcMain.on("cider-platform", (event) => {
            event.returnValue = process.platform;
        });

        ipcMain.on("get-i18n", (event, key) => {
            event.returnValue = utils.getLocale(key);
        });

        ipcMain.on("get-i18n-listing", event => {
            let i18nFiles = fs.readdirSync(path.join(__dirname, "../../src/i18n")).filter(file => file.endsWith(".jsonc"));
            // read all the files and parse them
            let i18nListing = []
            for (let i = 0; i < i18nFiles.length; i++) {
                const i18n: { [index: string]: Object } = jsonc.parse(fs.readFileSync(path.join(__dirname, `../../src/i18n/${i18nFiles[i]}`), "utf8"));
                i18nListing.push({
                    "code": i18nFiles[i].replace(".jsonc", ""),
                    "nameNative": i18n["i18n.languageName"] ?? i18nFiles[i].replace(".jsonc", ""),
                    "nameEnglish": i18n["i18n.languageNameEnglish"] ?? i18nFiles[i].replace(".jsonc", ""),
                    "category": i18n["i18n.category"] ?? "",
                    "authors": i18n["i18n.authors"] ?? ""
                })
            }
            event.returnValue = i18nListing;
        })

        ipcMain.on("get-gpu-mode", (event) => {
            event.returnValue = process.platform;
        });

        ipcMain.on("is-dev", (event) => {
            event.returnValue = this.devMode;
        });

        ipcMain.on("put-library-songs", (_event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-songs.json"),
                JSON.stringify(arg)
            );
        });

        ipcMain.on("put-library-artists", (_event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-artists.json"),
                JSON.stringify(arg)
            );
        });

        ipcMain.on("put-library-albums", (_event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-albums.json"),
                JSON.stringify(arg)
            );
        });

        ipcMain.on("put-library-playlists", (_event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-playlists.json"),
                JSON.stringify(arg)
            );
        });

        ipcMain.on("put-library-recentlyAdded", (_event, arg) => {
            fs.writeFileSync(
                path.join(this.paths.ciderCache, "library-recentlyAdded.json"),
                JSON.stringify(arg)
            );
        });

        ipcMain.on("get-library-songs", (event) => {
            let librarySongs = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-songs.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(librarySongs);
        });

        ipcMain.on("get-library-artists", (event) => {
            let libraryArtists = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-artists.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(libraryArtists);
        });

        ipcMain.on("get-library-albums", (event) => {
            let libraryAlbums = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-albums.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(libraryAlbums);
        });

        ipcMain.on("get-library-playlists", (event) => {
            let libraryPlaylists = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-playlists.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(libraryPlaylists);
        });

        ipcMain.on("get-library-recentlyAdded", (event) => {
            let libraryRecentlyAdded = fs.readFileSync(
                path.join(this.paths.ciderCache, "library-recentlyAdded.json"),
                "utf8"
            );
            event.returnValue = JSON.parse(libraryRecentlyAdded);
        });

        ipcMain.handle("getYTLyrics", async (_event, track, artist) => {
            const u = track + " " + artist + " official video";
            return await yt.search(u);
        });

        ipcMain.on("close", () => {
            BrowserWindow.win.close();
        });

        ipcMain.on("maximize", () => {
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
        })

        ipcMain.on("windowontop", (_event, ontop) => {
            BrowserWindow.win.setAlwaysOnTop(ontop);
        });

        // Set scale
        ipcMain.on("windowresize", (_event, width, height, lock = false) => {
            BrowserWindow.win.setContentSize(width, height);
            BrowserWindow.win.setResizable(!lock);
        });

        //Fullscreen
        ipcMain.on('setFullScreen', (_event, flag) => {
            BrowserWindow.win.setFullScreen(flag)
        })
        //Fullscreen
        ipcMain.on('detachDT', (_event, _) => {
            BrowserWindow.win.webContents.openDevTools({mode: 'detach'});
        })


        ipcMain.on('play', (_event, type, id) => {
            BrowserWindow.win.webContents.executeJavaScript(`
															MusicKit.getInstance().setQueue({ ${type}: '${id}'}).then(function(queue) {
																MusicKit.getInstance().play();
															});
															`)
        })

        //QR Code
        ipcMain.handle('showQR', async (event, _) => {
            let url = `http://${BrowserWindow.getIP()}:${this.remotePort}`;
            shell.openExternal(`https://cider.sh/pair-remote?url=${Buffer.from(encodeURI(url)).toString('base64')}`).catch(console.error);
        })

        // Get previews for normalization
        ipcMain.on("getPreviewURL", (_event, url) => {

            fetch(url)
                .then(res => res.buffer())
                .then(async (buffer) => {
                    const metadata = await mm.parseBuffer(buffer, 'audio/x-m4a');
                    let SoundCheckTag = metadata.native.iTunes[1].value
                    console.log('sc', SoundCheckTag)
                    BrowserWindow.win.webContents.send('SoundCheckTag', SoundCheckTag)
                }).catch(err => {
                console.log(err)
            });
        });

        ipcMain.on('check-for-update', async (_event, url) => {
            const options: any = {
                provider: 'generic',
                url: 'https://43-429851205-gh.circle-artifacts.com/0/%7E/Cider/dist/artifacts' //Base URL
            }
            const autoUpdater = new NsisUpdater(options) //Windows Only (for now) -q
            await autoUpdater.checkForUpdatesAndNotify()
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

            BrowserWindow.win.on("resize", (_: any) => {
                const isMaximized = BrowserWindow.win.isMaximized();
                const isMinimized = BrowserWindow.win.isMinimized();
                const isFullScreen = BrowserWindow.win.isFullScreen();
                const state = wndState;
                if (isMinimized && state !== WND_STATE.MINIMIZED) {
                    wndState = WND_STATE.MINIMIZED;
                } else if (isFullScreen && state !== WND_STATE.FULL_SCREEN) {
                    wndState = WND_STATE.FULL_SCREEN;
                } else if (isMaximized && state !== WND_STATE.MAXIMIZED) {
                    wndState = WND_STATE.MAXIMIZED;
                    BrowserWindow.win.webContents.executeJavaScript(`app.chrome.maximized = true`);
                } else if (state !== WND_STATE.NORMAL) {
                    wndState = WND_STATE.NORMAL;
                    BrowserWindow.win.webContents.executeJavaScript(
                        `app.chrome.maximized = false`
                    );
                }
            });
        }

        let isQuiting = false

        BrowserWindow.win.on("close", (event: Event) => {
            if ((utils.getStoreValue('general.close_button_hide') || process.platform === "darwin") && !isQuiting) {
                event.preventDefault();
                BrowserWindow.win.hide();
            } else {
                BrowserWindow.win.destroy();
            }
        })

        app.on('before-quit', () => {
            isQuiting = true
        });

        app.on('window-all-closed', () => {
            app.quit()
        })

        BrowserWindow.win.on("closed", () => {
            BrowserWindow.win = null;
        });

        // Set window Handler
        BrowserWindow.win.webContents.setWindowOpenHandler((x: any) => {
            if (x.url.includes("apple") || x.url.includes("localhost")) {
                return {action: "allow"};
            }
            shell.openExternal(x.url).catch(console.error);
            return {action: "deny"};
        });
    }

    private static getIP(): string {
        let ip: string = '';
        let alias = 0;
        const ifaces: any = os.networkInterfaces();
        for (let dev in ifaces) {
            ifaces[dev].forEach((details: any) => {
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

    /**
     * Broadcast the remote to the IP
     * @private
     */
    private async broadcastRemote() {
        const myString = `http://${BrowserWindow.getIP()}:${this.remotePort}`;
        const mdns = require('mdns-js');
        const encoded = new Buffer(myString).toString('base64');
        const x = mdns.tcp('cider-remote');
        const txt_record = {
            "Ver": "131077",
            'DvSv': '3689',
            'DbId': 'D41D8CD98F00B205',
            'DvTy': 'Cider',
            'OSsi': '0x212F0',
            'txtvers': '1',
            "CtlN": "Cider",
            "iV": "196623"
        };
        let server2 = mdns.createAdvertisement(x, `${await getPort({port: 3839})}`, {
            name: encoded,
            txt: txt_record
        });
        server2.start();
        console.log('remote broadcasted')
    }
}

