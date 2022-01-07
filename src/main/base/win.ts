import * as path from "path";
import * as electron from "electron";
// import * as electronAcrylic from "electron-acrylic-window"
import * as windowStateKeeper from "electron-window-state";
import * as express from "express";
import * as getPort from "get-port";
import * as yt from "youtube-search-without-api-key";
import * as fs from "fs";
import {Stream} from "stream";

export class Win {
    win: any | undefined = null;
    app: electron.App | undefined;

    private paths: any = {
        srcPath: path.join(__dirname, "../../src"),
        resourcePath: path.join(__dirname, "../../resources"),
        ciderCache: path.resolve(electron.app.getPath("userData"), "CiderCache"),
        themes: path.resolve(electron.app.getPath("userData"), "Themes"),
        plugins: path.resolve(electron.app.getPath("userData"), "Plugins"),
    }
    private audioStream: any = new Stream.PassThrough();
    private clientPort: number = 0;
    private EnvironmentVariables: object = {
        "env": {
            platform: process.platform,
            dev: electron.app.isPackaged
        }
    };
    private options: any = {
        icon: path.join(this.paths.resourcePath, `icons/icon.` + (process.platform === "win32" ? "ico" : "png")),
        width: 1024,
        height: 600,
        x: undefined,
        y: undefined,
        minWidth: 844,
        minHeight: 410,
        frame: false,
        title: "Cider",
        vibrancy: 'dark',
        //  transparent: true,
        hasShadow: false,
        webPreferences: {
            webviewTag: true,
            plugins: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
            enableRemoteModule: true,
            sandbox: true,
            nativeWindowOpen: true,
            contextIsolation: false,
            preload: path.join(this.paths.srcPath, './preload/cider-preload.js')
        }
    };

