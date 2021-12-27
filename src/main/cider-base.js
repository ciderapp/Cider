const {BrowserWindow, ipcMain, shell, app, screen} = require("electron")
const {join} = require("path")
const getPort = require("get-port");
const express = require("express");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const os = require('os');
const Store = require("electron-store");
const store = new Store();
const yt = require('youtube-search-without-api-key');

// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

const CiderBase = {
    async Start() {
        this.clientPort = await getPort({port : 9000});
        this.CreateBrowserWindow()
    },
    clientPort: 0,
    CreateBrowserWindow() {
        // Set default window sizes
        const mainWindowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600
        });

        let win = null
        const options = {
            icon: join(__dirname, `../../resources/icons/icon.ico`),
            width: mainWindowState.width,
            height: mainWindowState.height,
            x: mainWindowState.x,
            y: mainWindowState.y,
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
                preload: join(__dirname, '../preload/cider-preload.js')
            }
        }

        CiderBase.InitWebServer()

        // Create the BrowserWindow
        if (process.platform === "darwin" || process.platform === "linux") {
            win = new BrowserWindow(options)
        } else {
            const {BrowserWindow} = require("electron-acrylic-window");
            win = new BrowserWindow(options)
        }

        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        win.webContents.session.webRequest.onBeforeRequest(
            {
                urls: ["https://*/*.js"]
            },
            (details, callback) => {
                if (details.url.includes("hls.js")) {
                    callback({
                        redirectURL: `http://localhost:${CiderBase.clientPort}/apple-hls.js`
                    })
                } else {
                    callback({
                        cancel: false
                    })
                }
            }
        )

        win.webContents.session.webRequest.onBeforeSendHeaders(async (details, callback)  =>  {
             if(details.url == "https://buy.itunes.apple.com/account/web/info"){
                details.requestHeaders['sec-fetch-site'] = 'same-site';
                details.requestHeaders['DNT'] = '1';
                let itspod = await win.webContents.executeJavaScript(`window.localStorage.getItem("music.ampwebplay.itspod")`) 
                if (itspod != null)
                details.requestHeaders['Cookie'] = `itspod=${itspod}`
            }
            callback({ requestHeaders: details.requestHeaders })
        })

        let location = `http://localhost:${CiderBase.clientPort}/`
        win.loadURL(location)
        win.on("closed", () => {
            win = null
        })

        // Register listeners on Window to track size and position of the Window.
        mainWindowState.manage(win);

        // IPC stuff (senders)
        ipcMain.on("cider-platform", (event) => {
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
            var u = track + " " + artist + " official video";
			const videos = await yt.search(u);
            return videos
        })

        ipcMain.handle('getStoreValue', (event, key, defaultValue) => {
            return (defaultValue ? app.cfg.get(key, true) : app.cfg.get(key));
        });

        ipcMain.handle('setStoreValue', (event, key, value) => {
            app.cfg.set(key, value);
        });

        ipcMain.on('getStore', (event) => {
            event.returnValue = app.cfg.store
        })

        ipcMain.on('setStore', (event, store) => {
            app.cfg.store = store
        })

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

        if (process.platform === "win32") {
            let WND_STATE = {
                MINIMIZED: 0,
                NORMAL: 1,
                MAXIMIZED: 2,
                FULL_SCREEN: 3
            }
            let wndState = WND_STATE.NORMAL

            win.on("resize", (_event) => {
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
                return { action: "allow"}
            }
            shell.openExternal(url).catch(() => {})
            return {
                action: 'deny'
            }
        })

        // Set scale
        ipcMain.on('setScreenScale', (event, scale) => {
            win.webContents.setZoomFactor(parseFloat(scale))
        }) 
        return win
    },

    EnvironmentVariables: {
        "env": {
            platform: os.platform(),
            dev: app.isPackaged
        }
    },

    async InitWebServer() {
        const webapp = express();
        const webRemotePath = path.join(__dirname, '../renderer/');
        webapp.set("views", path.join(webRemotePath, "views"));
        webapp.set("view engine", "ejs");

        webapp.use(function (req, res, next) {
            // if not localhost
            if (req.headers.host.includes("localhost") && req.headers["user-agent"].includes("Cider")) {
                next();
            }
        });

        webapp.use(express.static(webRemotePath));
        webapp.get('/', function (req, res) {
            //res.sendFile(path.join(webRemotePath, 'index_old.html'));
            res.render("main", CiderBase.EnvironmentVariables)
        });
        webapp.listen(CiderBase.clientPort, function () {
            console.log(`Cider client port: ${CiderBase.clientPort}`);
        });
    },

}

module.exports = CiderBase;
