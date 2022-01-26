import * as DiscordRPC from 'discord-rpc'

export default class DiscordRPCPlugin {
    /**
     * Private variables for interaction in plugins
     */
    private _win: Electron.BrowserWindow | undefined;
    private _app: any;
    private _store: any;
    private _discord: any;

    private connect(clientId: any) {
        this._discord = {isConnected: false};
        if (this._store.general.discord_rpc == 0 || this._discord.isConnected) return;

        DiscordRPC.register(clientId) // Apparently needed for ask to join, join, spectate etc.
        const client = new DiscordRPC.Client({transport: "ipc"});
        this._discord = Object.assign(client, {error: false, activityCache: null, isConnected: false});

        // Login to Discord
        this._discord.login({clientId})
            .then(() => {
                this._discord.isConnected = true;
            })
            .catch((e: any) => console.error(`[DiscordRPC][connect] ${e}`));

        this._discord.on('ready', () => {
            console.log(`[DiscordRPC][connect] Successfully Connected to Discord. Authed for user: ${client.user.username} (${client.user.id})`);
        })

        // Handles Errors
        this._discord.on('error', (err: any) => {
            console.error(`[DiscordRPC] ${err}`);
            this.disconnect()
            this._discord.isConnected = false;
        });
    }

    /**
     * Disconnects from Discord RPC
     */
    private disconnect() {
        if (this._store.general.discord_rpc == 0 || !this._discord.isConnected) return;

        try {
            this._discord.destroy().then(() => {
                this._discord.isConnected = false;
                console.log('[DiscordRPC][disconnect] Disconnected from discord.')
            }).catch((e: any) => console.error(`[DiscordRPC][disconnect] ${e}`));
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * Sets the activity of the client
     * @param {object} attributes
     */
    private updateActivity(attributes: any) {
        if (this._store.general.discord_rpc == 0) return;

        if (!this._discord.isConnected) {
            this._discord.clearActivity().catch((e: any) => console.error(`[DiscordRPC][updateActivity] ${e}`));
            return;
        }

        // console.log('[DiscordRPC][updateActivity] Updating Discord Activity.')

        const listenURL = `https://cider.sh/p?s&id=${attributes.playParams.id}` // cider://play/s/[id] (for song) 
        //console.log(attributes)

        interface ActObject extends DiscordRPC.Presence {
            details?: any,
            state?: any,
            startTimestamp?: any,
            endTimestamp?: any,
            largeImageKey?: any,
            largeImageText?: any,
            smallImageKey?: any,
            smallImageText?: any,
            instance: true,
            buttons?: [
                {
                    label: string,
                    url: string
                }
            ]
        }

        let ActivityObject: ActObject | null = {
            details: attributes.name,
            state: `by ${attributes.artistName}`,
            startTimestamp: attributes.startTime,
            endTimestamp: attributes.endTime,
            largeImageKey: (attributes.artwork.url.replace('{w}', '1024').replace('{h}', '1024')) ?? 'cider',
            largeImageText: attributes.albumName,
            smallImageKey: (attributes.status ? 'play' : 'pause'),
            smallImageText: (attributes.status ? 'Playing' : 'Paused'),
            instance: true,
            buttons: [
                {label: "Listen on Cider", url: listenURL},
            ]
        };
        if (ActivityObject.largeImageKey == "" || ActivityObject.largeImageKey == null) {
            ActivityObject.largeImageKey = (this._store.general.discord_rpc == 1) ? "cider" : "logo"
        }

        // Remove the pause/play icon and test for clear activity on pause
        if (this._store.general.discordClearActivityOnPause == 1) {
            delete ActivityObject.smallImageKey
            delete ActivityObject.smallImageText
        }

        // Deletes the timestamp if its not greater than 0
        if (!((new Date(attributes.endTime)).getTime() > 0)) {
            delete ActivityObject.startTimestamp
            delete ActivityObject.endTimestamp
        }

        // Artist check
        if (!attributes.artistName) {
            delete ActivityObject.state
        }

        // Album text check
        if (!ActivityObject.largeImageText || ActivityObject.largeImageText.length < 2) {
            delete ActivityObject.largeImageText
        }

        // Checks if the name is greater than 128 because some songs can be that long
        if (ActivityObject.details.length > 128) {
            ActivityObject.details = ActivityObject.details.substring(0, 125) + '...'
        }


        // Check if its pausing (false) or playing (true)
        if (!attributes.status) {
            if (this._store.general.discordClearActivityOnPause == 1) {
                this._discord.clearActivity().catch((e: any) => console.error(`[DiscordRPC][clearActivity] ${e}`));
                ActivityObject = null
            } else {
                delete ActivityObject.startTimestamp
                delete ActivityObject.endTimestamp
                ActivityObject.smallImageKey = 'pause'
                ActivityObject.smallImageText = 'Paused'
            }
        }


        if (ActivityObject && ActivityObject !== this._discord.activityCache && ActivityObject.details && ActivityObject.state) {
            try {
                //  console.log(`[DiscordRPC][setActivity] Setting activity to ${JSON.stringify(ActivityObject)}`);
                this._discord.setActivity(ActivityObject)
                this._discord.activityCache = ActivityObject
            } catch (err) {
                console.error(`[DiscordRPC][setActivity] ${err}`)
            }

        }
    }


    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'DiscordRPCPlugin';
    public description: string = 'Discord RPC plugin for Cider';
    public version: string = '0.0.1';
    public author: string = 'vapormusic / Cider Collective';

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(app: any, store: any) {
        this._app = app;
        this._store = store
    }

    /**
     * Runs on app ready
     */
    onReady(win: any): void {
        this._win = win;
        this.connect((this._store.general.discord_rpc == 1) ? '911790844204437504' : '886578863147192350');
        // electron.ipcMain.on("forceUpdateRPC", (event, attributes : object) => {          
        //     this.updateActivity(attributes)
        // });
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        console.log('Example plugin stopped');
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
