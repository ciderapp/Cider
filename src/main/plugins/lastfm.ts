import * as electron from 'electron';
import * as fs from 'fs';
import {resolve} from 'path';

export default class LastFMPlugin {
    private sessionPath = resolve(electron.app.getPath('userData'), 'session.json');
    private apiCredentials = {
        key: "f9986d12aab5a0fe66193c559435ede3",
        secret: "acba3c29bd5973efa38cc2f0b63cc625"
    }
    /**
     * Private variables for interaction in plugins
     */
    private _win: any;
    private _app: any;
    private _lastfm: any;
    private _store: any;
    private _timer: any;

    private authenticateFromFile() {
        let sessionData = require(this.sessionPath)
        console.log("[LastFM][authenticateFromFile] Logging in with Session Info.")
        this._lastfm.setSessionCredentials(sessionData.username, sessionData.key)
        console.log("[LastFM][authenticateFromFile] Logged in.", sessionData.username, sessionData.key)
    }


    authenticate() {
        try {
            if (this._store.lastfm.auth_token) {
                this._store.lastfm.enabled = true;
            }

            if (!this._store.lastfm.enabled || !this._store.lastfm.auth_token) {
                this._store.lastfm.enabled = false;
                return
            }
            /// dont move this require to top , app wont load
            const LastfmAPI = require('lastfmapi');
            const lfmAPI = new LastfmAPI({
                'api_key': this.apiCredentials.key,
                'secret': this.apiCredentials.secret
            });

            this._lastfm = Object.assign(lfmAPI, {cachedAttributes: false, cachedNowPlayingAttributes: false});

            fs.stat(this.sessionPath, (err: any) => {
                if (err) {
                    console.error("[LastFM][Session] Session file couldn't be opened or doesn't exist,", err)
                    console.log("[LastFM][Auth] Beginning authentication from configuration")
                    console.log("[LastFM][tk]", this._store.lastfm.auth_token)
                    this._lastfm.authenticate(this._store.lastfm.auth_token, (err: any, session: any) => {
                        if (err) {
                            throw err;
                        }
                        console.log("[LastFM] Successfully obtained LastFM session info,", session); // {"name": "LASTFM_USERNAME", "key": "THE_USER_SESSION_KEY"}
                        console.log("[LastFM] Saving session info to disk.")
                        let tempData = JSON.stringify(session)
                        fs.writeFile(this.sessionPath, tempData, (err: any) => {
                            if (err)
                                console.log("[LastFM][fs]", err)
                            else {
                                console.log("[LastFM][fs] File was written successfully.")
                                this.authenticateFromFile()
                                new electron.Notification({
                                    title: electron.app.getName(),
                                    body: "Successfully logged into LastFM using Authentication Key."
                                }).show()
                            }
                        })
                    });
                } else {
                    this.authenticateFromFile()
                }
            })
        } catch (err) {
            console.log(err)
        }
    }

    private scrobbleSong(attributes: any) {
        if (this._timer) clearTimeout(this._timer);
        var self = this;
        this._timer = setTimeout(async () => {
            const currentAttributes = attributes;

            if (!self._lastfm || self._lastfm.cachedAttributes === attributes) {
                return
            }

            if (self._lastfm.cachedAttributes) {
                if (self._lastfm.cachedAttributes.playParams.id === attributes.playParams.id) return;
            }

            const artist = await this.getPrimaryArtist(attributes)
            const album = this.getAlbumName(attributes)

            if (currentAttributes.status && currentAttributes === attributes) {
                if (fs.existsSync(this.sessionPath)) {
                    // Scrobble playing song.
                    if (attributes.status === true) {
                        self._lastfm.track.scrobble({
                            'artist': artist,
                            'track': attributes.name,
                            'album': album,
                            'albumArtist': artist,
                            'timestamp': new Date().getTime() / 1000
                        }, function (err: any, scrobbled: any) {
                            if (err) {
                                return console.error('[LastFM] An error occurred while scrobbling', err);
                            }

                            console.log('[LastFM] Successfully scrobbled: ', scrobbled);
                        });
                        self._lastfm.cachedAttributes = attributes
                    }
                } else {
                    self.authenticate();
                }
            } else {
                return console.log('[LastFM] Did not add ', attributes.name, '—', artist, 'because now playing a other song.');
            }
        }, Math.round(attributes.durationInMillis * Math.min((self._store.lastfm.scrobble_after / 100), 0.8)));
    }

