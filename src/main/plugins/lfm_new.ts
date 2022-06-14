import {app} from 'electron';

// https://github.com/maxkueng/node-lastfmapi
// https://github.com/maxkueng/lastfm-autocorrect
// @todo: add autocorrect
// @todo: add scrobble and filter to prevent no-title-found being scrobbled
// @todo: handle session keys through config to stop aids session.json

export default class lfm_new {

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
     * Initialize LastFM
     * @param token
     * @param api
     * @private
     */
    private initializeLastFM(token:  string, api: {key: string, secret: string}): void {
        const LastfmAPI = require("lastfmapi")
        this._lfm = new LastfmAPI({
            'api_key' : api.key,
            'secret' : api.secret,
        });

        if (this._utils.getStoreValue("lastfm.secrets.session")) {
            this._lfm.setSessionCredentials(this._utils.getStoreValue("lastfm.secrets.session"));
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
            if (err) { console.error(err); return; }
            console.log(session); // {"name": "LASTFM_USERNAME", "key": "THE_USER_SESSION_KEY"}
            this._utils.setStoreValue('lastfm.secrets.session', session);
            this._authenticated = true;
        });
    }

    /**
     * Public Methods
     */
    public authenticateUser(token: string): void {
        this.initializeLastFM(token, this._apiCredentials)
    }

    constructor(utils: any) {
        this._utils = utils;
        this.authenticateUser("")
    }

    public onReady(win: Electron.BrowserWindow): void {

        this._utils.getIPCMain().handle('lfm_new:url', (event: any) => {
            console.debug('lfm_new:url', event)
            return this._lfm.getAuthenticationUrl({"cb": "cider://auth/lastfm"})
        })

        this._utils.getIPCMain().on('lfm_new:auth', (event: any, token: string) => {
            console.debug('lfm_new:auth', event, token)
            this.authenticateUser(token)
        })
    }



}