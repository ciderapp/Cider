const {BrowserWindow, ipcMain, shell, app, screen} = require("electron")
const {join} = require("path")
const getPort = require("get-port");
const express = require("express");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const os = require('os');
const yt = require('youtube-search-without-api-key');
const discord = require('./plugins/discordrpc');
const lastfm = require('./plugins/lastfm');
const mpris = require('./plugins/mpris');

// Analytics for debugging.
const ElectronSentry = require("@sentry/electron");
ElectronSentry.init({dsn: "https://68c422bfaaf44dea880b86aad5a820d2@o954055.ingest.sentry.io/6112214"});

module.exports = {

    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
    * Starts the application (called on on-ready). - Starts BrowserWindow and WebServer
    */
    Start() {
        const {createBrowserWindow} = require("./base/win");
        app.win = createBrowserWindow()
    },

    /**
    * Initializes the main application (run before on-ready)
    */
    Init() {
        // Initialize the config.
        const {init} = require("./base/store");
        init()
    },

    /**
    * Handles all links being opened in the application.
     */
    LinkHandler(startArgs) {
        if (!startArgs) return;
        console.log("lfmtoken", String(startArgs))
        if (String(startArgs).includes('auth')) {
            let authURI = String(startArgs).split('/auth/')[1]
            if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                const authKey = authURI.split('lastfm?token=')[1];
                app.cfg.set('lastfm.enabled', true);
                app.cfg.set('lastfm.auth_token', authKey);
                app.win.webContents.send('LastfmAuthenticated', authKey);
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
}