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
            },
            settings: {
                currentTabIndex: 0,
                fullscreen: false
            }
        },
        artwork: {
            playerLCD: ""
        }
    },
    mutations: {
        resetRecentlyAdded(state) {
            state.pageState.recentlyAdded.loaded = false;
            state.pageState.recentlyAdded.nextUrl = null;
            state.pageState.recentlyAdded.items = [];
        },
        setLCDArtwork(state, artwork) {
            state.artwork.playerLCD = artwork
        }
    }
})

export {store}