import { app } from "./vueapp.js"
import {CiderCache} from './cidercache.js'
import {CiderFrontAPI} from './ciderfrontapi.js'
import {simulateGamepad} from './gamepad.js'
import {CiderAudio} from '../audio/cideraudio.js'
import {Events} from './events.js'
import { wsapi } from "./wsapi_interop.js"
import { MusicKitTools } from "./musickittools.js"
import { spawnMica } from "./mica.js"


// Define window objects
window.app = app
window.MusicKitTools = MusicKitTools
window.CiderAudio = CiderAudio
window.CiderCache = CiderCache
window.CiderFrontAPI = CiderFrontAPI
window.wsapi = wsapi

// Mount Vue to #app
app.$mount("#app")

// Init CiderAudio
if (app.cfg.advanced.AudioContext){
    CiderAudio.init()
}

// Import gamepad support
app.simulateGamepad = simulateGamepad
app.spawnMica = spawnMica

Events.InitEvents()