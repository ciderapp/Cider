import * as utils from '../base/utils';
import {app} from 'electron';
// @ts-ignore
import LastfmAPI from 'lastfmapi';

// https://github.com/maxkueng/node-lastfmapi
// https://github.com/maxkueng/lastfm-autocorrect

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
    private _client: any = null;
    private _lastfm: any = null;
    private _activityCache: any = {
        details: '',
        state: '',
        largeImageKey: '',
        largeImageText: '',
        smallImageKey: '',
        smallImageText: '',
        instance: false
    };

    constructor() {
    }

    /**
     * Private Methods
     */
    private initializeLastFM(clientSession:  string): void {
        
    }


}