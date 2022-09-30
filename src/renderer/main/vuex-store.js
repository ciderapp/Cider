const store = new Vuex.Store({
  state: {
    windowRelativeScale: 1,
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
        size: "normal",
      },
      settings: {
        currentTabIndex: 0,
        fullscreen: false,
      },
      scrollPos: {
        limit: 10,
        pos: [],
      },
    },
    artwork: {
      playerLCD: "",
    },
  },
  mutations: {
    resetRecentlyAdded(state) {
      state.pageState.recentlyAdded.loaded = false;
      state.pageState.recentlyAdded.nextUrl = null;
      state.pageState.recentlyAdded.items = [];
    },
    setLCDArtwork(state, artwork) {
      state.artwork.playerLCD = artwork;
    },
    setPagePos(state, pageState = {}) {
      let cached = state.pageState.scrollPos.pos.find((page) => {
        return page.href === pageState.href;
      });
      if (cached) {
        state.pageState.scrollPos.pos.find((page) => {
          if (page.href === pageState.href) {
            page.position = pageState.position;
          }
        });
        return;
      }
      state.pageState.scrollPos.pos.push({
        href: pageState.href,
        position: pageState.position,
      });
      if (state.pageState.scrollPos.pos.length > state.pageState.scrollPos.limit) {
        pages.value.shift();
      }
      return;
    },
  },
});

export { store };
