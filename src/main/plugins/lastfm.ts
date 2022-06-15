// https://github.com/maxkueng/node-lastfmapi
// https://github.com/maxkueng/lastfm-autocorrect
// @todo: add autocorrect
// @todo: add scrobble and filter to prevent no-title-found being scrobbled
// @todo: handle session keys through config to stop aids session.json

export default class lastfm {

    /**
     * Base Plugin Information
     */
    public name: string = 'LastFM Plugin for Cider';
    public version: string = '2.0.0';
    public author: string = 'Core (Cider Collective)';

    /**
     * Private variables for interaction in plugins
     */
    private _attributes: any;
    private _apiCredentials = {
        key: "f9986d12aab5a0fe66193c559435ede3",
        secret: "acba3c29bd5973efa38cc2f0b63cc625"
    }
    /**
     * Plugin Initialization
     */
    private _lfm: any = null;
    private _authenticated: boolean = false;
    private _scrobbleDelay: any = null;
    private _utils: any = null;
    private _scrobbleCache: any = {};
    private _nowPlayingCache: any = {};

    /**
     * Public Methods
     */

    constructor(utils: any) {
        this._utils = utils;
        this.initializeLastFM("", this._apiCredentials)
    }

    onReady(win: Electron.BrowserWindow): void {

        // Register the ipcMain handlers
        this._utils.getIPCMain().handle('lastfm:url', (event: any) => {
            // console.debug('lastfm:url', event)
            return this._lfm.getAuthenticationUrl({"cb": "cider://auth/lastfm"})
        })

        this._utils.getIPCMain().on('lastfm:auth', (event: any, token: string) => {
            // console.debug('lastfm:auth', event, token)
            this.authenticateLastFM(token)
        })
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.status = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {
        this._attributes = attributes
        // this.scrobbleTrack(attributes)
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: any): void {
        this._attributes = attributes
        if (!attributes?.lfmTrack || !attributes?.lfmAlbum) {
            this.verifyTrack(attributes)
            return
        }
        this.scrobbleTrack(attributes)
        this.updateNowPlayingTrack(attributes)
    }

    /**
     * Initialize LastFM
     * @param token
     * @param api
     * @private
     */
    private initializeLastFM(token: string, api: { key: string, secret: string }): void {
        const LastfmAPI = require("lastfmapi")
        this._lfm = new LastfmAPI({
            'api_key': api.key,
            'secret': api.secret,
        });

        if (this._utils.getStoreValue("lastfm.secrets.username") && this._utils.getStoreValue("lastfm.secrets.key")) {
            this._lfm.setSessionCredentials(this._utils.getStoreValue("lastfm.secrets.username"), this._utils.getStoreValue("lastfm.secrets.key"));
            this._authenticated = true;
        } else {
            this.authenticateLastFM(token)
        }
    }

    /**
     * Authenticate the user with the given token
     * @param token
     * @private
     */
    private authenticateLastFM(token: string): void {
        if (!token) return;
        this._lfm.authenticate(token, (err: any, session: any) => {
            if (err) {
                console.error(err);
                return;
            }
            this._utils.setStoreValue("lastfm.secrets.token", token)
            this._utils.setStoreValue('lastfm.secrets.username', session.username);
            this._utils.setStoreValue('lastfm.secrets.key', session.key);
            this._authenticated = true;
        });
    }

    /**
     * Verifies the track information with lastfm
     * @param attributes
     * @private
     */
    private verifyTrack(attributes: any): object {
        if (!attributes) return {};

        if (!attributes.lfmAlbum) {
            return this._lfm.album.getInfo({
                "artist": attributes.artistName,
                "album": attributes.albumName
            }, (err: any, data: any) => {
                if (err) {
                    console.error(`[${lastfm.name}] [album.getInfo] Error: ${err}`)
                    return {};
                }
                if (data) {
                    attributes.lfmAlbum = data
                }
                this.onNowPlayingItemDidChange(attributes)
            })
        } else {
            return this._lfm.track.getCorrection(attributes.artistName, attributes.name, (err: any, data: any) => {
                if (err) {
                    console.error(`[${lastfm.name}] [track.getCorrection] Error: ${err}`)
                    console.error(err)
                    return {};
                }
                if (data) {
                    attributes.lfmTrack = data.correction.track
                }
                this.onNowPlayingItemDidChange(attributes)
            })
        }


    }

    /**
     * Scrobbles the track to lastfm
     * @param attributes
     * @private
     */
    private scrobbleTrack(attributes: any): void {
        if (!this._authenticated || !attributes || (this._scrobbleCache.track === attributes.lfmTrack.name)) return;

        if (this._scrobbleDelay) {
            clearTimeout(this._scrobbleDelay);
        }

        // Scrobble delay
        this._scrobbleDelay = setTimeout(() => {

            // Scrobble
            const scrobble = {
                'artist': attributes.lfmTrack.artist.name,
                'track': attributes.lfmTrack.name,
                'album': attributes.lfmAlbum.name,
                'albumArtist': attributes.lfmAlbum.artist,
                'timestamp': new Date().getTime() / 1000,
                'trackNumber': attributes.trackNumber,
                'duration': attributes.durationInMillis / 1000,
            }

            // Easy Debugging
            if (!this._utils.getApp().isPackaged) {
                console.debug(scrobble)
            }

            // Scrobble the track
            this._lfm.track.scrobble(scrobble, (err: any, _res: any) => {
                if (err) {
                    console.error(`[${lastfm.name}] [lastfm:scrobble] Scrobble failed: ${err.message}`);
                } else {
                    console.debug(`[${lastfm.name}] [lastfm:scrobble] Track scrobbled: ${scrobble.artist} - ${scrobble.track}`);
                    this._scrobbleCache = scrobble
                }
            });
        }, Math.round(attributes.durationInMillis * Math.min((this._utils.getStoreValue("lastfm.scrobble_after") / 100), 0.8)))
    }

    private updateNowPlayingTrack(attributes: any): void {
        if (!this._authenticated || !attributes || (this._nowPlayingCache.track === attributes.lfmTrack.name)) return;

        const nowPlaying = {
            'artist': attributes.lfmTrack.artist.name,
            'track': attributes.lfmTrack.name,
            'album': attributes.lfmAlbum.name,
            'trackNumber': attributes.trackNumber,
            'duration': attributes.durationInMillis / 1000,
            'albumArtist': attributes.lfmAlbum.artist,
        }

        this._lfm.track.updateNowPlaying(nowPlaying, (err: any, res: any) => {
            if (err) {
                console.error(`[${lastfm.name}] [lastfm:updateNowPlaying] Now Playing Update failed: ${err.message}`);
            } else {
                console.log(res)
                console.debug(`[${lastfm.name}] [lastfm:updateNowPlaying] Now Playing Updated: ${nowPlaying.artist} - ${nowPlaying.track}`);
                this._nowPlayingCache = nowPlaying
            }
        });
    }

}