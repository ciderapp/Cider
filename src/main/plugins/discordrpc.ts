import * as RPC from 'discord-rpc'

export default class DiscordRichPresence {

    /**
     * Private variables for interaction in plugins
     */
    private static _store: any;
    private static _connection: boolean = false;

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
     * Connect to Discord
     * @param clientId
     * @private
     */
    private connect(clientId: any) {
        if (DiscordRichPresence._store.general.discord_rpc == 0) {
            return
        }

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
            console.error(`[DiscordRichPresence] ${err}`);
            this.disconnect()
        });

        // Login to Discord
        this._client.login({clientId})
        .then(() => {
            DiscordRichPresence._connection = true;
        })
        .catch((e: any) => console.error(`[DiscordRichPresence][connect] ${e}`));
    }

    /**
     * Disconnects from Discord RPC
     */
    private disconnect() {
        if (!this._client) return;

        this._client.destroy().then(() => {
            DiscordRichPresence._connection = false;
            console.log('[DiscordRPC][disconnect] Disconnected from discord.')
        }).catch((e: any) => console.error(`[DiscordRPC][disconnect] ${e}`));
    }

    /**
     * Sets the activity of the client
     * @param {object} attributes
     */
    private updateActivity(attributes: any) {
        if (!this._client) return;

        if (!DiscordRichPresence._connection) {
            this._client.clearActivity().catch((e: any) => console.error(`[DiscordRichPresence][clearActivity] ${e}`));
            return;
        }

        this._activity = {
            details: attributes.name,
            state: `${attributes.artistName ? `by ${attributes.artistName}` : ''}`,
            startTimestamp: ((new Date(attributes.endTime).getTime() < 0) ? null : attributes.startTime),
            endTimestamp: ((new Date(attributes.endTime).getTime() < 0) ? null : attributes.endTime),
            largeImageKey: (attributes.artwork.url.replace('{w}', '1024').replace('{h}', '1024')) ?? 'cider',
            largeImageText: attributes.albumName,
            instance: false, // Whether the activity is in a game session

            buttons: [
                {label: "Listen on Cider", url: attributes.url.cider},
                {label: "View on Apple Music", url: attributes.url.appleMusic},
            ]
        };


        // Checks if the name is greater than 128 because some songs can be that long
        if (this._activity.details && this._activity.details.length > 128) {
            this._activity.details = this._activity.details.substring(0, 125) + '...'
        }

        // Check if its pausing (false) or playing (true)
        if (!attributes.status) {
            if (DiscordRichPresence._store.general.discord_rpc_clear_on_pause) {
                this._client.clearActivity()
                .catch((e: any) => console.error(`[DiscordRichPresence][clearActivity] ${e}`));
            } else {
                this._activity.smallImageKey = 'pause';
                this._activity.smallImageText = 'Paused';
                delete this._activity.endTimestamp;
                delete this._activity.startTimestamp;
                this._client.setActivity(this._activity)
                .catch((e: any) => console.error(`[DiscordRichPresence][setActivity] ${e}`));
            }

        } else if (this._activity && this._activityCache !== this._activity && this._activity.details) {
            if (!DiscordRichPresence._store.general.discord_rpc_clear_on_pause) {
                this._activity.smallImageKey = 'play';
                this._activity.smallImageText = 'Playing';
            }

            this._client.setActivity(this._activity)
            .catch((e: any) => console.error(`[DiscordRichPresence][updateActivity] ${e}`));
            this._activityCache = this._activity;
        }

    }

    /*******************************************************************************************
     * Public Methods
     * ****************************************************************************************/

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(_app: any, store: any) {
        DiscordRichPresence._store = store
        console.debug(`[Plugin][${this.name}] Loading Complete.`);
    }

    /**
     * Runs on app ready
     */
    onReady(_win: any): void {
        this.connect((DiscordRichPresence._store.general.discord_rpc == 1) ? '911790844204437504' : '886578863147192350');
        console.debug(`[Plugin][${this.name}] Ready.`);
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        console.debug(`[Plugin][${this.name}] Stopped.`);
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.state = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {
        this.updateActivity(attributes)
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {
        this.updateActivity(attributes)
    }
}
