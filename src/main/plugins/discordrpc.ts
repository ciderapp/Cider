import * as RPC from 'discord-rpc'
import {ipcMain} from "electron";
import fetch from 'electron-fetch'

export default class DiscordRPC {

    /**
     * Private variables for interaction in plugins
     */
    private _utils: any;
    private _app: any;
    private _attributes: any;
    private _connection: boolean = false;

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'Discord Rich Presence';
    public description: string = 'Discord RPC plugin for Cider';
    public version: string = '1.0.0';
    public author: string = 'vapormusic/Core (Cider Collective)';

    /**
     * Plugin Initialization
     */
    private _client: any = null;
    private _activity: RPC.Presence = {
        details: '',
        state: '',
        largeImageKey: '',
        largeImageText: '',
        smallImageKey: '',
        smallImageText: '',
        instance: false
    };

    private _activityCache: RPC.Presence = {
        details: '',
        state: '',
        largeImageKey: '',
        largeImageText: '',
        smallImageKey: '',
        smallImageText: '',
        instance: false
    };

    /*******************************************************************************************
     * Private Methods
     * ****************************************************************************************/

    /**
     * Connect to Discord RPC
     * @private
     */
    private connect() {
        if (!this._utils.getStoreValue("general.discord_rpc.enabled")) {
            return;
        }
        const clientId = this._utils.getStoreValue("general.discord_rpc.client") === "Cider" ? '911790844204437504' : '886578863147192350';

        // Apparently needed for ask to join, join, spectate etc.
        RPC.register(clientId)

        // Create the client
        this._client = new RPC.Client({transport: "ipc"});

        // Runs on Ready
        this._client.on('ready', () => {
            console.info(`[DiscordRPC][connect] Successfully Connected to Discord. Authed for user: ${this._client.user.id}.`);
        })

        // Handles Errors
        this._client.on('error', (err: any) => {
            console.error(`[DiscordRPC] ${err}`);
            this.disconnect()
        });

        // If Discord is closed, allow reconnecting
        this._client.transport.once('close', () => {
            console.info(`[DiscordRPC] Connection closed`);
            this.disconnect()
        });

        // Login to Discord
        this._client.login({clientId})
            .then(() => {
                this._connection = true;
            })
            .catch((e: any) => console.error(`[DiscordRPC][connect] ${e}`));
    }

    /**
     * Disconnects from Discord RPC
     */
    private disconnect() {
        if (!this._client) {
            return
        }

        this._client.destroy().then(() => {
            this._connection = false;
            console.log('[DiscordRPC][disconnect] Disconnected from discord.')
        }).catch((e: any) => console.error(`[DiscordRPC][disconnect] ${e}`));

        // Clean up, allow creating a new connection
        this._client = null;
    }

    /**
     * Filter the Discord activity object
     */
    private static filterActivity(activity: any, attributes: any): Object {

        /**
         * Works with:
         * {artist}
         * {composer}
         * {title}
         * {album}
         * {trackNumber}
         */
        const rpcVars: any = {
            "artist": attributes.artistName,
            "composer": attributes.composerName,
            "title": attributes.name,
            "album": attributes.albumName,
            "trackNumber": attributes.trackNumber
        }

        // Replace the variables
        Object.keys(rpcVars).forEach((key) => {
            if (activity.details.includes(`{${key}}`)) {
                activity.details = activity.details.replace(`{${key}}`, rpcVars[key])
            }
            if (activity.state.includes(`{${key}}`)) {
                activity.state = activity.state.replace(`{${key}}`, rpcVars[key])
            }
        })

        // Checks if the details is greater than 128 because some songs can be that long
        if (activity.details && activity.details.length >= 128) {
            activity.details = activity.details.substring(0, 125) + '...'
        }

        // Checks if the state is greater than 128 because some songs can be that long
        if (activity.state && activity.state.length >= 128) {
            activity.state = activity.state.substring(0, 125) + '...'
        }

        // Checks if the state is greater than 128 because some songs can be that long
        if (activity.largeImageText && activity.largeImageText.length >= 128) {
            activity.largeImageText = activity.largeImageText.substring(0, 125) + '...'
        }

        // Check large image
        if (activity.largeImageKey == null || activity.largeImageKey === "" || activity.largeImageKey.length > 256) {
            activity.largeImageKey = "cider";
        }

        // Timestamp
        if (new Date(attributes.endTime).getTime() < 0) {
            delete activity.startTime
            delete activity.endTime
        }

        // not sure
        if (!attributes.artistName) {
            delete activity.state;
        }

        if (!activity.largeImageText || activity.largeImageText.length < 2) {
            delete activity.largeImageText
        }
        return activity
    }

