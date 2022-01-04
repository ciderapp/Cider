import * as path from "path";
import {app, ipcMain} from "electron";
import {join} from "path";
import * as windowStateKeeper from "electron-window-state";
import * as express from "express";
import * as getPort from "get-port";

export default class Win {
    public win: Electron.BrowserWindow | undefined;
    public app: Electron.App | undefined;

    private static port: number = 0;
    private static envVars: object = {
        "env": {
            // @ts-ignore
            platform: process.platform,
            // @ts-ignore
            dev: app.isPackaged
        }
    };
    private static options: any = {
        icon: join(__dirname, `../../../resources/icons/icon.ico`),
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
            preload: join(__dirname, '../../preload/cider-preload.js')
        }
    };

    get options() {
        return Win.options;
    }

    /**
     * Creates the browser window
     */
    public createWindow(): Electron.BrowserWindow {
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

        // and load the renderer.
        this.startWebServer(win)
            .then((url) => {
                console.log(url)
                this.startSession(win, url);
            })
            .catch(console.error);




        this.win = win;
        return win;
    }

    /**
     * Starts the webserver for the renderer process.
     * @param win The window to use
     */
    private async startWebServer(win: Electron.BrowserWindow): Promise<string> {
        Win.port = await getPort({port: 9000});

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
        webapp.listen(Win.port, function () {
            console.debug(`Cider client port: ${Win.port}`);
        });

        return "http://localhost:" + Win.port;
    }

    /**
     * Starts the session for the renderer process.
     * @param win The window to use
     * @param location The location of the renderer
     */
    private startSession(win: Electron.BrowserWindow, location: string) {
        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        win.webContents.session.webRequest.onBeforeRequest(
            {
                urls: ["https://*/*.js"]
            },
            (details, callback) => {
                if (details.url.includes("hls.js")) {
                    callback({
                        redirectURL: `http://localhost:${Win.port}/apple-hls.js`
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

        win.loadURL(location).catch(console.error);
    }
}