import * as path from "path";
import * as electron from "electron";
import * as electronAcrylic from "electron-acrylic-window"
import * as windowStateKeeper from "electron-window-state";
import * as express from "express";
import * as getPort from "get-port";
import * as yt from "youtube-search-without-api-key";

export class Win {
    win: any | undefined;
    app: electron.App | undefined;

    private srcPath: string = path.join(__dirname, "../../src");
    private resourcePath: string = path.join(__dirname, "../../resources");
    private clientPort: number = 0;
    private EnvironmentVariables: object = {
        "env": {
            platform: process.platform,
            dev: electron.app.isPackaged
        }
    };
    private options: any = {
        icon: path.join(this.resourcePath, `icons/icon.ico`),
        width: 1024,
        height: 600,
        x: undefined,
        y: undefined,
        minWidth: 850,
        minHeight: 400,
        frame: false,
        title: "Cider",
        transparent: process.platform === "darwin",
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
            preload: path.join(this.srcPath, 'preload/cider-preload.js')
        }
    };

    /**
     * Creates the browser window
     */
    async createWindow(): Promise<any | undefined> {
        this.clientPort = await getPort({port: 9000});

        // Load the previous state with fallback to defaults
        const windowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600
        });
        this.options.width = windowState.width;
        this.options.height = windowState.height;

        this.startWebServer()

        if (process.platform === "win32") {
            this.win = new electronAcrylic.BrowserWindow(this.options);
        } else {
            this.win = new electron.BrowserWindow(this.options);
        }

        // Create the browser window.

        console.debug('Browser window created');

        // and load the renderer.
        this.startSession(this.win);
        this.startHandlers(this.win);

        return this.win;
    }

    /**
     * Starts the webserver for the renderer process.
     */
    private startWebServer(): void {
        const webapp = express();
        const webRemotePath = path.join(this.srcPath, 'renderer');
        webapp.set("views", path.join(webRemotePath, "views"));
        webapp.set("view engine", "ejs");

        webapp.use(function (req, res, next) {
            // if not localhost
            // @ts-ignore
            if (req.url.includes("audio.webm") || (req.headers.host.includes("localhost") && req.headers["user-agent"].includes("Cider"))) {
                next();
            }
        });

        webapp.use(express.static(webRemotePath));
        webapp.get('/', (req, res) => {
            //res.sendFile(path.join(webRemotePath, 'index_old.html'));
            console.log(req)
            res.render("main", this.EnvironmentVariables)
        });
        // webelectron.app.get('/audio.webm', (req, res) => {
        //     try {
        //         req.connection.setTimeout(Number.MAX_SAFE_INTEGER);
        //         this.audiostream.on('data', (data) => {
        //             try {
        //                 res.write(data);
        //             } catch (ex) {
        //                 console.log(ex)
        //             }
        //         })
        //     } catch (ex) { console.log(ex) }
        // });
        webapp.listen(this.clientPort, () => {
            console.log(`Cider client port: ${this.clientPort}`);
        });
    }

    /**
     * Starts the session for the renderer process.
     */
    private startSession(win: any): void {const self = this;

        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        win.webContents.session.webRequest.onBeforeRequest(
            {
                urls: ["https://*/*.js"]
            },
            (details: { url: string | string[]; }, callback: (arg0: { redirectURL?: string; cancel?: boolean; }) => void) => {
                if (details.url.includes("hls.js")) {
                    callback({
                        redirectURL: `http://localhost:${self.clientPort}/apple-hls.js`
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
                let ItsPod = await win.webContents.executeJavaScript(`window.localStorage.getItem("music.ampwebplay.itspod")`)
                if (ItsPod != null)
                    details.requestHeaders['Cookie'] = `itspod=${ItsPod}`
            }
            callback({requestHeaders: details.requestHeaders})
        })

        const location = `http://localhost:${this.clientPort}/`
        console.log('yeah')
        win.loadURL(location)
            .then(() => {
                console.debug(`Cider client location: ${location}`);
            })
            .catch(console.error);
    }

    /**
     * Initializes the window handlers
     * @param win The BrowserWindow
     */
    private startHandlers(win: any): void {
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
                    win.webContents.executeJavaScript(`electron.app.chrome.maximized = true`)
                } else if (state !== WND_STATE.NORMAL) {
                    wndState = WND_STATE.NORMAL
                    win.webContents.executeJavaScript(`electron.app.chrome.maximized = false`)
                }
            })
        }

        // Set window Handler
        win.webContents.setWindowOpenHandler((x: any) => {
            if (x.url.includes("apple") || x.url.includes("localhost")) {
                return {action: "allow"}
            }
            electron.shell.openExternal(x.url).catch(() => {
            })
            return {
                action: 'deny'
            }
        })

        //-------------------------------------------------------------------------------
        // Renderer IPC Listeners
        //-------------------------------------------------------------------------------

        electron.ipcMain.on("cider-platform", (event) => {
            event.returnValue = process.platform
        })

        electron.ipcMain.on("get-gpu-mode", (event) => {
            event.returnValue = process.platform
        })

        electron.ipcMain.on("is-dev", (event) => {
            event.returnValue = !electron.app.isPackaged
        })

        // IPC stuff (listeners)
        electron.ipcMain.on('close', () => { // listen for close event
            win.close();
        })

        electron.ipcMain.handle('getYTLyrics', async (event, track, artist) => {
            const u = track + " " + artist + " official video";
            return await yt.search(u)
        })

        // electron.ipcMain.handle('getStoreValue', (event, key, defaultValue) => {
        //     return (defaultValue ? electron.app.cfg.get(key, true) : electron.app.cfg.get(key));
        // });
        //
        // electron.ipcMain.handle('setStoreValue', (event, key, value) => {
        //     electron.app.cfg.set(key, value);
        // });
        //
        // electron.ipcMain.on('getStore', (event) => {
        //     event.returnValue = electron.app.cfg.store
        // })
        //
        // electron.ipcMain.on('setStore', (event, store) => {
        //     electron.app.cfg.store = store
        // })

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
    }
}