const {app, BrowserWindow} = require("electron")
const {join, resolve} = require("path")

const CiderWin = {
    CreateBrowserWindow() {
        let win = null
        const options = {
            width: 1024,
            height: 600,
            frame: false,
            vibrancy: 'dark',
            hasShadow: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                allowRunningInsecureContent: true,
                enableRemoteModule: true,
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
    }
}

module.exports = CiderWin;