    /**
     * Creates the browser window
     */
    createWindow(): void {
        // Load the previous state with fallback to defaults
        const windowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600
        });
        this.options.width = windowState.width;
        this.options.height = windowState.height;

        // Start the webserver for the browser window to load
        this.startWebServer().then(() => {
            if (process.platform === "win32") {
                // this.win = new electronAcrylic.BrowserWindow(this.options);
            } else {
                this.win = new electron.BrowserWindow(this.options);
            }
        })

        // and load the renderer.
        this.startSession(this.win);
        this.startHandlers(this.win);

        // Register listeners on Window to track size and position of the Window.
        windowState.manage(this.win);

        return this.win;
    }

    /**
     * Starts the webserver for the renderer process.
     */
    public async startWebServer(): Promise<void> {
        this.clientPort = await getPort({port: 9000});
        const app = express();

        // app.use(express.static(path.join(this.paths.srcPath, './renderer/'))); // this breaks everything
        app.set("views", path.join(this.paths.srcPath, './renderer/views'));
        app.set("view engine", "ejs");

        // this is also causing issues
        // app.use((req, res, next) => {
        //     // if not localhost
        //
        //     // @ts-ignore
        //     if (req.url.includes("audio.webm") || (req.headers.host.includes("localhost") && req.headers["user-agent"].includes("Cider"))) {
        //         next();
        //     }
        // });

        app.get('/', (req, res) => {
            // res.send("Hello world!");
            // res.sendFile(path.join(webRemotePath, 'index_old.html'));
            res.render("main", this.EnvironmentVariables)
        });

        // app.get('/audio.webm', (req, res) => {
        //     try {
        //         req.connection.setTimeout(Number.MAX_SAFE_INTEGER);
        //         // CiderBase.requests.push({req: req, res: res});
        //         // var pos = CiderBase.requests.length - 1;
        //         // req.on("close", () => {
        //         //     console.info("CLOSED", CiderBase.requests.length);
        //         //     requests.splice(pos, 1);
        //         //     console.info("CLOSED", CiderBase.requests.length);
        //         // });
        //         this.audioStream.on('data', (data: any) => {
        //             try {
        //                 res.write(data);
        //             } catch (ex) {
        //                 console.log(ex)
        //             }
        //         })
        //     } catch (ex) {
        //         console.log(ex)
        //     }
        // });

        app.listen(this.clientPort, () => {
            console.log(`Cider client port: ${this.clientPort}`);
        });
    }

    /**
     * Starts the session for the renderer process.
     */
    private startSession(win: any): void {
        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        win.webContents.session.webRequest.onBeforeRequest(
            {
                urls: ["https://*/*.js"]
            },
            (details: { url: string | string[]; }, callback: (arg0: { redirectURL?: string; cancel?: boolean; }) => void) => {
                if (details.url.includes("hls.js")) {
                    callback({
                        redirectURL: `http://localhost:${this.clientPort}/apple-hls.js`
                    })
                } else {
                    callback({
                        cancel: false
                    })
                }
            }
        )

        win.webContents.session.webRequest.onBeforeSendHeaders(async (details: { url: string; requestHeaders: { [x: string]: string; }; }, callback: (arg0: { requestHeaders: any; }) => void) => {
            if (details.url === "https://buy.itunes.apple.com/account/web/info") {
                details.requestHeaders['sec-fetch-site'] = 'same-site';
                details.requestHeaders['DNT'] = '1';
                let itspod = await win.webContents.executeJavaScript(`window.localStorage.getItem("music.ampwebplay.itspod")`)
                if (itspod != null)
                    details.requestHeaders['Cookie'] = `itspod=${itspod}`
            }
            callback({requestHeaders: details.requestHeaders})
        })

        let location = `http://localhost:${this.clientPort}/`
        win.loadURL(location)
    }

    /**
     * Initializes the window handlers
     * @param win The BrowserWindow
     */
    private startHandlers(win: any): void {

        /**********************************************************************************************************************
         * ipcMain Events
         ****************************************************************************************************************** */
        electron.ipcMain.on("cider-platform", (event) => {
            event.returnValue = process.platform
        })

        electron.ipcMain.on("get-gpu-mode", (event) => {
            event.returnValue = process.platform
        })

        electron.ipcMain.on("is-dev", (event) => {
            event.returnValue = !electron.app.isPackaged
        })
        electron.ipcMain.on('close', () => { // listen for close event
            win.close();
        })

        electron.ipcMain.on('put-library-songs', (event, arg) => {
            fs.writeFileSync(path.join(this.paths.ciderCache, "library-songs.json"), JSON.stringify(arg))
        })

        electron.ipcMain.on('put-library-artists', (event, arg) => {
            fs.writeFileSync(path.join(this.paths.ciderCache, "library-artists.json"), JSON.stringify(arg))
        })

        electron.ipcMain.on('put-library-albums', (event, arg) => {
            fs.writeFileSync(path.join(this.paths.ciderCache, "library-albums.json"), JSON.stringify(arg))
        })

        electron.ipcMain.on('put-library-playlists', (event, arg) => {
            fs.writeFileSync(path.join(this.paths.ciderCache, "library-playlists.json"), JSON.stringify(arg))
        })

        electron.ipcMain.on('put-library-recentlyAdded', (event, arg) => {
            fs.writeFileSync(path.join(this.paths.ciderCache, "library-recentlyAdded.json"), JSON.stringify(arg))
        })

        electron.ipcMain.on('get-library-songs', (event) => {
            let librarySongs = fs.readFileSync(path.join(this.paths.ciderCache, "library-songs.json"), "utf8")
            event.returnValue = JSON.parse(librarySongs)
        })

        electron.ipcMain.on('get-library-artists', (event) => {
            let libraryArtists = fs.readFileSync(path.join(this.paths.ciderCache, "library-artists.json"), "utf8")
            event.returnValue = JSON.parse(libraryArtists)
        })

        electron.ipcMain.on('get-library-albums', (event) => {
            let libraryAlbums = fs.readFileSync(path.join(this.paths.ciderCache, "library-albums.json"), "utf8")
            event.returnValue = JSON.parse(libraryAlbums)
        })

        electron.ipcMain.on('get-library-playlists', (event) => {
            let libraryPlaylists = fs.readFileSync(path.join(this.paths.ciderCache, "library-playlists.json"), "utf8")
            event.returnValue = JSON.parse(libraryPlaylists)
        })

        electron.ipcMain.on('get-library-recentlyAdded', (event) => {
            let libraryRecentlyAdded = fs.readFileSync(path.join(this.paths.ciderCache, "library-recentlyAdded.json"), "utf8")
            event.returnValue = JSON.parse(libraryRecentlyAdded)
        })

        electron.ipcMain.handle('getYTLyrics', async (event, track, artist) => {
            const u = track + " " + artist + " official video";
            return await yt.search(u)
        })

        // electron.ipcMain.handle('getStoreValue', (event, key, defaultValue) => {
        //     return (defaultValue ? app.cfg.get(key, true) : app.cfg.get(key));
        // });
        //
        // electron.ipcMain.handle('setStoreValue', (event, key, value) => {
        //     app.cfg.set(key, value);
        // });
        //
        // electron.ipcMain.on('getStore', (event) => {
        //     event.returnValue = app.cfg.store
        // })
        //
        // electron.ipcMain.on('setStore', (event, store) => {
        //     app.cfg.store = store
        // })

        electron.ipcMain.handle('setVibrancy', (event, key, value) => {
            win.setVibrancy(value)
        });

        electron.ipcMain.on('maximize', () => { // listen for maximize event
            if (win.isMaximized()) {
                win.unmaximize()
            } else {
                win.maximize()
            }
        })

        electron.ipcMain.on('minimize', () => { // listen for minimize event
            win.minimize();
        })

        // Set scale
        electron.ipcMain.on('setScreenScale', (event, scale) => {
            win.webContents.setZoomFactor(parseFloat(scale))
        })

        /* *********************************************************************************************
        * Window Events
        * **********************************************************************************************/

        if (process.platform === "win32") {
            let WND_STATE = {
                MINIMIZED: 0,
                NORMAL: 1,
                MAXIMIZED: 2,
                FULL_SCREEN: 3
            }
            let wndState = WND_STATE.NORMAL

            win.on("resize", (_: any) => {
                const isMaximized = win.isMaximized()
                const isMinimized = win.isMinimized()
                const isFullScreen = win.isFullScreen()
                const state = wndState;
                if (isMinimized && state !== WND_STATE.MINIMIZED) {
                    wndState = WND_STATE.MINIMIZED
                } else if (isFullScreen && state !== WND_STATE.FULL_SCREEN) {
                    wndState = WND_STATE.FULL_SCREEN
                } else if (isMaximized && state !== WND_STATE.MAXIMIZED) {
                    wndState = WND_STATE.MAXIMIZED
                    win.webContents.executeJavaScript(`app.chrome.maximized = true`)
                } else if (state !== WND_STATE.NORMAL) {
                    wndState = WND_STATE.NORMAL
                    win.webContents.executeJavaScript(`app.chrome.maximized = false`)
                }
            })
        }

        win.on("closed", () => {
            this.win = null
        })

        // Set window Handler
        win.webContents.setWindowOpenHandler((x: any) => {
            if (x.url.includes("apple") || x.url.includes("localhost")) {
                return {action: "allow"}
            }
            electron.shell.openExternal(x.url).catch(console.error)
            return {action: 'deny'}
        })

    }
}