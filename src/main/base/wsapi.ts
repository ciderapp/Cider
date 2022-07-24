import * as ws from "ws";
import * as electron from "electron";

const WebSocketServer = ws.Server;

interface standardResponse {
    status?: Number,
    message?: String,
    data?: any,
    type?: string,
}


export class wsapi {
    static clients: any;
    port: any = 26369
    wss: any = null
    clients: any = []
    private _win: any;

    constructor(win: any) {
        this._win = win;
    }


    createId() {
        // create random guid
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public async InitWebSockets() {
        electron.ipcMain.on('wsapi-updatePlaybackState', (_event: any, arg: any) => {
            this.updatePlaybackState(arg);
        })

        electron.ipcMain.on('wsapi-returnQueue', (_event: any, arg: any) => {
            this.returnQueue(JSON.parse(arg));
        });

        electron.ipcMain.on('wsapi-returnSearch', (_event: any, arg: any) => {
            console.log("SEARCH")
            this.returnSearch(JSON.parse(arg));
        });

        electron.ipcMain.on('wsapi-returnSearchLibrary', (_event: any, arg: any) => {
            this.returnSearchLibrary(JSON.parse(arg));
        });

        electron.ipcMain.on('wsapi-returnDynamic', (_event: any, arg: any, type: any) => {
            this.returnDynamic(JSON.parse(arg), type);
        });

        electron.ipcMain.on('wsapi-returnMusicKitApi', (_event: any, arg: any, method: any) => {
            this.returnMusicKitApi(JSON.parse(arg), method);
        });

        electron.ipcMain.on('wsapi-returnLyrics', (_event: any, arg: any) => {
            this.returnLyrics(JSON.parse(arg));
        });
        electron.ipcMain.on('wsapi-returnvolumeMax', (_event: any, arg: any) => {
            this.returnmaxVolume(JSON.parse(arg));
        });
        electron.ipcMain.on('wsapi-libraryStatus', (_event: any, inLibrary: boolean, rating: number) => {
            this.returnLibraryStatus(inLibrary, rating);
        });
        electron.ipcMain.on('wsapi-rate', (_event: any, kind: string, id: string, rating: number) => {
            this.returnRatingStatus(kind, id, rating);
        });
        electron.ipcMain.on('wsapi-change-library', (_event: any, kind: string, id: string, shouldAdd: boolean) => {
            this.returnLibraryChange(kind, id, shouldAdd);
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

        const defaultResponse: standardResponse = {status: 0, data: {}, message: "OK", type: "generic"};


        this.wss.on('connection', (ws: any) => {
            ws.id = this.createId();
            console.log(`Client ${ws.id} connected`)
            this.clients.push(ws);
            ws.on('message', function incoming(_message: any) {

            });
            // ws on message
            ws.on('message', (message: any) => {
                let data = JSON.parse(message);
                let response: standardResponse = {status: 0, data: {}, message: "OK", type: "generic"};
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
                        this._win.webContents.executeJavaScript(`wsapi.playNext(\`${data.type}\`,\`${data.id}\`)`);
                        response.message = "Play Next";
                        break;
                    case "play-later":
                        this._win.webContents.executeJavaScript(`wsapi.playLater(\`${data.type}\`,\`${data.id}\`)`);
                        response.message = "Play Later";
                        break;
                    case "quick-play":
                        this._win.webContents.executeJavaScript(`wsapi.quickPlay(\`${data.term}\`)`);
                        response.message = "Quick Play";
                        break;
                    case "get-lyrics":
                        this._win.webContents.executeJavaScript(`wsapi.getLyrics()`);
                        break;
                    case "shuffle":
                        this._win.webContents.executeJavaScript(`wsapi.toggleShuffle()`);
                        break;
                    case "set-shuffle":
                        if (data.shuffle == true) {
                            this._win.webContents.executeJavaScript(`MusicKit.getInstance().shuffleMode = 1`);
                        } else {
                            this._win.webContents.executeJavaScript(`MusicKit.getInstance().shuffleMode = 0`);
                        }
                        break;
                    case "repeat":
                        this._win.webContents.executeJavaScript(`wsapi.toggleRepeat()`);
                        break;
                    case "seek":
                        this._win.webContents.executeJavaScript(`MusicKit.getInstance().seekToTime(${parseFloat(data.time)})`);
                        response.message = "Seek";
                        break;
                    case "pause":
                        this._win.webContents.executeJavaScript(`MusicKit.getInstance().pause()`);
                        response.message = "Paused";
                        break;
                    case "playpause":
                        this._win.webContents.executeJavaScript(`MusicKitInterop.playPause()`);
                        response.message = "Play/Pause";
                        break
                    case "play":
                        this._win.webContents.executeJavaScript(`MusicKit.getInstance().play()`);
                        response.message = "Playing";
                        break;
                    case "stop":
                        this._win.webContents.executeJavaScript(`MusicKit.getInstance().stop()`);
                        response.message = "Stopped";
                        break;
                    case "volumeMax":
                        this._win.webContents.executeJavaScript(`wsapi.getmaxVolume()`);
                        response.message = "maxVolume";
                        break;
                    case "volume":
                        this._win.webContents.executeJavaScript(`MusicKit.getInstance().volume = ${parseFloat(data.volume)}`);
                        response.message = "Volume";
                        break;
                    case "mute":
                        this._win.webContents.executeJavaScript(`MusicKit.getInstance().mute()`);
                        response.message = "Muted";
                        break;
                    case "unmute":
                        this._win.webContents.executeJavaScript(`MusicKit.getInstance().unmute()`);
                        response.message = "Unmuted";
                        break;
                    case "next":
                        this._win.webContents.executeJavaScript(`if (MusicKit.getInstance().queue.nextPlayableItemIndex != -1 && MusicKit.getInstance().queue.nextPlayableItemIndex != null) {
                            try {
                                app.prevButtonBackIndicator = false;
                            } catch (e) { }
                             MusicKit.getInstance().changeToMediaAtIndex(MusicKit.getInstance().queue.nextPlayableItemIndex);}`);
                        response.message = "Next";
                        break;
                    case "previous":
                        this._win.webContents.executeJavaScript(`if (MusicKit.getInstance().queue.previousPlayableItemIndex != -1 && MusicKit.getInstance().queue.previousPlayableItemIndex != null) {MusicKit.getInstance().changeToMediaAtIndex(MusicKit.getInstance().queue.previousPlayableItemIndex)}`);
                        response.message = "Previous";
                        break;
                    case "musickit-api":
                        this._win.webContents.executeJavaScript(`wsapi.musickitApi(\`${data.method}\`, \`${data.id}\`, ${JSON.stringify(data.params)} , ${data.library})`);
                        break;
                    case "musickit-library-api":
                        break;
                    case "set-autoplay":
                        this._win.webContents.executeJavaScript(`wsapi.setAutoplay(${data.autoplay})`);
                        break;
                    case "queue-move":
                        this._win.webContents.executeJavaScript(`wsapi.moveQueueItem(${data.from},${data.to})`);
                        break;
                    case "get-queue":
                        this._win.webContents.executeJavaScript(`wsapi.getQueue()`);
                        break;
                    case "search":
                        if (!data.limit) {
                            data.limit = 10;
                        }
                        this._win.webContents.executeJavaScript(`wsapi.search(\`${data.term}\`, \`${data.limit}\`)`);
                        break;
                    case "library-search":
                        if (!data.limit) {
                            data.limit = 10;
                        }
                        this._win.webContents.executeJavaScript(`wsapi.searchLibrary(\`${data.term}\`, \`${data.limit}\`)`);
                        break;
                    case "show-window":
                        this._win.show()
                        break;
                    case "hide-window":
                        this._win.hide()
                        break;
                    case "play-mediaitem":
                        this._win.webContents.executeJavaScript(`wsapi.playTrackById("${data.id}", \`${data.kind}\`)`);
                        response.message = "Playing track";
                        break;
                    case "get-status":
                        response.data = {
                            isAuthorized: true
                        };
                        response.message = "Status";
                        break;
                    case "get-currentmediaitem":
                        this._win.webContents.executeJavaScript(`wsapi.getPlaybackState()`);
                        break;
                    case "library-status":
                        this._win.webContents.executeJavaScript(`wsapi.getLibraryStatus("${data.type}", "${data.id}")`);
                        break;
                    case "rating":
                        this._win.webContents.executeJavaScript(`wsapi.rate("${data.type}", "${data.id}", ${data.rating})`);
                        break;
                    case "change-library":
                        this._win.webContents.executeJavaScript(`wsapi.changeLibrary("${data.type}", "${data.id}", ${data.add})`);
                        break;
                    case "quit":
                        electron.app.quit();
                        break;
                }
                ws.send(JSON.stringify(response));
            });

            ws.on('close', () => {
                // remove client from list
                this.clients.splice(wsapi.clients.indexOf(ws), 1);
                console.log(`Client ${ws.id} disconnected`);
            });
            ws.send(JSON.stringify(defaultResponse));
        });
    }

    sendToClient(_id: any) {
        // replace the clients.forEach with a filter to find the client that requested
    }

    updatePlaybackState(attr: any) {
        const response: standardResponse = {status: 0, data: attr, message: "OK", type: "playbackStateUpdate"};
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnMusicKitApi(results: any, method: any) {
        const response: standardResponse = {status: 0, data: results, message: "OK", type: `musickitapi.${method}`};
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnDynamic(results: any, type: any) {
        const response: standardResponse = {status: 0, data: results, message: "OK", type: type};
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnLyrics(results: any) {
        const response: standardResponse = {status: 0, data: results, message: "OK", type: "lyrics"};
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnSearch(results: any) {
        const response: standardResponse = {status: 0, data: results, message: "OK", type: "searchResults"};
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnSearchLibrary(results: any) {
        const response: standardResponse = {status: 0, data: results, message: "OK", type: "searchResultsLibrary"};
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnQueue(queue: any) {
        const response: standardResponse = {status: 0, data: queue, message: "OK", type: "queue"};
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnmaxVolume(vol: any) {
        const response: standardResponse = {status: 0, data: vol, message: "OK", type: "maxVolume"};
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnLibraryStatus(inLibrary: boolean, rating: number) {
        const response: standardResponse = {
            status: 0, data: {
                inLibrary, rating
            }, message: "OK", type: "libraryStatus"
        }
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnRatingStatus(kind: string, id: string, rating: number) {
        const response: standardResponse = {
            status: 0, data: { kind, id, rating },
            message: "OK", type: "rate"
        };
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }

    returnLibraryChange(kind: string, id: string, shouldAdd: boolean) {
        const response: standardResponse = {
            status: 0, data: { kind, id, add: shouldAdd },
            message: "OK", type: "change-library"
        };
        this.clients.forEach(function each(client: any) {
            client.send(JSON.stringify(response));
        });
    }
}