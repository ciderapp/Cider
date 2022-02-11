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
        if(this._timer) clearTimeout(this._timer);
        var self = this;
        this._timer = setTimeout(() => {
        const currentAttributes = attributes;

        if (!self._lastfm || self._lastfm.cachedAttributes === attributes) {
            return
        }

        if (self._lastfm.cachedAttributes) {
            if (self._lastfm.cachedAttributes.playParams.id === attributes.playParams.id) return;
        }

        if (currentAttributes.status && currentAttributes === attributes) {
            if (fs.existsSync(this.sessionPath)) {
                // Scrobble playing song.
                if (attributes.status === true) {
                    self._lastfm.track.scrobble({
                        'artist': this.filterArtistName(attributes.artistName),
                        'track': attributes.name,
                        'album': attributes.albumName,
                        'albumArtist': self.filterArtistName(attributes.artistName),
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
            return console.log('[LastFM] Did not add ', attributes.name, '—', self.filterArtistName(attributes.artistName), 'because now playing a other song.');
        }},Math.round(attributes.durationInMillis * (self._store.lastfm.scrobble_after / 100)));
    }

    private filterArtistName(artist: any) {
        if (!this._store.lastfm.enabledRemoveFeaturingArtists) return artist;

        artist = artist.split(' ');
        if (artist.includes('&')) {
            artist.length = artist.indexOf('&');
        }
        if (artist.includes('and')) {
            artist.length = artist.indexOf('and');
        }
        artist = artist.join(' ');
        if (artist.includes(',')) {
            artist = artist.split(',')
            artist = artist[0]
        }
        return artist.charAt(0).toUpperCase() + artist.slice(1);
    }

    private updateNowPlayingSong(attributes: any) {
        if (!this._lastfm || this._lastfm.cachedNowPlayingAttributes === attributes || !this._store.lastfm.NowPlaying) {
            return
        }

        if (this._lastfm.cachedNowPlayingAttributes) {
            if (this._lastfm.cachedNowPlayingAttributes.playParams.id === attributes.playParams.id) return;
        }

        if (fs.existsSync(this.sessionPath)) {
            // update Now Playing
            if (attributes.status === true) {
                this._lastfm.track.updateNowPlaying({
                    'artist': this.filterArtistName(attributes.artistName),
                    'track': attributes.name,
                    'album': attributes.albumName,
                    'albumArtist': this.filterArtistName(attributes.artistName)
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
    constructor(app: any, store: any) {
        this._app = app;
        this._store = store
        electron.app.on('second-instance', (_e: any, argv: any) => {
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
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.status = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {
        this.updateNowPlayingSong(attributes)
        this.scrobbleSong(attributes)
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {
        if (!this._store.lastfm.filterLoop){
            this._lastfm.cachedNowPlayingAttributes = false;
            this._lastfm.cachedAttributes = false}    
        this.updateNowPlayingSong(attributes)    
        this.scrobbleSong(attributes)                
    }

}