import * as Store from 'electron-store';
import * as electron from "electron";

export class ConfigStore {
    private _store: Store;

    private defaults: any = {
        "general": {
            "close_behavior": 0, // 0 = close, 1 = minimize, 2 = minimize to tray
            "startup_behavior": 0, // 0 = nothing, 1 = open on startup
            "discord_rpc": 1, // 0 = disabled, 1 = enabled as Cider, 2 = enabled as Apple Music
            "discordClearActivityOnPause": 1, // 0 = disabled, 1 = enabled
            "language" : "en_US"
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
            "quality": "256",
            "seamless_audio": true,
            "normalization": false,
            "spatial": false,
            "maxVolume": 1,
            "volumePrecision": 0.1,
            "volumeRoundMax": 0.9,
            "volumeRoundMin": 0.1,
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
            }, 
            "equalizer": {
                'preset': "default",
                'frequencies': [32, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000],
                'gain': [0,0,0,0,0,0,0,0,0,0],
                'Q' :   [1,1,1,1,1,1,1,1,1,1],
                'preamp' : 0,
                'mix' : 1,
                'presets': [],
                'userGenerated': false
            }
        },
        "visual": {
            "theme": "",
            "scrollbars": 0, // 0 = show on hover, 2 = always hide, 3 = always show
            "refresh_rate": 0,
            "window_background_style": "artwork", // "none", "artwork", "color"
            "animated_artwork": "limited", // 0 = always, 1 = limited, 2 = never
            "animated_artwork_qualityLevel": 1,
            "bg_artwork_rotation": false,
            "hw_acceleration": "default", // default, webgpu, disabled
            "showuserinfo": true,
            "miniplayer_top_toggle": true
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
            "filterLoop": true,
            "NowPlaying": "true"
        },
        "advanced": {
            "AudioContext": false,
            "experiments": []
        }
    }
    private migrations: any = {}

    constructor() {
        this._store = new Store({
            name: 'cider-config',
            defaults: this.defaults,
            migrations: this.migrations,
        });

        this._store.set(this.mergeStore(this.defaults, this._store.store))
        this.ipcHandler(this._store);
    }

    get store() {
        return this._store.store;
    }

    get(key: string) {
        return this._store.get(key);
    }

    set(key: string, value: any) {
        this._store.set(key, value);
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
            if(source[key] instanceof Array) {
                continue
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