    /**
     * Sets the activity
     * @param {activity} activity
     */
    private setActivity(activity: any) {
        if (!this._connection || !this._client || !activity) {
            return
        }

        // Filter the activity
        activity = DiscordRPC.filterActivity(activity, this._attributes)

        // Set the activity
        if (!this._attributes.status && this._utils.getStoreValue("general.discord_rpc.clear_on_pause")) {
            this._client.clearActivity()
        } else if (this._activity && this._activityCache !== this._activity && this._activity.details) {
            this._client.setActivity(activity)
            this._activityCache = this._activity;
        }
    }

    /**
     * Sets the activity of the client
     * @param {object} attributes
     */
    private updateActivity(attributes: any) {
        if (!this._utils.getStoreValue("general.discord_rpc.enabled") || this._utils.getStoreValue("general.privateEnabled")) {
            return
        } else if (!this._client || !this._connection) {
            this.connect()
        }

        // Check if show buttons is (true) or (false)
        this._activity = {
            details: this._utils.getStoreValue("general.discord_rpc.details_format"),
            state: this._utils.getStoreValue("general.discord_rpc.state_format"),
            largeImageKey: attributes?.artwork?.url?.replace('{w}', '1024').replace('{h}', '1024'),
            largeImageText: attributes.albumName,
            instance: false // Whether the activity is in a game session
        }

        // Add the buttons if people want them
        if (!this._utils.getStoreValue("general.discord_rpc.hide_buttons")) {
            this._activity.buttons = [
                {label: 'Listen on Cider', url: attributes.url.cider},
                {label: 'View on Apple Music', url: attributes.url.appleMusic}
            ] //To change attributes.url => preload/cider-preload.js
        }

        // Add the timestamp if its playing
        if (attributes.status) {
            this._activity.startTimestamp = Date.now() - (attributes?.durationInMillis - attributes?.remainingTime)
            this._activity.endTimestamp = attributes.endTime
        }

        // If the user wants to keep the activity when paused
        if (!this._utils.getStoreValue("general.discord_rpc.clear_on_pause")) {
            this._activity.smallImageKey = attributes.status ? 'play' : 'pause';
            this._activity.smallImageText = attributes.status ? 'Playing' : 'Paused';
        }

        this.setActivity(this._activity)
    }

    /*******************************************************************************************
     * Public Methods
     * ****************************************************************************************/

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(utils: { getStore: () => any; getApp: () => any; }) {
        this._utils = utils;
        console.debug(`[Plugin][${this.name}] Loading Complete.`);
        this._app = utils.getApp();
    }

    /**
     * Runs on app ready
     */
    onReady(_win: any): void {
        let self = this
        this.connect();
        console.debug(`[Plugin][${this.name}] Ready.`);
        ipcMain.on('updateRPCImage', (_event, imageurl) => {
            if (!this._utils.getStoreValue("general.privateEnabled")) {
                fetch('https://api.cider.sh/v1/images', {

                    method: 'POST',
                    body: JSON.stringify({url: imageurl}),
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': _win.webContents.getUserAgent()
                    },
                })
                    .then(res => res.json())
                    .then(function (json) {
                        self._attributes["artwork"]["url"] = json.url
                        self.updateActivity(self._attributes)
                    })
            }
        })
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        if (this._client) {
            this.disconnect()
        }
        console.debug(`[Plugin][${this.name}] Stopped.`);
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.status = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {
        this._attributes = attributes
        this.updateActivity(attributes)

    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {
        this._attributes = attributes
        this.updateActivity(attributes)

    }
}
