const Store = require("electron-store"),
    {app} = require("electron");

module.exports = {

    defaults: {
        "general": {
            "close_behavior": 0, // 0 = close, 1 = minimize, 2 = minimize to tray
            "startup_behavior": 0, // 0 = nothing, 1 = open on startup
            "discord_rpc": 1, // 0 = disabled, 1 = enabled as Cider, 2 = enabled as Apple Music
            "discordClearActivityOnPause" : 0, // 0 = disabled, 1 = enabled
            "volume": 1
        },
        "audio": {
            "quality": "extreme",
            "seamless_audio": true
        },
        "visual": {
            "theme": "",
            "scrollbars": 0, // 0 = show on hover, 2 = always hide, 3 = always show
            "refresh_rate": 0,
            "animated_artwork": "always", // 0 = always, 1 = limited, 2 = never
            "animated_artwork_qualityLevel": 1,
            "hw_acceleration": "default", // default, webgpu, disabled
            "window_transparency": "default"
        },
        "lyrics": {
            "enable_mxm": false,
            "mxm_karaoke" : false,
            "mxm_language": "en",
            "enable_yt": false,
        },
        "lastfm": {
            "enabled": false,
            "scrobble_after": 30,
            "auth_token": "",
            "enabledRemoveFeaturingArtists" : true,
            "NowPlaying": "true"
        }
    },

    init() {
        app.cfg = new Store({
            defaults: this.defaults,
        });
    }

}