    private async updateNowPlayingSong(attributes: any) {
        if (!this._lastfm || this._lastfm.cachedNowPlayingAttributes === attributes || !this._store.lastfm.NowPlaying) {
            return
        }

        if (this._lastfm.cachedNowPlayingAttributes) {
            if (this._lastfm.cachedNowPlayingAttributes.playParams.id === attributes.playParams.id) return;
        }

        if (fs.existsSync(this.sessionPath)) {
            const artist = await this.getPrimaryArtist(attributes)
            const album = this.getAlbumName(attributes)

            // update Now Playing
            if (attributes.status === true) {
                this._lastfm.track.updateNowPlaying({
                    'artist': artist,
                    'track': attributes.name,
                    'album': album,
                    'albumArtist': artist
                }, function (err: any, nowPlaying: any) {
                    if (err) {
                        return console.error('[LastFM] An error occurred while updating nowPlayingSong', err);
                    }

                    console.log('[LastFM] Successfully updated nowPlayingSong', nowPlaying);
                });
                this._lastfm.cachedNowPlayingAttributes = attributes
            }

        } else {
            this.authenticate()
        }
    }

    private getAlbumName(attributes: any): string {
        return attributes.albumName.replace(/ - Single| - EP/g, '');
    }

    private async getPrimaryArtist(attributes: any) {
        const songId = attributes.playParams.catalogId || attributes.playParams.id

        if (!this._store.lastfm.enabledRemoveFeaturingArtists || !songId) return attributes.artistName;

        const res = await this._win.webContents.executeJavaScript(`
            (async () => {
                const subMk = await MusicKit.getInstance().api.v3.music("/v1/catalog/" + MusicKit.getInstance().storefrontId + "/songs/${songId}", {
                    include: {
                        songs: ["artists"]
                    }
                })
                if (!subMk) console.error('[LastFM] Request failed: /v1/catalog/us/songs/${songId}')
                return subMk.data
            })()
        `).catch(console.error)
        if (!res) return attributes.artistName

        const data = res.data
        if (!data.length) {
            console.error(`[LastFM] Unable to locate song with id of ${songId}`)
            return attributes.artistName;
        }

        const artists = res.data[0].relationships.artists.data
        if (!artists.length) {
            console.error(`[LastFM] Unable to find artists related to the song with id of ${songId}`)
            return attributes.artistName;
        }

        const primaryArtist = artists[0]
        return primaryArtist.attributes.name
    }

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'LastFMPlugin';
    public description: string = 'LastFM plugin for Cider';
    public version: string = '0.0.1';
    public author: string = 'vapormusic / Cider Collective';

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(utils: { getApp: () => any; getStore: () => any; }) {
        this._app = utils.getApp();
        this._store = utils.getStore()
        utils.getApp().on('second-instance', (_e: any, argv: any) => {
            // Checks if first instance is authorized and if second instance has protocol args
            argv.forEach((value: any) => {
                if (value.includes('auth')) {
                    console.log('[LastFMPlugin ok]')
                    let authURI = String(argv).split('/auth/')[1];
                    if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                        const authKey = authURI.split('lastfm?token=')[1];
                        this._store.lastfm.enabled = true;
                        this._store.lastfm.auth_token = authKey;
                        console.log(authKey);
                        this._win.webContents.send('LastfmAuthenticated', authKey);
                        this.authenticate();
                    }
                }
            })
        })
        electron.app.on('open-url', (event: any, arg: any) => {
            console.log('[LastFMPlugin] yes')
            event.preventDefault();
            if (arg.includes('auth')) {
                let authURI = String(arg).split('/auth/')[1];
                if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                    const authKey = authURI.split('lastfm?token=')[1];
                    this._store.lastfm.enabled = true;
                    this._store.lastfm.auth_token = authKey;
                    this._win.webContents.send('LastfmAuthenticated', authKey);
                    console.log(authKey);
                    this.authenticate();
                }
            }
        })
    }

    /**
     * Runs on app ready
     */
    onReady(win: any): void {
        this._win = win;
        this.authenticate();
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        console.log('Example plugin stopped');
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    nowPlayingItemDidChangeLastFM(attributes: any): void {
        if (!this._store.general.privateEnabled) {
            attributes.status = true
            if (!this._store.lastfm.filterLoop) {
                this._lastfm.cachedNowPlayingAttributes = false;
                this._lastfm.cachedAttributes = false
            }
            this.updateNowPlayingSong(attributes)
            this.scrobbleSong(attributes)
        }
    }

}
