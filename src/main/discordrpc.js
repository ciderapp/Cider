const {app} = require('electron'),
    DiscordRPC = require('discord-rpc')

module.exports = {
    connect: function (clientId) {
        app.discord = {isConnected: false};
        if (!app.cfg.get('general.discord_rpc')) return;

        DiscordRPC.register(clientId) // Apparently needed for ask to join, join, spectate etc.
        const client = new DiscordRPC.Client({ transport: "ipc" });
        app.discord = Object.assign(client,{error: false, activityCache: null, isConnected: false});

        // Login to Discord
        app.discord.login({ clientId })
            .then(() => {
                app.discord.isConnected = true;
            })
            .catch((e) => console.error(`[DiscordRPC][connect] ${e}`));

        app.discord.on('ready', () => {
            console.log(`[DiscordRPC][connect] Successfully Connected to Discord. Authed for user: ${client.user.username} (${client.user.id})`);

            if (app.discord.activityCache) {
                client.setActivity(app.discord.activityCache).catch((e) => console.error(e));
                app.discord.activityCache = null;
            }
        })

        // Handles Errors
        app.discord.on('error', err => {
            console.error(`[DiscordRPC] ${err}`);
            this.disconnect()
            app.discord.isConnected = false;
        });
    },

    disconnect: function () {
        if (!app.cfg.get('general.discord_rpc') || !app.discord.isConnected) return;

        try {
            app.discord.destroy().then(() => {
                app.discord.isConnected = false;
                console.log('[DiscordRPC][disconnect] Disconnected from discord.')
            }).catch((e) => console.error(`[DiscordRPC][disconnect] ${e}`));
        } catch (err) {
            console.error(err)
        }
    },

    updateActivity: function (attributes) {
        if (!app.cfg.get('general.discord_rpc')) return;

        if (!app.discord.isConnected) {
            this.connect()
        }

        if (!app.discord.isConnected) return;

        // console.log('[DiscordRPC][updateActivity] Updating Discord Activity.')

        const listenURL = `https://applemusicelectron.com/p?id=${attributes.playParams.id}`
        //console.log(attributes)
        let ActivityObject = {
            details: attributes.name,
            state: `by ${attributes.artistName}`,
            startTimestamp: attributes.startTime,
            endTimestamp: attributes.endTime,
            largeImageKey: (attributes.artwork.url.replace('{w}', '512').replace('{h}', '512') ) ?? 'cider',
            largeImageText: attributes.albumName,
            smallImageKey: (attributes.status ? 'play' : 'pause'),
            smallImageText: (attributes.status ? 'Playing': 'Paused'),
            instance: true,
            buttons: [
                {label: "Listen on Cider", url: listenURL},
            ]
        };
        if (ActivityObject.largeImageKey == "" || ActivityObject.largeImageKey == null) {ActivityObject.largeImageKey = "cider"}
        //console.log(`[LinkHandler] Listening URL has been set to: ${listenURL}`);

        // if (app.cfg.get('general.discordClearActivityOnPause')) {
        //     delete ActivityObject.smallImageKey
        //     delete ActivityObject.smallImageText
        // }

        // Check all the values work
        if (!((new Date(attributes.endTime)).getTime() > 0)) {
            delete ActivityObject.startTimestamp
            delete ActivityObject.endTimestamp
        }
        if (!attributes.artistName) {
            delete ActivityObject.state
        }
        if (!ActivityObject.largeImageText || ActivityObject.largeImageText.length < 2) {
            delete ActivityObject.largeImageText
        }
        if (ActivityObject.details.length > 128) {
            AcitivityObject.details = ActivityObject.details.substring(0, 125) + '...'
        }

        // Clear if if needed
        if (!attributes.status) {
            //if (app.cfg.get('general.discordClearActivityOnPause')) {
            //     app.discord.clearActivity().catch((e) => console.error(`[DiscordRPC][clearActivity] ${e}`));
            //     ActivityObject = null
            // } else
            //  {
                delete ActivityObject.startTimestamp
                delete ActivityObject.endTimestamp
                ActivityObject.smallImageKey = 'pause'
                ActivityObject.smallImageText = 'Paused'
            //}
        }

        if (ActivityObject) {
            try {
            //   console.log(`[DiscordRPC][setActivity] Setting activity to ${JSON.stringify(ActivityObject)}`);
                app.discord.setActivity(ActivityObject)
            } catch (err) {
                console.error(`[DiscordRPC][setActivity] ${err}`)
            }

        }
    },
}