import * as path from "path";
import {app, ipcMain, shell} from "electron";
import * as windowStateKeeper from "electron-window-state";
import * as express from "express";
import * as getPort from "get-port";
import * as yt from "youtube-search-without-api-key";

export default class Win {
    public win: null | undefined;
    public app: Electron.App | undefined;

    private clientPort: number = 0;
    private static envVars: object = {
        "env": {
            // @ts-ignore
            platform: process.platform,
            // @ts-ignore
            dev: app.isPackaged
        }
    };
    private static options: any = {
        icon: path.join(__dirname, `../../../resources/icons/icon.ico`),
        width: 1024,
        height: 600,
        x: undefined,
        y: undefined,
        minWidth: 850,
        minHeight: 400,
        frame: false,
        title: "Cider",
        vibrancy: 'dark',
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
            preload: path.join(__dirname, '../../preload/cider-preload.js')
        }
    };

    get options() {
        return Win.options;
    }

    /**
     * Creates the browser window
     */
    public async createWindow(): Promise<Electron.BrowserWindow> {
        this.clientPort = await getPort({port: 9000});

        let BrowserWindow;
        if (process.platform === "win32") {
            BrowserWindow = require("electron-acrylic-window").BrowserWindow;
        } else {
            BrowserWindow = require("electron").BrowserWindow;
        }

        // Load the previous state with fallback to defaults
        const windowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600
        });
        this.options.width = windowState.width;
        this.options.height = windowState.height;

        // Create the browser window.
        const win = new BrowserWindow(this.options);
        console.debug('Browser window created');
        this.win = win;

        // and load the renderer.
        this.startWebServer(win)
        this.startSession(win);
        this.startHandlers(win);


        return win;
    }

    /**
     * Starts the webserver for the renderer process.
     * @param win The BrowserWindow
     */
    private startWebServer(win: Electron.BrowserWindow): void {
        const webapp = express(),
            webRemotePath = path.join(__dirname, '../../renderer/');

        webapp.set("views", path.join(webRemotePath, "views"));
        webapp.set("view engine", "ejs");

        webapp.use((req, res, next) => {
            // if not localhost
            // @ts-ignore
            if (req.headers.host.includes("localhost") && req.headers["user-agent"].includes("Cider")) {
                next();
            }
        });

        webapp.use(express.static(webRemotePath));
        webapp.get('/', function (req, res) {
            //res.sendFile(path.join(webRemotePath, 'index_old.html'));
            res.render("main", Win.envVars)
        });
        webapp.listen(this.clientPort, () => {
            console.debug(`Cider client port: ${this.clientPort}`);
        });
    }

    /**
     * Starts the session for the renderer process.
     * @param win The BrowserWindow
     */
    private startSession(win: Electron.BrowserWindow): void {
        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        win.webContents.session.webRequest.onBeforeRequest(
            {
                urls: ["https://*/*.js"]
            },
            (details, callback) => {
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

        win.webContents.session.webRequest.onBeforeSendHeaders(async (details, callback) => {
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
    private startHandlers(win: Electron.BrowserWindow): void {
        win.on('closed', () => {
            this.win = null;
        });

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

        // Set window Handler
        win.webContents.setWindowOpenHandler(({url}) => {
            if (url.includes("apple") || url.includes("localhost")) {
                return {action: "allow"}
            }
            shell.openExternal(url).catch(() => {
            })
            return {
                action: 'deny'
            }
        })

        //-------------------------------------------------------------------------------
        // Renderer IPC Listeners
        //-------------------------------------------------------------------------------

        ipcMain.on("cider-platform", (event) => {
            event.returnValue = process.platform
        })

        ipcMain.on("get-gpu-mode", (event) => {
            event.returnValue = process.platform
        })

        ipcMain.on("is-dev", (event) => {
            event.returnValue = !app.isPackaged
        })

        // IPC stuff (listeners)
        ipcMain.on('close', () => { // listen for close event
            win.close();
        })

        ipcMain.handle('getYTLyrics', async (event, track, artist) => {
            const u = track + " " + artist + " official video";
            const videos = await yt.search(u);
            return videos
        })

        // ipcMain.handle('getStoreValue', (event, key, defaultValue) => {
        //     return (defaultValue ? app.cfg.get(key, true) : app.cfg.get(key));
        // });
        //
        // ipcMain.handle('setStoreValue', (event, key, value) => {
        //     app.cfg.set(key, value);
        // });
        //
        // ipcMain.on('getStore', (event) => {
        //     event.returnValue = app.cfg.store
        // })
        //
        // ipcMain.on('setStore', (event, store) => {
        //     app.cfg.store = store
        // })

        ipcMain.on('maximize', () => { // listen for maximize event
            if (win.isMaximized()) {
                win.unmaximize()
            } else {
                win.maximize()
            }
        })

        ipcMain.on('minimize', () => { // listen for minimize event
            win.minimize();
        })

        // Set scale
        ipcMain.on('setScreenScale', (event, scale) => {
            win.webContents.setZoomFactor(parseFloat(scale))
        })
    }
}