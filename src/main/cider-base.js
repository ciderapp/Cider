const { BrowserWindow, ipcMain, shell, app, screen } = require("electron")
const { join } = require("path")
const getPort = require("get-port");
const express = require("express");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const os = require('os');
const yt = require('youtube-search-without-api-key');
const discord = require('./discordrpc');
const lastfm = require('./lastfm');
const { writeFile, writeFileSync, existsSync, mkdirSync } = require('fs');
const fs = require('fs');
const mpris = require('./mpris');
const mm = require('music-metadata');
//const mdns = require('mdns')
const qrcode = require('qrcode-terminal')
const fetch = require('electron-fetch').default;
const { Stream } = require('stream');

// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({ dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214" });

const CiderBase = {
    win: null,
    requests: [],
    audiostream: new Stream.PassThrough(),
    async Start() {
        this.clientPort = await getPort({ port: 9000 });
        this.win = this.CreateBrowserWindow()
    },
    clientPort: 0,
    CreateBrowserWindow() {
        this.VerifyFiles()
            // Set default window sizes
        const mainWindowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600
        });

        let win = null
        const options = {
            icon: join(__dirname, `../../resources/icons/icon.` + (process.platform === "win32" ? "ico" : "png")),
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
        win = new BrowserWindow(options)

        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        win.webContents.session.webRequest.onBeforeRequest({
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

        win.webContents.session.webRequest.onBeforeSendHeaders(async(details, callback) => {
            if (details.url === "https://buy.itunes.apple.com/account/web/info") {
                details.requestHeaders['sec-fetch-site'] = 'same-site';
                details.requestHeaders['DNT'] = '1';
                let itspod = await win.webContents.executeJavaScript(`window.localStorage.getItem("music.ampwebplay.itspod")`)
                if (itspod != null)
                    details.requestHeaders['Cookie'] = `itspod=${itspod}`
            }
            callback({ requestHeaders: details.requestHeaders })
        })

        win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            if(details.url.match(/^https:\/\/store-\d{3}\.blobstore\.apple\.com/) || details.url.startsWith("https://store-037.blobstore.apple.com")){
            details.responseHeaders['Access-Control-Allow-Origin'] = '*';}
            callback({ responseHeaders: details.responseHeaders })
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

        ipcMain.on('put-library-songs', (event, arg) => {
            fs.writeFileSync(join(app.paths.ciderCache, "library-songs.json"), JSON.stringify(arg))
        })

        ipcMain.on('put-library-artists', (event, arg) => {
            fs.writeFileSync(join(app.paths.ciderCache, "library-artists.json"), JSON.stringify(arg))
        })

        ipcMain.on('put-library-albums', (event, arg) => {
            fs.writeFileSync(join(app.paths.ciderCache, "library-albums.json"), JSON.stringify(arg))
        })

        ipcMain.on('put-library-playlists', (event, arg) => {
            fs.writeFileSync(join(app.paths.ciderCache, "library-playlists.json"), JSON.stringify(arg))
        })

        ipcMain.on('put-library-recentlyAdded', (event, arg) => {
            fs.writeFileSync(join(app.paths.ciderCache, "library-recentlyAdded.json"), JSON.stringify(arg))
        })

        ipcMain.on('get-library-songs', (event) => {
            let librarySongs = fs.readFileSync(join(app.paths.ciderCache, "library-songs.json"), "utf8")
            event.returnValue = JSON.parse(librarySongs)
        })

        ipcMain.on('get-library-artists', (event) => {
            let libraryArtists = fs.readFileSync(join(app.paths.ciderCache, "library-artists.json"), "utf8")
            event.returnValue = JSON.parse(libraryArtists)
        })

        ipcMain.on('get-library-albums', (event) => {
            let libraryAlbums = fs.readFileSync(join(app.paths.ciderCache, "library-albums.json"), "utf8")
            event.returnValue = JSON.parse(libraryAlbums)
        })

        ipcMain.on('get-library-playlists', (event) => {
            let libraryPlaylists = fs.readFileSync(join(app.paths.ciderCache, "library-playlists.json"), "utf8")
            event.returnValue = JSON.parse(libraryPlaylists)
        })

        ipcMain.on('get-library-recentlyAdded', (event) => {
            let libraryRecentlyAdded = fs.readFileSync(join(app.paths.ciderCache, "library-recentlyAdded.json"), "utf8")
            event.returnValue = JSON.parse(libraryRecentlyAdded)
        })

        ipcMain.handle('getYTLyrics', async(event, track, artist) => {
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

        ipcMain.handle('setVibrancy', (event, key, value) => {
            win.setVibrancy(value)
        });

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

        ipcMain.on('setFullScreen', (event, flag) => {
            win.setFullScreen(flag)
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
        win.webContents.setWindowOpenHandler(({ url }) => {
            if (url.includes("apple") || url.includes("localhost")) {
                return { action: "allow" }
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

        win.webContents.setZoomFactor(screen.getPrimaryDisplay().scaleFactor)

        mpris.connect(win)

        lastfm.authenticate()
            //  Discord
        discord.connect((app.cfg.get("general.discord_rpc") == 1) ? '911790844204437504' : '886578863147192350');
        ipcMain.on('playbackStateDidChange', (_event, a) => {
            app.media = a;
            discord.updateActivity(a)
            mpris.updateState(a)
            lastfm.scrobbleSong(a)
            lastfm.updateNowPlayingSong(a)
        });

        ipcMain.on('nowPlayingItemDidChange', (_event, a) => {
            app.media = a;
            discord.updateActivity(a)
            mpris.updateAttributes(a)
            lastfm.scrobbleSong(a)
            lastfm.updateNowPlayingSong(a)
        });

        ipcMain.on("getPreviewURL", (_event, url) => {
            fetch(url)
                .then(res => res.buffer())
                .then(async(buffer) => {
                    try {
                        const metadata = await mm.parseBuffer(buffer, 'audio/x-m4a');
                        SoundCheckTag = metadata.native.iTunes[1].value
                        win.webContents.send('SoundCheckTag', SoundCheckTag)
                    } catch (error) {
                        console.error(error.message);
                    }
                })
        });

        ipcMain.on('writeAudio', function(event, buffer) {
            CiderBase.audiostream.write(Buffer.from(buffer));
        })

        return win
    },
    VerifyFiles() {
        const expectedDirectories = [
            "CiderCache"
        ]
        const expectedFiles = [
            "library-songs.json",
            "library-artists.json",
            "library-albums.json",
            "library-playlists.json",
            "library-recentlyAdded.json",
        ]
        for (let i = 0; i < expectedDirectories.length; i++) {
            if (!existsSync(path.join(app.getPath("userData"), expectedDirectories[i]))) {
                mkdirSync(path.join(app.getPath("userData"), expectedDirectories[i]))
            }
        }
        for (let i = 0; i < expectedFiles.length; i++) {
            const file = path.join(app.paths.ciderCache, expectedFiles[i])
            if (!existsSync(file)) {
                writeFileSync(file, JSON.stringify([]))
            }
        }
    },
    EnvironmentVariables: {
        "env": {
            platform: os.platform(),
            dev: app.isPackaged
        }
    },
    LinkHandler: (startArgs) => {
        if (!startArgs) return;
        console.log("lfmtoken", String(startArgs))
        if (String(startArgs).includes('auth')) {
            let authURI = String(startArgs).split('/auth/')[1]
            if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                const authKey = authURI.split('lastfm?token=')[1];
                app.cfg.set('lastfm.enabled', true);
                app.cfg.set('lastfm.auth_token', authKey);
                CiderBase.win.webContents.send('LastfmAuthenticated', authKey);
                lastfm.authenticate()
            }
        } else {
            const formattedSongID = startArgs.replace('ame://', '').replace('/', '');
            console.warn(`[LinkHandler] Attempting to load song id: ${formattedSongID}`);

            // setQueue can be done with album, song, url, playlist id
            this.win.webContents.executeJavaScript(`
                MusicKit.getInstance().setQueue({ song: '${formattedSongID}'}).then(function(queue) {
                    MusicKit.getInstance().play();
                });
            `).catch((err) => console.error(err));
        }

    },

    async InitWebServer() {
        const webapp = express();
        const webRemotePath = path.join(__dirname, '../renderer/');
        webapp.set("views", path.join(webRemotePath, "views"));
        webapp.set("view engine", "ejs");
        let firstRequest = true
            //const webRemoteMDNS = mdns.createAdvertisement(mdns.tcp('https'), 9000, { name: "cider", domain: 'local' })
            //webRemoteMDNS.start()
            //* Prep for remote -quack
        webapp.use(function(req, res, next) {
            // if not localhost
            if (req.url.includes("audio.webm") || (req.headers.host.includes("localhost") && req.headers["user-agent"].includes("Cider"))) {
                next();

            } else {
                console.log(req.get('host'))
                res.redirect("https://discord.gg/applemusic")
            }
        });
        webapp.use(express.static(webRemotePath));
        webapp.get('/', function(req, res) {
            //if (!req.headers["user-agent"].includes("Cider"))
            //res.sendFile(path.join(webRemotePath, 'index_old.html'));
            if (firstRequest) {
                console.log("---- Ignore Me ;) ---")
                qrcode.generate(`http://${os.hostname}:9000`) //Prep for remote
                console.log("---- Ignore Me ;) ---")
                    /*
                     *
                     *   USING https://www.npmjs.com/package/qrcode-terminal for terminal
                     *   WE SHOULD USE https://www.npmjs.com/package/qrcode for the remote (or others)
                     *   -quack
                     */
            }
            firstRequest = false

            res.render("main", CiderBase.EnvironmentVariables)
        });
        webapp.get('/audio.webm', function(req, res) {
            console.log('hi')
            try {
                req.connection.setTimeout(Number.MAX_SAFE_INTEGER);
                // CiderBase.requests.push({req: req, res: res});
                // var pos = CiderBase.requests.length - 1;
                // req.on("close", () => {
                //     console.info("CLOSED", CiderBase.requests.length);
                //     requests.splice(pos, 1);
                //     console.info("CLOSED", CiderBase.requests.length);
                // });
                CiderBase.audiostream.on('data', (data) => {
                    try {
                        res.write(data);
                    } catch (ex) {
                        console.log(ex)
                    }
                })
            } catch (ex) { console.log(ex) }
        });
        webapp.listen(CiderBase.clientPort, function() {
            console.log(`Cider hosted on: ${CiderBase.clientPort}`);
        });
    },

}

module.exports = CiderBase;
