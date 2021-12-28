const {join} = require("path"),
    {ipcMain, app, shell, screen} = require("electron"),
    express = require("express"),
    path = require("path"),
    getPort = require("get-port"),
    yt = require("youtube-search-without-api-key"),
    os = require("os");

module.exports = {

    browserWindow: {},

    clientPort: await getPort({port: 9000}),

    EnvironmentVariables: {
        "env": {
            platform: os.platform(),
            dev: app.isPackaged
        }
    },

    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * Creates the BrowserWindow for the application.
     * @return {object} Window
     */
    createBrowserWindow() {
        const windowStateKeeper = require("electron-window-state"),
            BrowserWindow = require((process.platform === "win32") ? "electron-acrylic-window" : "electron").BrowserWindow;

        const windowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600
        });

        this.browserWindow = new BrowserWindow({
            icon: join(__dirname, `../../../resources/icons/icon.ico`),
            width: windowState.width,
            height: windowState.height,
            x: windowState.x,
            y: windowState.y,
            minWidth: 844,
            minHeight: 410,
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
                preload: join(__dirname, '../../preload/cider-preload.js')
            }
        })

        this.initializeWebServer();
        this.initializeSession();
        this.initializeHandlers();

        windowState.manage(this.browserWindow);
        this.browserWindow.webContents.setZoomFactor(screen.getPrimaryDisplay().scaleFactor)

        return this.browserWindow
    },

    /**
     * Initializes the BrowserWindow handlers for the application.
     */
    initializeHandlers() {
        const self = this;

        this.browserWindow.on('closed', () => {
            this.browserWindow = null;
        });

        if (process.platform === "win32") {
            let WND_STATE = {
                MINIMIZED: 0,
                NORMAL: 1,
                MAXIMIZED: 2,
                FULL_SCREEN: 3
            }
            let wndState = WND_STATE.NORMAL

            self.browserWindow.on("resize", (_event) => {
                const isMaximized = self.browserWindow.isMaximized()
                const isMinimized = self.browserWindow.isMinimized()
                const isFullScreen = self.browserWindow.isFullScreen()
                const state = wndState;
                if (isMinimized && state !== WND_STATE.MINIMIZED) {
                    wndState = WND_STATE.MINIMIZED
                } else if (isFullScreen && state !== WND_STATE.FULL_SCREEN) {
                    wndState = WND_STATE.FULL_SCREEN
                } else if (isMaximized && state !== WND_STATE.MAXIMIZED) {
                    wndState = WND_STATE.MAXIMIZED
                    self.browserWindow.webContents.executeJavaScript(`app.chrome.maximized = true`)
                } else if (state !== WND_STATE.NORMAL) {
                    wndState = WND_STATE.NORMAL
                    self.browserWindow.webContents.executeJavaScript(`app.chrome.maximized = false`)
                }
            })
        }

        // Set window Handler
        this.browserWindow.webContents.setWindowOpenHandler(({url}) => {
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
            self.browserWindow.close();
        })

        ipcMain.handle('getYTLyrics', async (event, track, artist) => {
            const u = track + " " + artist + " official video";
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
            if (self.browserWindow.isMaximized()) {
                self.browserWindow.unmaximize()
            } else {
                self.browserWindow.maximize()
            }
        })

        ipcMain.on('minimize', () => { // listen for minimize event
            self.browserWindow.minimize();
        })

        // Set scale
        ipcMain.on('setScreenScale', (event, scale) => {
            self.browserWindow.webContents.setZoomFactor(parseFloat(scale))
        })
    },

    /**
     * Starts the webserver
     */
    initializeWebServer() {
        const self = this;
        const webapp = express(),
            webRemotePath = path.join(__dirname, '../../renderer/');

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
            res.render("main", self.EnvironmentVariables)
        });
        webapp.listen(this.clientPort, function () {
            console.log(`Cider client port: ${self.clientPort}`);
        });
    },

    /**
     * Initializes the application session.
     */
    initializeSession() {
        const self = this;

        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        this.browserWindow.webContents.session.webRequest.onBeforeRequest(
            {
                urls: ["https://*/*.js"]
            },
            (details, callback) => {
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

        this.browserWindow.webContents.session.webRequest.onBeforeSendHeaders(async (details, callback) => {
            if (details.url === "https://buy.itunes.apple.com/account/web/info") {
                details.requestHeaders['sec-fetch-site'] = 'same-site';
                details.requestHeaders['DNT'] = '1';
                let itspod = await this.browserWindow.webContents.executeJavaScript(`window.localStorage.getItem("music.ampwebplay.itspod")`)
                if (itspod != null)
                    details.requestHeaders['Cookie'] = `itspod=${itspod}`
            }
            callback({requestHeaders: details.requestHeaders})
        })

        let location = `http://localhost:${this.clientPort}/`
        this.browserWindow.loadURL(location).catch(err => {
            console.log(err)
        })
    }

}