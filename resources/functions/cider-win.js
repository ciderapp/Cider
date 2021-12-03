const {app, BrowserWindow, ipcMain} = require("electron")
const {join, resolve} = require("path")

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
                webSecurity: true,
                allowRunningInsecureContent: true,
                enableRemoteModule: true,
                sandbox: true,
                nativeWindowOpen: true
            }
        }
        if (process.platform === "darwin" || process.platform === "linux") {
            win = new BrowserWindow(options)
        } else {
            const {BrowserWindow} = require("electron-acrylic-window");
            win = new BrowserWindow(options)
        }
        let location = join(__dirname, "../cider-ui-tests/index.html")
        win.loadFile(location)
        win.on("closed", () => {
            win = null
        })
    },
    SetupHandlers() {
    }
}

module.exports = CiderWin;