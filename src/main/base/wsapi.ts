// @ts-nocheck

import * as ws from "ws";
import * as http from "http";
import * as https from "https";
import * as url from "url";
import * as fs from "fs";
import * as path from "path";
import * as electron from "electron";
const WebSocket = ws;
const WebSocketServer = ws.Server;

private class standardResponse {
    status: number;
    message: string;
    data: any;
    type: string;
}

export class wsapi {
    port: any = 26369
    wss: any = null
    clients: []
    createId() {
        // create random guid
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    public async InitWebSockets () {
        electron.ipcMain.on('wsapi-updatePlaybackState', (event, arg) => {
            wsapi.updatePlaybackState(arg);
        })

        electron.ipcMain.on('wsapi-returnQueue', (event, arg) => {
            wsapi.returnQueue(JSON.parse(arg));
        });

        electron.ipcMain.on('wsapi-returnSearch', (event, arg) => {
            console.log("SEARCH")
            wsapi.returnSearch(JSON.parse(arg));
        });

        electron.ipcMain.on('wsapi-returnSearchLibrary', (event, arg) => {
            wsapi.returnSearchLibrary(JSON.parse(arg));
        });

        electron.ipcMain.on('wsapi-returnDynamic', (event, arg, type) => {
            wsapi.returnDynamic(JSON.parse(arg), type);
        });

        electron.ipcMain.on('wsapi-returnMusicKitApi', (event, arg, method) => {
            wsapi.returnMusicKitApi(JSON.parse(arg), method);
        });

        electron.ipcMain.on('wsapi-returnLyrics', (event, arg) => {
            wsapi.returnLyrics(JSON.parse(arg));
        });
        this.wss = new WebSocketServer({
            port: this.port,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    // See zlib defaults.
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                // Other options settable:
                clientNoContextTakeover: true, // Defaults to negotiated value.
                serverNoContextTakeover: true, // Defaults to negotiated value.
                serverMaxWindowBits: 10, // Defaults to negotiated value.
                // Below options specified as default values.
                concurrencyLimit: 10, // Limits zlib concurrency for perf.
                threshold: 1024 // Size (in bytes) below which messages
                // should not be compressed if context takeover is disabled.
            }
        })
        console.log(`WebSocketServer started on port: ${this.port}`);

        const defaultResponse = new standardResponse(0, {}, "OK");


        this.wss.on('connection', function connection(ws) {
            ws.id = wsapi.createId();
            console.log(`Client ${ws.id} connected`)
            wsapi.clients.push(ws);
            ws.on('message', function incoming(message) {

            });
            // ws on message
            ws.on('message', function incoming(message) {
                let data = JSON.parse(message);
                let response = new standardResponse(0, {}, "OK");;
                if (data.action) {
                    data.action.toLowerCase();
                }
                switch (data.action) {
                    default:
                        response.message = "Action not found";
                        break;
                    case "identify":
                        response.message = "Thanks for identifying!"
                        response.data = {
                            id: ws.id
                        }
                        ws.identity = {
                            name: data.name,
                            author: data.author,
                            description: data.description,
                            version: data.version
                        }
                        break;
                    case "play-next":
                        electron.app.win.webContents.executeJavaScript(`wsapi.playNext(\`${data.type}\`,\`${data.id}\`)`);
                        response.message = "Play Next";
                        break;
                    case "play-later":
                        electron.app.win.webContents.executeJavaScript(`wsapi.playLater(\`${data.type}\`,\`${data.id}\`)`);
                        response.message = "Play Later";
                        break;
                    case "quick-play":
                        electron.app.win.webContents.executeJavaScript(`wsapi.quickPlay(\`${data.term}\`)`);
                        response.message = "Quick Play";
                        break;
                    case "get-lyrics":
                        electron.app.win.webContents.executeJavaScript(`wsapi.getLyrics()`);
                        break;
                    case "shuffle":
                        electron.app.win.webContents.executeJavaScript(`wsapi.toggleShuffle()`);
                        break;
                    case "set-shuffle":
                        if(data.shuffle == true) {
                            electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().shuffleMode = 1`);
                        }else{
                            electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().shuffleMode = 0`);
                        }
                        break;
                    case "repeat":
                        electron.app.win.webContents.executeJavaScript(`wsapi.toggleRepeat()`);
                        break;
                    case "seek":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().seekToTime(${parseFloat(data.time)})`);
                        response.message = "Seek";
                        break;
                    case "pause":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().pause()`);
                        response.message = "Paused";
                        break;
                    case "play":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().play()`);
                        response.message = "Playing";
                        break;
                    case "stop":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().stop()`);
                        response.message = "Stopped";
                        break;
                    case "volume":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().volume = ${parseFloat(data.volume)}`);
                        response.message = "Volume";
                        break;
                    case "mute":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().mute()`);
                        response.message = "Muted";
                        break;
                    case "unmute":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().unmute()`);
                        response.message = "Unmuted";
                        break;
                    case "next":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().skipToNextItem()`);
                        response.message = "Next";
                        break;
                    case "previous":
                        electron.app.win.webContents.executeJavaScript(`MusicKit.getInstance().skipToPreviousItem()`);
                        response.message = "Previous";
                        break;
                    case "musickit-api":
                        electron.app.win.webContents.executeJavaScript(`wsapi.musickitApi(\`${data.method}\`, \`${data.id}\`, ${JSON.stringify(data.params)})`);
                        break;
                    case "musickit-library-api":
                        break;
                    case "set-autoplay":
                        electron.app.win.webContents.executeJavaScript(`wsapi.setAutoplay(${data.autoplay})`);
                        break;
                    case "queue-move":
                        electron.app.win.webContents.executeJavaScript(`wsapi.moveQueueItem(${data.from},${data.to})`);
                        break;
                    case "get-queue":
                        electron.app.win.webContents.executeJavaScript(`wsapi.getQueue()`);
                        break;
                    case "search":
                        if (!data.limit) {
                            data.limit = 10;
                        }
                        electron.app.win.webContents.executeJavaScript(`wsapi.search(\`${data.term}\`, \`${data.limit}\`)`);
                        break;
                    case "library-search":
                        if (!data.limit) {
                            data.limit = 10;
                        }
                        electron.app.win.webContents.executeJavaScript(`wsapi.searchLibrary(\`${data.term}\`, \`${data.limit}\`)`);
                        break;
                    case "show-window":
                        electron.app.win.show()
                        break;
                    case "hide-window":
                        electron.app.win.hide()
                        break;
                    case "play-mediaitem":
                        electron.app.win.webContents.executeJavaScript(`wsapi.playTrackById(${data.id}, \`${data.kind}\`)`);
                        response.message = "Playing track";
                        break;
                    case "get-status":
                        response.data = {
                            isAuthorized: true
                        };
                        response.message = "Status";
                        break;
                    case "get-currentmediaitem":
                        electron.app.win.webContents.executeJavaScript(`wsapi.getPlaybackState()`);
                        break;
                }
                ws.send(JSON.stringify(response));
            });

            ws.on('close', function close() {
                // remove client from list
                wsapi.clients.splice(wsapi.clients.indexOf(ws), 1);
                console.log(`Client ${ws.id} disconnected`);
            });
            ws.send(JSON.stringify(defaultResponse));
        });
    }
    sendToClient(id) {
        // replace the clients.forEach with a filter to find the client that requested
    }
    updatePlaybackState(attr) {
        const response = new standardResponse(0, attr, "OK", "playbackStateUpdate");
        wsapi.clients.forEach(function each(client) {
            client.send(JSON.stringify(response));
        });
    }
    returnMusicKitApi(results, method) {
        const response = new standardResponse(0, results, "OK", `musickitapi.${method}`);
        wsapi.clients.forEach(function each(client) {
            client.send(JSON.stringify(response));
        });
    }
    returnDynamic(results, type) {
        const response = new standardResponse(0, results, "OK", type);
        wsapi.clients.forEach(function each(client) {
            client.send(JSON.stringify(response));
        });
    }
    returnLyrics(results) {
        const response = new standardResponse(0, results, "OK", "lyrics");
        wsapi.clients.forEach(function each(client) {
            client.send(JSON.stringify(response));
        });
    }
    returnSearch(results) {
        const response = new standardResponse(0, results, "OK", "searchResults");
        wsapi.clients.forEach(function each(client) {
            client.send(JSON.stringify(response));
        });
    }
    returnSearchLibrary(results) {
        const response = new standardResponse(0, results, "OK", "searchResultsLibrary");
        wsapi.clients.forEach(function each(client) {
            client.send(JSON.stringify(response));
        });
    }
    returnQueue(queue) {
        const response = new standardResponse(0, queue, "OK", "queue");
        wsapi.clients.forEach(function each(client) {
            client.send(JSON.stringify(response));
        });
    }
}