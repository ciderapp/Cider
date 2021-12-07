const electron = require('electron')

console.log('Loaded Preload')

process.once('loaded', () => {
    console.log("Setting ipcRenderer")
    global.ipcRenderer = electron.ipcRenderer;
});