import * as ElectronStore from 'electron-store';
import * as electron from "electron";

export class Store {
    static cfg: ElectronStore;

    private defaults: any = {
        "general": {
            "close_button_hide": true,
            "open_on_startup": false,
            "discord_rpc": 1, // 0 = disabled, 1 = enabled as Cider, 2 = enabled as Apple Music
            "discord_rpc_clear_on_pause": true,
            "language": "en_US", // electron.app.getLocale().replace('-', '_') this can be used in future
            "playbackNotifications": true
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
                'vibrantBass' : 0,
                'presets': [],
                'userGenerated': false
            },
            "vibrantBass": { // Hard coded into the app. Don't include any of this config into exporting presets in store.ts
                'multiplier': 0,
                'frequencies': [17.182, 42.169, 53.763, 112.69, 119.65, 264.59, 336.57, 400.65, 505.48, 612.7, 838.7, 1155.3, 1175.6, 3406.8, 5158.6, 5968.1, 6999.9, 7468.6, 8862.9, 9666, 10109],
                'Q': [2.5, 0.388, 5, 5, 2.5, 7.071, 14.14, 10, 7.071, 14.14, 8.409, 0.372, 7.071, 10, 16.82, 7.071, 28.28, 20, 8.409, 40, 40],
                'gain': [-0.34, 2.49, 0.23, -0.49, 0.23, -0.12, 0.32, -0.29, 0.33, 0.19, -0.18, -1.27, -0.11, 0.25, -0.18, -0.53, 0.34, 1.32, 1.78, 0.41, -0.28]
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
        Store.cfg = new ElectronStore({
            name: 'cider-config',
            defaults: this.defaults,
            migrations: this.migrations,
        });

        Store.cfg.set(this.mergeStore(this.defaults, Store.cfg.store))
        this.ipcHandler();
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
            if (source[key] instanceof Array) {
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
    private ipcHandler(): void {
        electron.ipcMain.handle('getStoreValue', (event, key, defaultValue) => {
            return (defaultValue ? Store.cfg.get(key, true) : Store.cfg.get(key));
        });

        electron.ipcMain.handle('setStoreValue', (event, key, value) => {
            Store.cfg.set(key, value);
        });

        electron.ipcMain.on('getStore', (event) => {
            event.returnValue = Store.cfg.store
        })

        electron.ipcMain.on('setStore', (event, store) => {
            Store.cfg.store = store
        })
    }

}
