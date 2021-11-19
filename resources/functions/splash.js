const {
    BrowserWindow
} = require('electron');

const SplashScreen = {
    win: null,
    show: function () {
        this.win = new BrowserWindow({
            width: 300,
            height: 300,
            resizable: false,
            show: true,
            center: true,
            transparent: true,
            frame: false,
            alwaysOnTop: true,
            // skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true
            }
        })
        this.win.show()
        this.win.loadFile('./resources/splash/index.html')
        this.win.on("closed", () => {
            this.win = null
        })
    }
}

module.exports = SplashScreen