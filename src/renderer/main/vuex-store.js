const store = new Vuex.Store({
    state: {
        library: {
            // songs: ipcRenderer.sendSync("get-library-songs"),
            // albums: ipcRenderer.sendSync("get-library-albums"),
            // recentlyAdded: ipcRenderer.sendSync("get-library-recentlyAdded"),
            // playlists: ipcRenderer.sendSync("get-library-playlists")
        },
        pageState: {
            recentlyAdded: {
                loaded: false,
                nextUrl: null,
                items: [],
                size: "normal"
            }
        },
        artwork: {
            playerLCD: ""
        }
    },
    mutations: {
        setLCDArtwork(state, artwork) {
            state.artwork.playerLCD = artwork
        }
    }
})

export {store}