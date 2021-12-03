const {app, BrowserWindow, ipcMain} = require("electron")
const {join, resolve} = require("path")
const getPort = require("get-port");
const express = require("express");
const path = require("path");

const CiderWin = {
    CreateBrowserWindow() {
        let win = null
        const options = {
            width: 1024,
            height: 600,
            minWidth: 844,
            minHeight: 410,
            frame: false,
            vibrancy: 'dark',
            hasShadow: false,
            webPreferences: {
                plugins: true,
                nodeIntegration: true,
                nodeIntegrationInWorker: false,
                webSecurity: false,
                allowRunningInsecureContent: true,
                enableRemoteModule: true,
                sandbox: true,
                nativeWindowOpen: true
            }
        }
        CiderWin.InitWebServer()
        if (process.platform === "darwin" || process.platform === "linux") {
            win = new BrowserWindow(options)
        } else {
            const {BrowserWindow} = require("electron-acrylic-window");
            win = new BrowserWindow(options)
        }

        let location = "http://localhost:9000/"
        win.loadURL(location)
        win.on("closed", () => {
            win = null
        })
    },
    async InitWebServer() {
        const webRemotePort = await getPort({port : 9000});
        const webapp = express();
        const webRemotePath = path.join(__dirname, '../cider-ui-tests/');
        webapp.use(express.static(webRemotePath));
        webapp.get('/', function (req, res) {
            res.sendFile(path.join(webRemotePath, 'index.html'));
        });
        webapp.listen(webRemotePort, function () {
            console.log(`Web Remote listening on port ${webRemotePort}`);
        });
    }
}

module.exports = CiderWin;