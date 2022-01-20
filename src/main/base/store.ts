import * as Store from 'electron-store';
import * as electron from "electron";

export class ConfigStore {
    public store: Store | undefined;

    private defaults: any = {
        "general": {
            "close_behavior": 0, // 0 = close, 1 = minimize, 2 = minimize to tray
            "startup_behavior": 0, // 0 = nothing, 1 = open on startup
            "discord_rpc": 1, // 0 = disabled, 1 = enabled as Cider, 2 = enabled as Apple Music
            "discordClearActivityOnPause": 1 // 0 = disabled, 1 = enabled
        },
        "home": {
            "followedArtists": [],
            "favoriteItems": []
        },
        "libraryPrefs": {
            "songs": {
                "sort": "name",
                "sortOrder": "asc",
                "size": "normal"
            }
        },
        "audio": {
            "volume": 1,
            "lastVolume": 1,
            "muted": false,
            "quality": "990",
            "seamless_audio": true,
            "normalization": false,
            "spatial": false,
            "spatial_properties": {
                "presets": [],
                "gain": 0.8,
                "listener_position": [0, 0, 0],
                "audio_position": [0, 0, 0],
                "room_dimensions": {
                    "width": 32,
                    "height": 12,
                    "depth": 32
                },
                "room_materials": {
                    "left": 'metal',
                    "right": 'metal',
                    "front": 'brick-bare',
                    "back": 'brick-bare',
                    "down": 'acoustic-ceiling-tiles',
                    "up": 'acoustic-ceiling-tiles',
                }
            }
        },
        "visual": {
            "theme": "",
            "scrollbars": 0, // 0 = show on hover, 2 = always hide, 3 = always show
            "refresh_rate": 0,
            "animated_artwork": "limited", // 0 = always, 1 = limited, 2 = never
            "animated_artwork_qualityLevel": 1,
            "bg_artwork_rotation": false,
            "hw_acceleration": "default", // default, webgpu, disabled
            "showuserinfo": true
        },
        "lyrics": {
            "enable_mxm": false,
            "mxm_karaoke": false,
            "mxm_language": "en",
            "enable_yt": false,
        },
        "lastfm": {
            "enabled": false,
            "scrobble_after": 30,
            "auth_token": "",
            "enabledRemoveFeaturingArtists": true,
            "NowPlaying": "true"
        },
        "advanced": {
            "AudioContext": false,
            "experiments": []
        }
    }
    private migrations: any = {}

    constructor() {
        this.store = new Store({
            name: 'cider-config',
            defaults: this.defaults,
            migrations: this.migrations,
        });

        this.store.set(this.mergeStore(this.defaults, this.store.store))
        this.ipcHandler(this.store);
    }

    /**
     * Merge Configurations
     * @param target The target configuration
     * @param source The source configuration
     */
    private mergeStore = (target: { [x: string]: any; }, source: { [x: string]: any; }) => {
        // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
        for (const key of Object.keys(source)) {
            if (key.includes('migrations')) {
                continue;
            }
            if (source[key] instanceof Object) Object.assign(source[key], this.mergeStore(target[key], source[key]))
        }
        // Join `target` and modified `source`
        Object.assign(target || {}, source)
        return target
    }

    /**
     * IPC Handler
     */
    private ipcHandler(cfg: Store | any): void {
        electron.ipcMain.handle('getStoreValue', (event, key, defaultValue) => {
            return (defaultValue ? cfg.get(key, true) : cfg.get(key));
        });

        electron.ipcMain.handle('setStoreValue', (event, key, value) => {
            cfg.set(key, value);
        });

        electron.ipcMain.on('getStore', (event) => {
            event.returnValue = cfg.store
        })

        electron.ipcMain.on('setStore', (event, store) => {
            cfg.store = store
        })
    }

}