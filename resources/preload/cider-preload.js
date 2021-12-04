const electron = require('electron')

console.log('preload is in baby')

process.once('loaded', () => {
    global.ipcRenderer = electron.ipcRenderer;
});