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
    private _utils: any = null;
    private _activityCache: any = {
        details: '',
        state: '',
        largeImageKey: '',
        largeImageText: '',
        smallImageKey: '',
        smallImageText: '',
        instance: false
    };


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
    onNowPlayingItemDidChange(attributes: object): void {
        this._attributes = attributes
        this.scrobbleTrack(attributes)
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
                this.scrobbleTrack(attributes)
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
                this.scrobbleTrack(attributes)
            })
        }


    }

    /**
     * Scrobbles the track to lastfm
     * @param attributes
     * @private
     */
    private scrobbleTrack(attributes: any): void {
        if (!attributes?.lfmTrack || !attributes?.lfmAlbum) {
            this.verifyTrack(attributes)
            return
        }

        if (!this._authenticated || !attributes) return;
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
        if (!this._utils.getApp().isPackaged) {
            console.debug(scrobble)
        }
        this._lfm.track.scrobble(scrobble, (err: any, res: any) => {
            if (err) {
                console.error(`[${lastfm.name}] [lastfm:scrobble] Scrobble failed: ${err.message}`);
            } else {
                console.debug(`[${lastfm.name}] [lastfm:scrobble] Track scrobbled: ${res}`);
            }
        });
        this._activityCache = attributes
    }

    private updateNowPlaying(attributes: any): void {
        if (!this._authenticated) return;
        this._lfm.track.updateNowPlaying({
            'artist': attributes.artistName,
            'track': attributes.name,
            'album': attributes.albumName,
            'albumArtist': attributes.albumName,
            'trackNumber': attributes.trackNumber,
            'duration': attributes.duration / 1000,
        }, function (err: any, scrobbled: any) {
            if (err) {
                return console.error('[LastFM] An error occurred while updating now playing', err);
            }

            console.log('[LastFM] Successfully updated now playing: ', scrobbled);
        });
    }

}