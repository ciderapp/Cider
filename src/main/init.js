const {app} = require('electron');

module.export = () => {
    if (process.platform === "linux") app.commandLine.appendSwitch('disable-features', 'MediaSessionService');
}