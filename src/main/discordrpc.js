const { app } = require('electron'),
    DiscordRPC = require('discord-rpc');

module.exports = {
    /**
     * Connects to Discord RPC
     * @param {string} clientId
     */
    connect: function (clientId) {
        app.discord = { isConnected: false };
        if (app.cfg.get('general.discord_rpc') == 0 || app.discord.isConnected)
            return;

        DiscordRPC.register(clientId); // Apparently needed for ask to join, join, spectate etc.
        const client = new DiscordRPC.Client({ transport: 'ipc' });
        app.discord = Object.assign(client, {
            error: false,
            activityCache: null,
            isConnected: false
        });

        // Login to Discord
        app.discord
            .login({ clientId })
            .then(() => {
                app.discord.isConnected = true;
            })
            .catch((e) => console.error(`[DiscordRPC][connect] ${e}`));

        app.discord.on('ready', () => {
            console.log(
                `[DiscordRPC][connect] Successfully Connected to Discord. Authed for user: ${client.user.username} (${client.user.id})`
            );
        });

        // Handles Errors
        app.discord.on('error', (err) => {
            console.error(`[DiscordRPC] ${err}`);
            this.disconnect();
            app.discord.isConnected = false;
        });
    },

    /**
     * Disconnects from Discord RPC
     */
    disconnect: function () {
        if (app.cfg.get('general.discord_rpc') == 0 || !app.discord.isConnected)
            return;

        try {
            app.discord
                .destroy()
                .then(() => {
                    app.discord.isConnected = false;
                    console.log(
                        '[DiscordRPC][disconnect] Disconnected from discord.'
                    );
                })
                .catch((e) => console.error(`[DiscordRPC][disconnect] ${e}`));
        } catch (err) {
            console.error(err);
        }
    },

    /**
     * Sets the activity of the client
     * @param {object} attributes
     */
    updateActivity: function (attributes) {
        if (app.cfg.get('general.discord_rpc') == 0) return;

        if (!app.discord.isConnected) {
            app.discord
                .clearActivity()
                .catch((e) =>
                    console.error(`[DiscordRPC][updateActivity] ${e}`)
                );
            return;
        }

        // console.log('[DiscordRPC][updateActivity] Updating Discord Activity.')

        const listenURL = `https://applemusicelectron.com/p?id=${attributes.playParams.id}`;
        //console.log(attributes)
        let ActivityObject = {
            details: attributes.name,
            state: `by ${attributes.artistName}`,
            startTimestamp: attributes.startTime,
            endTimestamp: attributes.endTime,
            largeImageKey:
                attributes.artwork.url
                    .replace('{w}', '1024')
                    .replace('{h}', '1024') ?? 'cider',
            largeImageText: attributes.albumName,
            smallImageKey: attributes.status ? 'play' : 'pause',
            smallImageText: attributes.status ? 'Playing' : 'Paused',
            instance: true,
            buttons: [{ label: 'Listen on Cider', url: listenURL }]
        };
        if (
            ActivityObject.largeImageKey == '' ||
            ActivityObject.largeImageKey == null
        ) {
            ActivityObject.largeImageKey =
                app.cfg.get('general.discord_rpc') == 1 ? 'cider' : 'logo';
        }

        // Remove the pause/play icon and test for clear activity on pause
        if (app.cfg.get('general.discordClearActivityOnPause') == 1) {
            delete ActivityObject.smallImageKey;
            delete ActivityObject.smallImageText;
        }

        // Deletes the timestamp if its not greater than 0
        if (!(new Date(attributes.endTime).getTime() > 0)) {
            delete ActivityObject.startTimestamp;
            delete ActivityObject.endTimestamp;
        }

        // Artist check
        if (!attributes.artistName) {
            delete ActivityObject.state;
        }

        // Album text check
        if (
            !ActivityObject.largeImageText ||
            ActivityObject.largeImageText.length < 2
        ) {
            delete ActivityObject.largeImageText;
        }

        // Checks if the name is greater than 128 because some songs can be that long
        if (ActivityObject.details.length > 128) {
            ActivityObject.details =
                ActivityObject.details.substring(0, 125) + '...';
        }

        // Check if its pausing (false) or playing (true)
        if (!attributes.status) {
            if (app.cfg.get('general.discordClearActivityOnPause') == 1) {
                app.discord
                    .clearActivity()
                    .catch((e) =>
                        console.error(`[DiscordRPC][clearActivity] ${e}`)
                    );
                ActivityObject = null;
            } else {
                delete ActivityObject.startTimestamp;
                delete ActivityObject.endTimestamp;
                ActivityObject.smallImageKey = 'pause';
                ActivityObject.smallImageText = 'Paused';
            }
        }

        if (
            ActivityObject &&
            ActivityObject !== app.discord.activityCache &&
            ActivityObject.details &&
            ActivityObject.state
        ) {
            try {
                //  console.log(`[DiscordRPC][setActivity] Setting activity to ${JSON.stringify(ActivityObject)}`);
                app.discord.setActivity(ActivityObject);
                app.discord.activityCache = ActivityObject;
            } catch (err) {
                console.error(`[DiscordRPC][setActivity] ${err}`);
            }
        }
    }
};
