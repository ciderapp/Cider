Vue.use(VueHorizontal);
Vue.use(VueObserveVisibility);
var notyf = new Notyf();

const MusicKitObjects = {
    LibraryPlaylist: function () {
        this.id = ""
        this.type = "library-playlist-folders"
        this.href = ""
        this.attributes = {
            dateAdded: "",
            name: ""
        }
        this.playlists = []
    }
}

const MusicKitTools = {
    getHeader() {
        return new Headers({
            Authorization: 'Bearer ' + MusicKit.getInstance().developerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Music-User-Token': '' + MusicKit.getInstance().musicUserToken
        });
    }
}

// limit an array to a certain number of items
Array.prototype.limit = function (n) {
    return this.slice(0, n);
};

const store = new Vuex.Store({
    state: {
        library: {
            songs: ipcRenderer.sendSync("get-library-songs"),
            albums: ipcRenderer.sendSync("get-library-albums"),
            recentlyAdded: ipcRenderer.sendSync("get-library-recentlyAdded"),
            playlists: ipcRenderer.sendSync("get-library-playlists")
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

const app = new Vue({
    el: "#app",
    store: store,
    data: {
        version: ipcRenderer.sendSync("get-version"),
        appMode: "player",
        ipcRenderer: ipcRenderer,
        cfg: ipcRenderer.sendSync("getStore"),
        isDev: ipcRenderer.sendSync("is-dev"),
        drawertest: false,
        platform: "",
        mk: {},
        quickPlayQuery: "",
        lz: ipcRenderer.sendSync("get-i18n", "en_US"),
        lzListing: ipcRenderer.sendSync("get-i18n-listing"),
        search: {
            term: "",
            hints: [],
            showHints: false,
            results: {},
            resultsSocial: {},
            limit: 10
        },
        fullscreenLyrics: false,
        playerLCD: {
            playbackDuration: 0,
            desiredDuration: 0,
            userInteraction: false
        },
        drawer: {
            open: false,
            panel: ""
        },
        browsepage: [],
        listennow: [],
        madeforyou: [],
        radio: {
            personal: []
        },
        mklang : 'en',
        webview: {
            url: "",
            title: "",
            loading: false
        },
        showingPlaylist: [],
        appleCurator: [],
        artistPage: {
            data: {},
        },
        library: {
            backgroundNotification: {
                show: false,
                message: "",
                total: 0,
                progress: 0
            },
            songs: {
                sortingOptions: {
                    "albumName": "0",
                    "artistName": "0",
                    "name": "0",
                    "genre": "0",
                    "releaseDate": "0",
                    "durationInMillis": "0",
                    "dateAdded": "0"
                },
                sorting: "name",
                sortOrder: "asc",
                listing: [],
                meta: {total: 0, progress: 0},
                search: "",
                displayListing: [],
                downloadState: 0 // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
            },
            albums: {
                sortingOptions: {
                    "albumName": "0",
                    "artistName": "0",
                    "name": "0",
                    "genre": "0"
                },
                viewAs: 'covers',
                sorting: ["dateAdded", "name"], // [0] = recentlyadded page, [1] = albums page
                sortOrder: ["desc", "asc"], // [0] = recentlyadded page, [1] = albums page
                listing: [],
                meta: {total: 0, progress: 0},
                search: "",
                displayListing: [],
                downloadState: 0 // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
            },
            artists: {
                sortingOptions: {
                    "artistName": "0",
                    "name": "0",
                    "genre": "0",
                    "releaseDate": "0"
                },
                viewAs: 'covers',
                sorting: ["dateAdded", "name"], // [0] = recentlyadded page, [1] = albums page
                sortOrder: ["desc", "asc"], // [0] = recentlyadded page, [1] = albums page
                listing: [],
                meta: {total: 0, progress: 0},
                search: "",
                displayListing: [],
                downloadState: 0 // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
            },
        },
        playlists: {
            listing: [],
            details: {},
            loadingState: 0, // 0 loading, 1 loaded, 2 error
            id: ""
        },
        webremoteurl: "",
        webremoteqr: "",
        mxmtoken: "",
        mkIsReady: false,
        playerReady: false,
        animateBackground: false,
        currentArtUrl: '',
        lyricon: false,
        currentTrackID: '',
        currentTrackIDBG: '',
        lyrics: [],
        currentLyricsLine: 0,
        lyriccurrenttime: 0,
        richlyrics: [],
        lyricsMediaItem: {},
        lyricsDebug: {
            current: 0,
            start: 0,
            end: 0
        },
        v3: {
            requestBody: {
                platform: "web"
            }
        },
        tmpHeight: '',
        tmpWidth: '',
        tmpVar: [],
        notification: false,
        chrome: {
            hideUserInfo: ipcRenderer.sendSync("is-dev") || false,
            artworkReady: false,
            userinfo: {
                "id": "",
                "attributes": {
                    "name": "Cider User",
                    "handle": "CiderUser",
                    "artwork": {"url": "./assets/logocut.png"}
                }
            },
            menuOpened: false,
            maximized: false,
            drawerOpened: false,
            drawerState: "queue",
            topChromeVisible: true,
            progresshover: false,
            windowControlPosition: "right",
            contentAreaScrolling: true
        },
        collectionList: {
            response: {},
            title: "",
            type: ""
        },
        prevButtonBackIndicator: false,
        currentSongInfo: {},
        page: "",
        pageHistory: [],
        songstest: false,
        hangtimer: null,
        selectedMediaItems: [],
        routes: ["browse", "listen_now", "radio"],
        musicBaseUrl: "https://api.music.apple.com/",
        modals: {
            addToPlaylist: false,
            spatialProperties: false,
            qrcode: false,
            equalizer: false,
            audioSettings: false,
            showPlaylist: false,
        },
        socialBadges: {
            badgeMap: {},
            version: "",
            mediaItems: [],
            mediaItemDLState: 0 // 0 = not started, 1 = in progress, 2 = complete
        },
        menuPanel: {
            visible: false,
            event: null,
            content: {
                name: "",
                items: {},
                headerItems: {}
            }
        }
    },
    watch: {
        cfg: {
            handler: function (val, oldVal) {
                console.log(`cfg changed from ${oldVal} to ${val}`);
                ipcRenderer.send("setStore", val);
            },
            deep: true
        },
        page: () => {
            document.getElementById("app-content").scrollTo(0, 0);
            app.resetState()
        },
        showingPlaylist: () => {
            if (!app.modals.showPlaylist) {
                document.getElementById("app-content").scrollTo(0, 0);
                app.resetState()
            }
        },
        artistPage: () => {
            document.getElementById("app-content").scrollTo(0, 0);
            app.resetState()
        },
    },
    methods: {
        songLinkShare(amUrl) {
            notyf.open({type: "info", message: app.getLz('term.song.link.generate')})
            let self = this
            httpRequest = new XMLHttpRequest();
            httpRequest.open('GET', `https://api.song.link/v1-alpha.1/links?url=${amUrl}&userCountry=US`, true);
            httpRequest.send();
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        let response = JSON.parse(httpRequest.responseText);
                        console.log(response);
                        self.copyToClipboard(response.pageUrl)
                    } else {
                        console.log('There was a problem with the request.');
                        notyf.error(app.getLz('term.requestError'))
                    }
                }
            }
        },
        mainMenuVisibility(val) {
            if (val) {
                (this.mk.isAuthorized) ? this.chrome.menuOpened = !this.chrome.menuOpened : false;
                if (!this.mk.isAuthorized){
                    this.mk.authorize()
                }
            } else {
                setTimeout(() => {
                    this.chrome.menuOpened = false
                }, 100)
            }
        },
        stringTemplateParser(expression, valueObj) {
            const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
            let text = expression.replace(templateMatcher, (substring, value, index) => {
                value = valueObj[value];
                return value;
            });
            return text
            // stringTemplateParser('my name is {{name}} and age is {{age}}', {name: 'Tom', age:100})
        },
        async setLz(lang) {
            if (lang == "") {
                lang = this.cfg.general.language
            }
            this.lz = ipcRenderer.sendSync("get-i18n", lang)
            this.mklang = await this.MKJSLang()
        },
        getLz(message) {
            if (this.lz[message]) {
                return this.lz[message]
            } else {
                return message
            }
        },
        setLzManual() {
            app.$data.library.songs.sortingOptions = {
                "albumName": app.getLz('term.sortBy.album'),
                "artistName": app.getLz('term.sortBy.artist'),
                "name": app.getLz('term.sortBy.name'),
                "genre": app.getLz('term.sortBy.genre'),
                "releaseDate": app.getLz('term.sortBy.releaseDate'),
                "durationInMillis": app.getLz('term.sortBy.duration'),
                "dateAdded": app.getLz('term.sortBy.dateAdded')
            }

            app.$data.library.albums.sortingOptions = {
                "albumName": app.getLz('term.sortBy.album'),
                "artistName": app.getLz('term.sortBy.artist'),
                "name": app.getLz('term.sortBy.name'),
                "genre": app.getLz('term.sortBy.genre')
            }

            app.$data.library.artists.sortingOptions = {
                "artistName": app.getLz('term.sortBy.artist'),
                "name": app.getLz('term.sortBy.name'),
                "genre": app.getLz('term.sortBy.genre'),
                "releaseDate": app.getLz('term.sortBy.releaseDate')
            }
        },
        async showSocialListeningTo() {
            let contentIds = Object.keys(app.socialBadges.badgeMap)
            app.showCollection({data: this.socialBadges.mediaItems}, "Friends Listening To", "albums")
            if (this.socialBadges.mediaItemDLState == 1 || this.socialBadges.mediaItemDLState == 2) {
                return
            }
            this.socialBadges.mediaItemDLState = 2
            await asyncForEach(contentIds, async (item) => {
                try {
                    let type = "albums"
                    if (item.includes("pl.")) {
                        type = "playlists"
                    }
                    if (item.includes("ra.")) {
                        type = "stations"
                    }
                    let found = await app.mk.api.v3.music(`/v1/catalog/us/${type}/${item}`)
                    this.socialBadges.mediaItems.push(found.data.data[0])
                } catch (e) {

                }
            })
        },
        async openAppleMusicURL(url) {
            let properties = MusicKit.formattedMediaURL(url)
            let item = {
                id: properties.contentId,
                attributes: {
                    playParams: {
                        id: properties.contentId,
                        kind: properties.kind,
                    }
                },
                type: properties.kind,
                kind: properties.kind
            }
            app.routeView(item)
        },
        async showMenuPanel(data, event) {
            app.menuPanel.visible = true;
            app.menuPanel.content.name = data.name ?? "";
            app.menuPanel.content.items = data.items ?? {};
            app.menuPanel.content.headerItems = data.headerItems ?? {};
            if (event) {
                app.menuPanel.event = event;
            }
        },
        async getSvgIcon(url) {
            let response = await fetch(url);
            let data = await response.text();
            return data;
        },
        getSocialBadges(cb = () => {
        }) {
            let self = this
            try {
                app.mk.api.v3.music("/v1/social/badging-map").then(data => {
                    self.socialBadges.badgeMap = data.data.results.badgingMap
                    cb(data.data.results.badgingMap)
                })
            } catch (ex) {
                this.socialBadges.badgeMap = {}
            }
        },
        addFavorite(id, type) {
            this.cfg.home.favoriteItems.push({
                id: id,
                type: type
            });
        },
        modularUITest(val = false) {
            this.fullscreenLyrics = val;
            if (val) {
                document.querySelector("#app-main").classList.add("modular-fs")
            } else {
                document.querySelector("#app-main").classList.remove("modular-fs")
            }
        },
        navigateBack() {
            history.back()
        },
        navigateForward() {
            history.forward()
        },
        getHTMLStyle() {
            document.querySelector("html").style.background = "#222";
            document.querySelector("body").classList.add("notransparency")
        },
        resetState() {
            this.menuPanel.visible = false;
            app.selectedMediaItems = [];
            this.chrome.contentAreaScrolling = true
            for (let key in app.modals) {
                app.modals[key] = false;
            }
        },
        promptAddToPlaylist() {
            app.modals.addToPlaylist = true;
        },
        async addSelectedToNewPlaylist() {
            let self = this
            let pl_items = []
            for (let i = 0; i < self.selectedMediaItems.length; i++) {
                if (self.selectedMediaItems[i].kind == "song" || self.selectedMediaItems[i].kind == "songs") {
                    self.selectedMediaItems[i].kind = "songs"
                    pl_items.push({
                        id: self.selectedMediaItems[i].id,
                        type: self.selectedMediaItems[i].kind
                    })
                } else if ((self.selectedMediaItems[i].kind == "album" || self.selectedMediaItems[i].kind == "albums") && self.selectedMediaItems[i].isLibrary != true) {
                    self.selectedMediaItems[i].kind = "albums"
                    let res = await self.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/albums/${self.selectedMediaItems[i].id}/tracks`);
                    let ids = res.data.data.map(function (i) {
                        return {id: i.id, type: i.type}
                    })
                    pl_items = pl_items.concat(ids)
                } else if (self.selectedMediaItems[i].kind == "library-song" || self.selectedMediaItems[i].kind == "library-songs") {
                    self.selectedMediaItems[i].kind = "library-songs"
                    pl_items.push({
                        id: self.selectedMediaItems[i].id,
                        type: self.selectedMediaItems[i].kind
                    })
                } else if ((self.selectedMediaItems[i].kind == "library-album" || self.selectedMediaItems[i].kind == "library-albums") || (self.selectedMediaItems[i].kind == "album" && self.selectedMediaItems[i].isLibrary == true)) {
                    self.selectedMediaItems[i].kind = "library-albums"
                    let res = await self.mk.api.v3.music(`/v1/me/library/albums/${self.selectedMediaItems[i].id}/tracks`);
                    let ids = res.data.data.map(function (i) {
                        return {id: i.id, type: i.type}
                    })
                    pl_items = pl_items.concat(ids)
                } else {
                    pl_items.push({
                        id: self.selectedMediaItems[i].id,
                        type: self.selectedMediaItems[i].kind
                    })
                }
            }
            this.modals.addToPlaylist = false
            app.newPlaylist(app.getLz('term.newPlaylist'), pl_items)
        },
        async addSelectedToPlaylist(playlist_id) {
            let self = this
            let pl_items = []
            for (let i = 0; i < self.selectedMediaItems.length; i++) {
                if (self.selectedMediaItems[i].kind == "song" || self.selectedMediaItems[i].kind == "songs") {
                    self.selectedMediaItems[i].kind = "songs"
                    pl_items.push({
                        id: self.selectedMediaItems[i].id,
                        type: self.selectedMediaItems[i].kind
                    })
                } else if ((self.selectedMediaItems[i].kind == "album" || self.selectedMediaItems[i].kind == "albums") && self.selectedMediaItems[i].isLibrary != true) {
                    self.selectedMediaItems[i].kind = "albums"
                    let res = await self.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/albums/${self.selectedMediaItems[i].id}/tracks`);
                    let ids = res.data.data.map(function (i) {
                        return {id: i.id, type: i.type}
                    })
                    pl_items = pl_items.concat(ids)
                } else if (self.selectedMediaItems[i].kind == "library-song" || self.selectedMediaItems[i].kind == "library-songs") {
                    self.selectedMediaItems[i].kind = "library-songs"
                    pl_items.push({
                        id: self.selectedMediaItems[i].id,
                        type: self.selectedMediaItems[i].kind
                    })
                } else if ((self.selectedMediaItems[i].kind == "library-album" || self.selectedMediaItems[i].kind == "library-albums") || (self.selectedMediaItems[i].kind == "album" && self.selectedMediaItems[i].isLibrary == true)) {
                    self.selectedMediaItems[i].kind = "library-albums"
                    let res = await self.mk.api.v3.music(`/v1/me/library/albums/${self.selectedMediaItems[i].id}/tracks`);
                    let ids = res.data.data.map(function (i) {
                        return {id: i.id, type: i.type}
                    })
                    pl_items = pl_items.concat(ids)
                } else {
                    pl_items.push({
                        id: self.selectedMediaItems[i].id,
                        type: self.selectedMediaItems[i].kind
                    })
                }

            }
            this.modals.addToPlaylist = false
            await app.mk.api.v3.music(
                `/v1/me/library/playlists/${playlist_id}/tracks`, {}, {
                    fetchOptions: {
                        method: "POST",
                        body: JSON.stringify({
                            data: pl_items
                        })
                    }
                }
            ).then(() => {
                if (this.page == 'playlist_' + this.showingPlaylist.id) {
                    this.getPlaylistFromID(this.showingPlaylist.id)
                }
            })
        },
        async init() {
            let self = this
            if (this.cfg.visual.theme != "default.less" && this.cfg.visual.theme != "") {
                this.setTheme(this.cfg.visual.theme)
            }
            this.setLz(this.cfg.general.language)
            this.setLzManual()
            clearTimeout(this.hangtimer)
            this.mk = MusicKit.getInstance()
            let needsReload = (typeof localStorage["music.ampwebplay.media-user-token"] == "undefined")
            this.mk.authorize().then(() => {
                self.mkIsReady = true
                if (needsReload) {
                    document.location.reload()
                }
            })
            this.$forceUpdate()
            if (this.isDev) {
                this.mk.privateEnabled = true
                // Hide UserInfo if Dev mode
            } else {
                // Get Hide User from Settings
                this.chrome.hideUserInfo = !this.cfg.visual.showuserinfo
            }
            if (this.cfg.visual.hw_acceleration == "disabled") {
                document.body.classList.add("no-gpu")
            }
            this.mk._services.timing.mode = 0
            this.platform = ipcRenderer.sendSync('cider-platform');

            this.mklang = await this.MKJSLang()

            try {
                // Set profile name
                this.chrome.userinfo = (await app.mk.api.v3.music(`/v1/me/social-profile`)).data.data[0]
            } catch (err) {
            }

            // API Fallback
            if (!this.chrome.userinfo) {
                this.chrome.userinfo = {
                    "id": "",
                    "attributes": {
                        "name": "Cider User",
                        "handle": "CiderUser",
                        "artwork": {"url": "./assets/logocut.png"}
                    }
                }
            }
            MusicKitInterop.init()
            // Set the volume

            // Check the value of this.cfg.audio.muted
            if (!this.cfg.audio.muted) {
                // Set the mk.volume to the last stored volume data
                this.mk.volume = this.cfg.audio.volume
            } else if (this.cfg.audio.muted) {
                // Set mk.volume to -1 (setting to 0 wont work, so temp solution setting to -1)
                this.mk.volume = -1;
            }
            // ipcRenderer.invoke('getStoreValue', 'audio.volume').then((value) => {
            //     self.mk.volume = value
            // })

            // load cached library
            if (localStorage.getItem("librarySongs") != null) {
                this.library.songs.listing = JSON.parse(localStorage.getItem("librarySongs"))
                this.library.songs.displayListing = this.library.songs.listing
            }
            if (localStorage.getItem("libraryAlbums") != null) {
                this.library.albums.listing = JSON.parse(localStorage.getItem("libraryAlbums"))
                this.library.albums.displayListing = this.library.albums.listing
            }

            window.onbeforeunload = function (e) {
                window.localStorage.setItem("currentTrack", JSON.stringify(app.mk.nowPlayingItem))
                window.localStorage.setItem("currentTime", JSON.stringify(app.mk.currentPlaybackTime))
                window.localStorage.setItem("currentQueue", JSON.stringify(app.mk.queue.items))
            };

            if (typeof MusicKit.PlaybackBitrate[app.cfg.audio.quality] !== "string") {
                app.mk.bitrate = MusicKit.PlaybackBitrate[app.cfg.audio.quality]
            } else {
                app.mk.bitrate = 256
                app.cfg.audio.quality = "HIGH"
            }

            // load last played track
            try {
                let lastItem = window.localStorage.getItem("currentTrack")
                let time = window.localStorage.getItem("currentTime")
                let queue = window.localStorage.getItem("currentQueue")
                if (lastItem != null) {
                    lastItem = JSON.parse(lastItem)
                    let kind = lastItem.attributes.playParams.kind;
                    let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
                    app.mk.setQueue({
                        [truekind]: [lastItem.attributes.playParams.id],
                        parameters : {l : app.mklang}
                    })
                    app.mk.mute()
                    setTimeout(() => {
                        app.mk.play().then(() => {
                            app.mk.pause().then(() => {
                                if (time != null) {
                                    app.mk.seekToTime(time)
                                }
                                app.mk.unmute()
                                if (queue != null) {
                                    queue = JSON.parse(queue)
                                    if (queue && queue.length > 0) {
                                        let ids = queue.map(e => (e.playParams ? e.playParams.id : (e.attributes.playParams ? e.attributes.playParams.id : '')))
                                        let i = 0;
                                        if (ids.length > 0) {
                                            for (id of ids) {
                                                if (!(i == 0 && ids[0] == lastItem.attributes.playParams.id)) {
                                                    try {
                                                        app.mk.playLater({songs: [id]})
                                                    } catch (err) {
                                                    }
                                                }
                                                i++;
                                            }
                                        }
                                    }
                                }

                            })

                        })
                    }, 1500)

                }

            } catch (e) {
                console.log(e)
            }

            MusicKit.getInstance().videoContainerElement = document.getElementById("apple-music-video-player")

            ipcRenderer.on('SoundCheckTag', (event, tag) => {
                let replaygain = self.parseSCTagToRG(tag)
                try {
                    CiderAudio.audioNodes.gainNode.gain.value = (Math.min(Math.pow(10, (replaygain.gain / 20)), (1 / replaygain.peak)))
                } catch (e) {

                }
            })

            ipcRenderer.on('play', function(_event, mode, id) {
              if (mode !== 'url'){
                self.mk.setQueue({[mode]: id , parameters : {l : self.mklang}}).then(() => {
                    app.mk.play()
                })
                
              } else {
                    app.openAppleMusicURL(id)
                }
            });

            this.mk.addEventListener(MusicKit.Events.playbackStateDidChange, () => {
                ipcRenderer.send('wsapi-updatePlaybackState', wsapi.getAttributes());
            })

            this.mk.addEventListener(MusicKit.Events.playbackTimeDidChange, (a) => {
                self.lyriccurrenttime = self.mk.currentPlaybackTime
                this.currentSongInfo = a
                self.playerLCD.playbackDuration = (self.mk.currentPlaybackTime)
                // wsapi
                ipcRenderer.send('wsapi-updatePlaybackState', wsapi.getAttributes());
            })

            this.mk.addEventListener(MusicKit.Events.nowPlayingItemDidChange, (a) => {
                if (self.$refs.queue) {
                    self.$refs.queue.updateQueue();
                }
                this.currentSongInfo = a
                

                if (app.cfg.audio.normalization) {
                    // get unencrypted audio previews to get SoundCheck's normalization tag
                    try {
                        let previewURL = null
                        try {
                            previewURL = app.mk.nowPlayingItem.previewURL
                        } catch (e) {
                        }
                        if (!previewURL) {
                            app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/songs/${app.mk.nowPlayingItem?._songId ?? (app.mk.nowPlayingItem["songId"] ??  app.mk.nowPlayingItem.relationships.catalog.data[0].id)}`).then((response) => {
                                previewURL = response.data.data[0].attributes.previews[0].url
                                if (previewURL)
                                    ipcRenderer.send('getPreviewURL', previewURL)
                            })
                        } else {
                            if (previewURL)
                                ipcRenderer.send('getPreviewURL', previewURL)
                        }

                    } catch (e) {
                    }
                }
                

                try {
                    a = a.item.attributes;
                } catch (_) {
                }
                let type = (self.mk.nowPlayingItem != null) ? self.mk.nowPlayingItem["type"] ?? '' : '';

                if (type.includes("musicVideo") || type.includes("uploadedVideo") || type.includes("music-movie")) {
                    document.getElementById("apple-music-video-container").style.display = "block";
                    // app.chrome.topChromeVisible = false
                } else {
                    document.getElementById("apple-music-video-container").style.display = "none";
                    // app.chrome.topChromeVisible = true
                }
                self.chrome.artworkReady = false
                self.lyrics = []
                self.richlyrics = []
                app.getCurrentArtURL();
                // app.getNowPlayingArtwork(42); 
                app.getNowPlayingArtworkBG(32);
                app.loadLyrics();
                app.losslessBadge();

                // Playback Notifications
                if (this.cfg.general.playbackNotifications && !document.hasFocus() && a.artistName && a.artwork && a.name) {
                    if (this.notification) {
                        this.notification.close()
                    }
                    this.notification = new Notification(a.name, {
                        body: a.artistName,
                        icon: a.artwork.url.replace('/{w}x{h}bb', '/512x512bb').replace('/2000x2000bb', '/35x35bb'),
                        silent: true,
                    });
                }

            })


            this.mk.addEventListener(MusicKit.Events.playbackVolumeDidChange, (_a) => {
                this.cfg.audio.volume = this.mk.volume
            })

            this.refreshPlaylists()
            document.body.removeAttribute("loading")
            if (window.location.hash != "") {
                this.appRoute(window.location.hash)
            } else {
                this.page = "home"
            }

            setTimeout(() => {
                this.getSocialBadges()
                this.getBrowsePage();
                this.$forceUpdate()
            }, 500)

        },
        setTheme(theme = "") {
            console.log(theme)
            if (this.cfg.visual.theme == "") {
                this.cfg.visual.theme = "default.less"
            }
            if (theme == "") {
                theme = this.cfg.visual.theme
            } else {
                this.cfg.visual.theme = theme
            }
            document.querySelector("#userTheme").href = `themes/${this.cfg.visual.theme}`
            document.querySelectorAll(`[id*='less']`).forEach(el => {
                el.remove()
            });
            less.refresh()
        },
        unauthorize() {
            this.mk.unauthorize()
            document.location.reload()
        },
        getAppClasses() {
            let classes = {}
            if (this.cfg.advanced.experiments.includes('compactui')) {
                classes.compact = true
            }
            if (this.cfg.visual.window_background_style == "none") {
                classes.simplebg = true
            }
            return classes
        },
        invokeDrawer(panel) {
            if (this.drawer.panel == panel && this.drawer.open) {
                if (panel == "lyrics") {
                    this.lyricon = false
                }
                this.drawer.panel = ""
                this.drawer.open = false
            } else {
                if (panel == "lyrics") {
                    this.lyricon = true
                } else {
                    this.lyricon = false
                }
                this.drawer.open = true
                this.drawer.panel = panel
            }
        },
        select_removeMediaItem(id) {
            this.selectedMediaItems.filter(item => item.guid == id).forEach(item => {
                this.selectedMediaItems.splice(this.selectedMediaItems.indexOf(item), 1)
            })
        },
        select_hasMediaItem(id) {
            let found = this.selectedMediaItems.find(item => item.guid == id)
            if (found) {
                return true
            } else {
                return false
            }
        },
        select_selectMediaItem(id, kind, index, guid, library) {
            if (!this.select_hasMediaItem(guid)) {
                this.selectedMediaItems.push({
                    id: id,
                    kind: kind,
                    index: index,
                    guid: guid,
                    isLibrary: library
                })
            }
        },
        getPlaylistFolderChildren(id) {
            return this.playlists.listing.filter(playlist => {
                if (playlist.parent == id) {
                    return playlist
                }
            })
        },
        async refreshPlaylists() {
            let self = this
            this.apiCall('https://api.music.apple.com/v1/me/library/playlist-folders/p.playlistsroot/children/', res => {
                self.playlists.listing = res.data
                self.playlists.listing.forEach(playlist => {
                    playlist.parent = "p.playlistsroot"
                })
                self.sortPlaylists()
            })
        },
        sortPlaylists() {
            this.playlists.listing.sort((a, b) => {
                if (a.type === "library-playlist-folders" && b.type !== "library-playlist-folders") {
                    return -1
                } else if (a.type !== "library-playlist-folders" && b.type === "library-playlist-folders") {
                    return 1
                } else {
                    return 0
                }
            })
        },
        playlistHeaderContextMenu(event) {
            let menu = {
                items: [{
                    name: app.getLz('term.createNewPlaylist'),
                    action: () => {
                        this.newPlaylist()
                    }
                },
                    {
                        name: app.getLz('term.createNewPlaylistFolder'),
                        action: () => {
                            this.newPlaylistFolder()
                        }
                    }
                ]
            }
            this.showMenuPanel(menu, event)
        },
        async editPlaylistFolder(id, name = app.getLz('term.newPlaylist')) {
            let self = this
            this.mk.api.v3.music(
                `/v1/me/library/playlist-folders/${id}`, {}, {
                    fetchOptions: {
                        method: "PATCH",
                        body: JSON.stringify({
                            attributes: {name: name}
                        })
                    }
                }
            ).then(res => {
                self.refreshPlaylists()
            })
        },
        async editPlaylist(id, name = app.getLz('term.newPlaylist')) {
            let self = this
            this.mk.api.v3.music(
                `/v1/me/library/playlists/${id}`, {}, {
                    fetchOptions: {
                        method: "PATCH",
                        body: JSON.stringify({
                            attributes: {name: name}
                        })
                    }
                }
            ).then(res => {
                self.refreshPlaylists()
            })
        },
        copyToClipboard(str) {
            if (navigator.userAgent.includes('Darwin') || navigator.appVersion.indexOf("Mac")!=-1) {
                this.darwinShare(str)
            } else {
                notyf.success(app.getLz('term.share.success'))
                navigator.clipboard.writeText(str).then(r => console.log("Copied to clipboard."))
            }
        },
        newPlaylist(name = app.getLz('term.newPlaylist'), tracks = []) {
            let self = this
            let request = {
                name: name
            }
            if (tracks.length > 0) {
                request.tracks = tracks
            }
            app.mk.api.v3.music(`/v1/me/library/playlists`, {}, {
                fetchOptions: {
                    method: "POST",
                    body: JSON.stringify({
                        "attributes": {"name": name},
                        "relationships": {
                            "tracks": {"data": tracks},
                        }
                    })
                }
            }).then(res => {
                res = res.data.data[0]
                console.log(res)
                self.appRoute(`playlist_` + res.id);
                self.showingPlaylist = [];
                self.getPlaylistFromID(app.page.substring(9))
                self.playlists.listing.push({
                    id: res.id,
                    attributes: {
                        name: name
                    },
                    parent: "p.playlistsroot"
                })
                self.sortPlaylists()
                setTimeout(() => {
                    app.refreshPlaylists()
                }, 8000)
            })
        },
        deletePlaylist(id) {
            let self = this
            if (confirm(app.getLz('term.deletePlaylist'))) {
                app.mk.api.v3.music(`/v1/me/library/playlists/${id}`, {}, {
                    fetchOptions: {
                        method: "DELETE"
                    }
                }).then(res => {
                    // remove this playlist from playlists.listing if it exists
                    let found = self.playlists.listing.find(item => item.id == id)
                    if (found) {
                        self.playlists.listing.splice(self.playlists.listing.indexOf(found), 1)
                    }
                })
            }
        },
        async showCollection(response, title, type, requestBody = {}) {
            let self = this
            console.log(response)
            this.collectionList.requestBody = {}
            this.collectionList.response = response
            this.collectionList.title = title
            this.collectionList.type = type
            this.collectionList.requestBody = requestBody
            app.appRoute("collection-list")
        },
        async showArtistView(artist, title, view) {
            let response = (await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists/${artist}/view/${view}?l=${this.mklang}`, {}, {includeResponseMeta: !0})).data
            console.log(response)
            await this.showCollection(response, title, "artists")
        },
        async showRecordLabelView(label, title, view) {
            let response = (await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/record-labels/${label}/view/${view}?l=${this.mklang}`)).data
            await this.showCollection(response, title, "record-labels")
        },
        async showSearchView(term, group, title) {

            let requestBody = {
                platform: "web",
                groups: group,
                types: "activities,albums,apple-curators,artists,curators,editorial-items,music-movies,music-videos,playlists,songs,stations,tv-episodes,uploaded-videos,record-labels",
                limit: 25,
                relate: {
                    editorialItems: ["contents"]
                },
                include: {
                    albums: ["artists"],
                    songs: ["artists"],
                    "music-videos": ["artists"]
                },
                extend: "artistUrl",
                fields: {
                    artists: "url,name,artwork,hero",
                    albums: "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url"
                },
                with: "serverBubbles,lyricHighlights",
                art: {
                    "url": "cf"
                },
                omit: {
                    resource: ["autos"]
                },
                groups: group,
                l : this.mklang
            }
            let response = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/search?term=${term}`, requestBody, {
                includeResponseMeta: !0
            })

            console.log('searchres', response)
            let responseFormat = {
                data: response.data.results[group].data,
                next: response.data.results[group].next,
                groups: group
            }
            await this.showCollection(responseFormat, title, "search", requestBody)
        },
        async getPlaylistContinuous(response, transient = false) {
            response = response.data.data[0]
            let self = this
            let playlistId = response.id
            if (!transient) this.playlists.loadingState = 0
            this.showingPlaylist = response
            if (!response.relationships.tracks.next) {
                this.playlists.loadingState = 1
                return
            }

            function getPlaylistTracks(next) {
                app.apiCall(app.musicBaseUrl + next, res => {
                    if (self.showingPlaylist.id != playlistId) {
                        return
                    }
                    self.showingPlaylist.relationships.tracks.data = self.showingPlaylist.relationships.tracks.data.concat(res.data)
                    if (res.next) {
                        getPlaylistTracks(res.next)
                    } else {
                        self.playlists.loadingState = 1
                    }
                })
            }

            getPlaylistTracks(response.relationships.tracks.next)

        },
        async getPlaylistFromID(id, transient = false) {
            let self = this
            const params = {
                include: "tracks",
                platform: "web",
                "include[library-playlists]": "catalog,tracks",
                "fields[playlists]": "curatorName,playlistType,name,artwork,url,playParams",
                "include[library-songs]": "catalog,artists,albums,playParams,name,artwork,url",
                "fields[catalog]": "artistUrl,albumUrl,url",
                "fields[songs]": "artistUrl,albumUrl,playParams,name,artwork,url,artistName,albumName,durationInMillis",
                l : this.mklang
            }
            if (!transient) {
                this.playlists.loadingState = 0;
            }
            app.mk.api.v3.music(`/v1/me/library/playlists/${id}`, params).then(res => {
                self.getPlaylistContinuous(res, transient)
            }).catch((e) => {
                console.log(e);
                try {
                    app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/playlists/${id}`, params).then(res => {
                        self.getPlaylistContinuous(res, transient)
                    })
                } catch (err) {
                    console.log(err)
                }
            })

        },
        async getArtistFromID(id) {
            this.page = ""
            const artistData = await this.mkapi("artists", false, id, {
                "views": "featured-release,full-albums,appears-on-albums,featured-albums,featured-on-albums,singles,compilation-albums,live-albums,latest-release,top-music-videos,similar-artists,top-songs,playlists,more-to-hear,more-to-see",
                "extend": "artistBio,bornOrFormed,editorialArtwork,editorialVideo,isGroup,origin,hero",
                "extend[playlists]": "trackCount",
                "include[songs]": "albums",
                "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount",
                "limit[artists:top-songs]": 20,
                "art[url]": "f",
                l : this.mklang
            }, {includeResponseMeta: !0})
            console.log(artistData.data.data[0])
            this.artistPage.data = artistData.data.data[0]
            this.page = "artist-page"
        },
        progressBarStyle() {
            let val = this.playerLCD.playbackDuration
            if (this.playerLCD.desiredDuration > 0) {
                val = this.playerLCD.desiredDuration
            }
            let min = 0
            let max = this.mk.currentPlaybackDuration
            let value = (val - min) / (max - min) * 100
            return {
                'background': ('linear-gradient(to right, var(--keyColor) 0%, var(--keyColor) ' + value + '%, #333 ' + value + '%, #333 100%)')
            }
        },
        async getRecursive(response) {
            // if response has a .next() property run it and keep running until .next is null or undefined
            // and then return the response concatenated with the results of the next() call
            function executeRequest() {
                if (response.next) {
                    return response.next().then(executeRequest)
                } else {
                    return response
                }
            }

            return executeRequest()
        },
        async getRecursive2(response, sendTo) {
            let returnData = {
                "data": [],
                "meta": {}
            }
            if (response.next) {
                console.log("has next")
                returnData.data.concat(response.data)
                returnData.meta = response.meta
                return await this.getRecursive(await response.next())
            } else {
                console.log("no next")
                returnData.data.concat(response.data)
                return returnData
            }
        },
        async getSearchHints() {
            if (this.search.term == "") {
                this.search.hints = []
                return
            }
            let hints = await (await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/search/hints?term=${this.search.term}`)).data.results
            this.search.hints = hints ? hints.terms : []
        },
        getSongProgress() {
            if (this.playerLCD.userInteraction) {
                return this.playerLCD.desiredDuration
            } else {
                return this.playerLCD.playbackDuration
            }
        },
        convertTime(time) {
            if (typeof time !== "number") {
                time = parseInt(time)
            }

            const timeGates = {
                600: 15,
                3600: 14,
                36000: 12,
            }

            for (let key in timeGates) {
                if (time < key) {
                    return new Date(time * 1000).toISOString().substring(timeGates[key], 19)
                }
            }

            return new Date(time * 1000).toISOString().substring(11, 19)
        },
        hashCode(str) {
            let hash = 0,
                i, chr;
            if (str.length === 0) return hash;
            for (i = 0; i < str.length; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },
        appRoute(route) {
            console.log(route)
            if (route == "" || route == "#" || route == "/") {
                return;
            }
            route = route.replace(/#/g, "")
            // if the route contains does not include a / then route to the page directly
            if (route.indexOf("/") == -1) {
                this.page = route
                window.location.hash = this.page
                if (this.page == "settings") {
                    this.getVersion()
                }
                return
            }
            let hash = route.split("/")
            let page = hash[0]
            let id = hash[1]
            let isLibrary = hash[2] ?? false
            console.log(`page: ${page} id: ${id} isLibrary: ${isLibrary}`)
            this.routeView({
                kind: page,
                id: id,
                attributes: {
                    playParams: {kind: page, id: id, isLibrary: isLibrary}
                }
            })
        },
        routeView(item) {
            let kind = (item.attributes.playParams ? (item.attributes.playParams.kind ?? (item.type ?? '')) : (item.type ?? ''));
            let id = (item.attributes.playParams ? (item.attributes.playParams.id ?? (item.id ?? '')) : (item.id ?? ''));
            ;
            let isLibrary = item.attributes.playParams ? (item.attributes.playParams.isLibrary ?? false) : false;
            console.log(kind, id, isLibrary)
            if (kind.includes("playlist") || kind.includes("album")) {
                app.showingPlaylist = [];
            }
            if (kind.toString().includes("apple-curator")) {
                kind = "appleCurator"
                app.getTypeFromID("appleCurator", (id), false, {
                    platform: "web",
                    include: "grouping,playlists",
                    extend: "editorialArtwork",
                    "art[url]": "f"
                });
                window.location.hash = `${kind}/${id}`
                document.querySelector("#app-content").scrollTop = 0
            } else if (kind.toString().includes("artist")) {
                app.getArtistInfo(id, isLibrary)
                window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ''}`
                document.querySelector("#app-content").scrollTop = 0

            } else if (kind.toString().includes("record-label") || kind.toString().includes("curator")) {
                if (kind.toString().includes("record-label")) {
                    kind = "recordLabel"
                } else {
                    kind = "curator"
                }
                app.page = (kind) + "_" + (id);
                app.getTypeFromID((kind), (id), (isLibrary), {
                    extend: "editorialVideo",
                    include: 'grouping,playlists',
                    views: 'top-releases,latest-releases,top-artists'
                });
                window.location.hash = `${kind}/${id}`
                document.querySelector("#app-content").scrollTop = 0
            } else if (!kind.toString().includes("radioStation") && !kind.toString().includes("song") && !kind.toString().includes("musicVideo") && !kind.toString().includes("uploadedVideo") && !kind.toString().includes("music-movie")) {
                let params = {
                    extend: "offers,editorialVideo",
                    "views": "appears-on,more-by-artist,related-videos,other-versions,you-might-also-like,video-extras,audio-extras",
                }

                if (this.cfg.advanced.experiments.includes('inline-playlists')) {
                    let showModal = kind.toString().includes("album") || kind.toString().includes("playlist")
                    if (app.page.includes("playlist") || app.page.includes("album")) {
                        showModal = false
                    }
                    if (showModal) {
                        app.modals.showPlaylist = true
                        app.chrome.contentAreaScrolling = false
                    } else {
                        app.page = (kind) + "_" + (id);
                        window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ''}`
                    }
                } else {
                    app.page = (kind) + "_" + (id);
                    window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ''}`
                }


                app.getTypeFromID((kind), (id), (isLibrary), params);
                // document.querySelector("#app-content").scrollTop = 0
            } else {
                app.playMediaItemById((id), (kind), (isLibrary), item.attributes.url ?? '')
            }
        },
        prevButton() {
            if (!app.prevButtonBackIndicator && app.mk.nowPlayingItem && app.mk.currentPlaybackTime > 2) {
                app.prevButtonBackIndicator = true;
                app.mk.seekToTime(0);
            } else {
                app.prevButtonBackIndicator = false;
                app.mk.skipToPreviousItem()
            }
        },
        async getNowPlayingItemDetailed(target) {
            let u = await app.mkapi(app.mk.nowPlayingItem.playParams.kind, (app.mk.nowPlayingItem.songId == -1), (app.mk.nowPlayingItem.songId != -1) ? app.mk.nowPlayingItem.songId : app.mk.nowPlayingItem["id"], {"include[songs]": "albums,artists", l : app.mklang});
            app.searchAndNavigate(u.data.data[0], target)
        },
        async searchAndNavigate(item, target) {
            let self = this
            app.tmpVar = item;
            switch (target) {
                case "artist":
                    let artistId = '';
                    try {
                        if (item.relationships.artists && item.relationships.artists.data.length > 0 && !item.relationships.artists.data[0].type.includes("library")) {
                            if (item.relationships.artists.data[0].type === "artist" || item.relationships.artists.data[0].type === "artists") {
                                artistId = item.relationships.artists.data[0].id
                            }
                        }
                        if (artistId == '') {
                            const url = (item.relationships.catalog.data[0].attributes.artistUrl);
                            artistId = (url).substring(url.lastIndexOf('/') + 1)
                            if (artistId.includes('viewCollaboration')) {
                                artistId = artistId.substring(artistId.lastIndexOf('ids=') + 4, artistId.lastIndexOf('-'))
                            }
                        }
                    } catch (_) {
                    }

                    if (artistId == "") {
                        let artistQuery = (await app.mk.api.v3.music(`v1/catalog/${app.mk.storefrontId}/search?term=${item.attributes.artistName}`, {
                            limit: 1,
                            types: 'artists'
                        })).data.results;
                        try {
                            if (artistQuery.artists.data.length > 0) {
                                artistId = artistQuery.artists.data[0].id;
                                console.log(artistId)
                            }
                        } catch (e) {
                        }
                    }
                    console.log(artistId);
                    if (artistId != "")
                        self.appRoute(`artist/${artistId}`)
                    break;
                case "album":
                    let albumId = '';
                    try {
                        if ((item.type ?? item.playParams?.kind ?? "") == "albums") {
                            albumId = item.id ?? ""
                        } else if (item.relationships.albums && item.relationships.albums.data.length > 0 && !item.relationships.albums.data[0].type.includes("library")) {
                            if (item.relationships.albums.data[0].type === "album" || item.relationships.albums.data[0].type === "albums") {
                                albumId = item.relationships.albums.data[0].id
                            }
                        }
                        if (albumId == '') {
                            const url = (item.relationships.catalog.data[0].attributes.url);
                            albumId = (url).substring(url.lastIndexOf('/') + 1)
                            if (albumId.includes("?i=")) {
                                albumId = albumId.substring(0, albumId.indexOf("?i="))
                            }
                        }
                    } catch (_) {
                    }

                    if (albumId == "") {
                        try {
                            let albumQuery = (await app.mk.api.v3.music(`v1/catalog/${app.mk.storefrontId}/search?term=${(item.attributes.albumName ?? item.attributes.name ?? "") + " " + (item.attributes.artistName ?? "")}`, {
                                limit: 1,
                                types: 'albums'
                            })).data.results;
                            if (albumQuery.albums.data.length > 0) {
                                albumId = albumQuery.albums.data[0].id;
                                console.log(albumId)
                            }
                        } catch (e) {
                        }
                    }
                    if (albumId != "") {
                        self.appRoute(`album/${albumId}`)
                    }
                    break;
                case "recordLabel":
                    let labelId = '';
                    try {
                        labelId = item.relationships['record-labels'].data[0].id
                    } catch (_) {
                    }

                    if (labelId == "") {
                        try {
                            let labelQuery = (await app.mk.api.v3.music(`v1/catalog/${app.mk.storefrontId}/search?term=${item.attributes.recordLabel}`, {
                                limit: 1,
                                types: 'record-labels'
                            })).data.results;
                            if (labelQuery["record-labels"].data.length > 0) {
                                labelId = labelQuery["record-labels"].data[0].id;
                                console.log(labelId)
                            }
                        } catch (e) {
                        }
                    }
                    if (labelId != "") {
                        app.showingPlaylist = []
                        await app.getTypeFromID("recordLabel", labelId, false, {views: 'top-releases,latest-releases,top-artists'});
                        app.page = "recordLabel_" + labelId;
                    }

                    break;
            }
        },
        exitMV() {
            MusicKit.getInstance().stop()
            document.getElementById("apple-music-video-container").style.display = "none";
        },
        getArtistInfo(id, isLibrary) {
            this.getArtistFromID(id)
            //this.getTypeFromID("artist",id,isLibrary,query)
        },
        playMediaItem(item) {
            let kind = (item.attributes.playParams ? (item.attributes.playParams.kind ?? (item.type ?? '')) : (item.type ?? ''));
            let id = (item.attributes.playParams ? (item.attributes.playParams.id ?? (item.id ?? '')) : (item.id ?? ''));
            ;
            let isLibrary = item.attributes.playParams ? (item.attributes.playParams.isLibrary ?? false) : false;
            let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
            console.log(kind, id, isLibrary)
            app.mk.stop().then(() => {
                if (kind.includes("artist")) {
                    app.mk.setStationQueue({artist: 'a-' + id}).then(() => {
                        app.mk.play()
                    })
                }
                    //     else if (kind.includes("playlist") && (id.startsWith("p.") || id.startsWith("pl."))){
                    //         /* Randomize array in-place using Durstenfeld shuffle algorithm */
                    //         function shuffleArray(array) {
                    //             for (var i = array.length - 1; i > 0; i--) {
                    //                 var j = Math.floor(Math.random() * (i + 1));
                    //                 var temp = array[i];
                    //                 array[i] = array[j];
                    //                 array[j] = temp;
                    //             }
                    //         }
                    //         app.mk.clearQueue().then(function () { {
                    //             app.mk.setQueue({[truekind]: [item.attributes.playParams.id ?? item.id]}).then(function () {
                    //                    app.mk.play().then(function (){
                    //                        app.mk.clearQueue().then(function (){
                    //                         var playlistId = id
                    //                         const params = {
                    //                             include: "tracks",
                    //                             platform: "web",
                    //                             "include[library-playlists]": "catalog,tracks",
                    //                             "fields[playlists]": "curatorName,playlistType,name,artwork,url",
                    //                             "include[library-songs]": "catalog,artists,albums",
                    //                             "fields[catalog]": "artistUrl,albumUrl",
                    //                             "fields[songs]": "artistUrl,albumUrl"
                    //                         }
                    //                         var playlistId = ''

                    //                         try {
                    //                             function getPlaylist(id, params, isLibrary){
                    //                                 if (isLibrary){
                    //                                     return  app.mk.api.library.playlist(id, params)
                    //                                 } else {  return app.mk.api.playlist(id, params)}
                    //                             }
                    //                             getPlaylist(id, params, isLibrary).then(res => {
                    //                                 let query = res.relationships.tracks.data.map(item => new MusicKit.MediaItem(item));
                    //                                 if (app.mk.shuffleMode == 1){shuffleArray(query); console.log('shf')}
                    //                                 app.mk.queue.append(query)
                    //                                 if (!res.relationships.tracks.next) {
                    //                                     return
                    //                                 } else {
                    //                                     getPlaylistTracks(res.relationships.tracks.next)
                    //                                 }

                    //                                 function getPlaylistTracks(next) {
                    //                                     app.apiCall(app.musicBaseUrl + next, res => {
                    //                                         if (res.id != playlistId) {
                    //                                             return
                    //                                         }
                    //                                         let query = res.data.map(item => new MusicKit.MediaItem(item))
                    //                                         if (app.mk.shuffleMode == 1){shuffleArray(query); console.log('shf')}
                    //                                         app.mk.queue.append(query)

                    //                                         if (res.next) {
                    //                                             getPlaylistTracks(res.next)
                    //                                         }
                    //                                     })
                    //                                 }
                    //                                     })
                    //                         } catch (e) {}


                    //                        })
                    //                    })
                    //                 })
                    //             }
                    //         })
                // }
                else {
                    app.playMediaItemById((id), (kind), (isLibrary), item.attributes.url ?? '')
                }
            })
        },
        async getTypeFromID(kind, id, isLibrary = false, params = {}, params2 = {}) {
            let a;
            if (kind == "album" | kind == "albums") {
                params["include"] = "tracks,artists,record-labels,catalog";
            }
            params['l'] = this.mklang;
            try {
                a = await this.mkapi(kind.toString(), isLibrary, id.toString(), params, params2);
            } catch (e) {
                console.log(e);
                try {
                    a = await this.mkapi(kind.toString(), !isLibrary, id.toString(), params, params2);
                } catch (err) {
                    console.log(err);
                    a = []
                } finally {
                    if (kind == "appleCurator") {
                        app.appleCurator = a.data.data[0]
                    } else {
                        this.getPlaylistContinuous(a)
                    }
                }
            } finally {
                if (kind == "appleCurator") {
                    app.appleCurator = a.data.data[0]
                } else {
                    this.getPlaylistContinuous(a)
                }
            }
            ;
        },
        searchLibrarySongs() {
            let self = this
            let prefs = this.cfg.libraryPrefs.songs
            let albumAdded = self.library?.albums?.listing?.map(function(i){return {[i.id]: i.attributes?.dateAdded}})
            let startTime = new Date().getTime()
            function sortSongs() {
                // sort this.library.songs.displayListing by song.attributes[self.library.songs.sorting] in descending or ascending order based on alphabetical order and numeric order
                // check if song.attributes[self.library.songs.sorting] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
                self.library.songs.displayListing.sort((a, b) => {
                    let aa = a.attributes[prefs.sort]
                    let bb = b.attributes[prefs.sort]
                    if (prefs.sort == "genre") {
                        aa = a.attributes.genreNames[0]
                        bb = b.attributes.genreNames[0]
                    }
                    if (prefs.sort == "dateAdded"){
                        let albumida =  a.relationships?.albums?.data[0]?.id ?? '1970-01-01T00:01:01Z'
                        let albumidb =  b.relationships?.albums?.data[0]?.id ?? '1970-01-01T00:01:01Z'
                        aa = startTime - new Date(((albumAdded.find(i => i[albumida]))?? [])[albumida] ?? '1970-01-01T00:01:01Z').getTime()
                        bb = startTime - new Date(((albumAdded.find(i => i[albumidb]))?? [])[albumidb] ?? '1970-01-01T00:01:01Z').getTime()
                    }
                    if (aa == null) {
                        aa = ""
                    }
                    if (bb == null) {
                        bb = ""
                    }
                    if (prefs.sortOrder == "asc") {
                        if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                            return aa - bb
                        } else {
                            return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase())
                        }
                    } else if (prefs.sortOrder == "desc") {
                        if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                            return bb - aa
                        } else {
                            return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase())
                        }
                    }
                })
            }

            if (this.library.songs.search == "") {
                this.library.songs.displayListing = this.library.songs.listing
                sortSongs()
            } else {
                this.library.songs.displayListing = this.library.songs.listing.filter(item => {
                    let itemName = item.attributes.name.toLowerCase()
                    let searchTerm = this.library.songs.search.toLowerCase()
                    let artistName = ""
                    let albumName = ""
                    if (item.attributes.artistName != null) {
                        artistName = item.attributes.artistName.toLowerCase()
                    }
                    if (item.attributes.albumName != null) {
                        albumName = item.attributes.albumName.toLowerCase()
                    }

                    // remove any non-alphanumeric characters and spaces from search term and item name
                    searchTerm = searchTerm.replace(/[^a-z0-9 ]/gi, "")
                    itemName = itemName.replace(/[^a-z0-9 ]/gi, "")
                    artistName = artistName.replace(/[^a-z0-9 ]/gi, "")
                    albumName = albumName.replace(/[^a-z0-9 ]/gi, "")

                    if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
                        return item
                    }
                })
                sortSongs()
            }
        },
        // make a copy of searchLibrarySongs except use Albums instead of Songs
        searchLibraryAlbums(index) {
            let self = this

            function sortAlbums() {
                // sort this.library.albums.displayListing by album.attributes[self.library.albums.sorting[index]] in descending or ascending order based on alphabetical order and numeric order
                // check if album.attributes[self.library.albums.sorting[index]] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
                self.library.albums.displayListing.sort((a, b) => {
                    let aa = a.attributes[self.library.albums.sorting[index]]
                    let bb = b.attributes[self.library.albums.sorting[index]]
                    if (self.library.albums.sorting[index] == "genre") {
                        aa = a.attributes.genreNames[0]
                        bb = b.attributes.genreNames[0]
                    }
                    if (aa == null) {
                        aa = ""
                    }
                    if (bb == null) {
                        bb = ""
                    }
                    if (self.library.albums.sortOrder[index] == "asc") {
                        if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                            return aa - bb
                        } else {
                            return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase())
                        }
                    } else if (self.library.albums.sortOrder[index] == "desc") {
                        if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                            return bb - aa
                        } else {
                            return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase())
                        }
                    }
                })
            }

            if (this.library.albums.search == "") {
                this.library.albums.displayListing = this.library.albums.listing
                sortAlbums()
            } else {
                this.library.albums.displayListing = this.library.albums.listing.filter(item => {
                    let itemName = item.attributes.name.toLowerCase()
                    let searchTerm = this.library.albums.search.toLowerCase()
                    let artistName = ""
                    let albumName = ""
                    if (item.attributes.artistName != null) {
                        artistName = item.attributes.artistName.toLowerCase()
                    }
                    if (item.attributes.albumName != null) {
                        albumName = item.attributes.albumName.toLowerCase()
                    }

                    // remove any non-alphanumeric characters and spaces from search term and item name
                    searchTerm = searchTerm.replace(/[^a-z0-9 ]/gi, "")
                    itemName = itemName.replace(/[^a-z0-9 ]/gi, "")
                    artistName = artistName.replace(/[^a-z0-9 ]/gi, "")
                    albumName = albumName.replace(/[^a-z0-9 ]/gi, "")

                    if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
                        return item
                    }
                })
                sortAlbums()
            }
        },
        // make a copy of searchLibrarySongs except use Albums instead of Songs
        searchLibraryArtists(index) {
            let self = this

            function sortArtists() {
                // sort this.library.albums.displayListing by album.attributes[self.library.albums.sorting[index]] in descending or ascending order based on alphabetical order and numeric order
                // check if album.attributes[self.library.albums.sorting[index]] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
                self.library.artists.displayListing.sort((a, b) => {
                    let aa = a.attributes[self.library.artists.sorting[index]]
                    let bb = b.attributes[self.library.artists.sorting[index]]
                    if (self.library.artists.sorting[index] == "genre") {
                        aa = a.attributes.genreNames[0]
                        bb = b.attributes.genreNames[0]
                    }
                    if (aa == null) {
                        aa = ""
                    }
                    if (bb == null) {
                        bb = ""
                    }
                    if (self.library.artists.sortOrder[index] == "asc") {
                        if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                            return aa - bb
                        } else {
                            return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase())
                        }
                    } else if (self.library.artists.sortOrder[index] == "desc") {
                        if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                            return bb - aa
                        } else {
                            return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase())
                        }
                    }
                })
            }

            if (this.library.artists.search == "") {
                this.library.artists.displayListing = this.library.artists.listing
                sortArtists()
            } else {
                this.library.artists.displayListing = this.library.artists.listing.filter(item => {
                    let itemName = item.attributes.name.toLowerCase()
                    let searchTerm = this.library.artists.search.toLowerCase()
                    let artistName = ""
                    let albumName = ""
                    // if (item.attributes.artistName != null) {
                    //     artistName = item.attributes.artistName.toLowerCase()
                    // }
                    // if (item.attributes.albumName != null) {
                    //     albumName = item.attributes.albumName.toLowerCase()
                    // }

                    // remove any non-alphanumeric characters and spaces from search term and item name
                    searchTerm = searchTerm.replace(/[^a-z0-9 ]/gi, "")
                    itemName = itemName.replace(/[^a-z0-9 ]/gi, "")


                    if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
                        return item
                    }
                })
                sortArtists()
            }
        },
        getSidebarItemClass(page) {
            if (this.page == page) {
                return ["active"]
            } else {
                return []
            }
        },
        async mkapi(method, library = false, term, params = {}, params2 = {}, attempts = 0) {
            if (method.includes(`recordLabel`)) {
                method = `record-labels`
            }
            if (method.includes(`appleCurator`)) {
                method = `apple-curators`
            }
            if (attempts > 3) {
                return
            }
            let truemethod = (!method.endsWith("s")) ? (method + "s") : method;
            try {
                if (library) {
                    return await this.mk.api.v3.music(`v1/me/library/${truemethod}/${term.toString()}`, params, params2)
                } else {
                    return await this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2)
                }
            } catch (e) {
                console.log(e)
                return await this.mkapi(method, library, term, params, params2, attempts + 1)
            }
        },
        getLibraryGenres() {
            let genres = []
            genres = []
            this.library.songs.listing.forEach((item) => {
                item.attributes.genreNames.forEach((genre) => {
                    if (!genres.includes(genre)) {
                        genres.push(genre)
                    }
                })
            })
            return genres
        },
        async getLibrarySongsFull(force = false) {
            let self = this
            let library = []
            let downloaded = null;
            if ((this.library.songs.downloadState == 2) && !force) {
                return
            }
            if (this.library.songs.downloadState == 1) {
                return
            }
            if (localStorage.getItem("librarySongs") != null) {
                this.library.songs.listing = JSON.parse(localStorage.getItem("librarySongs"))
                this.searchLibrarySongs()
            }
            if (this.songstest) {
                return
            }
            this.library.songs.downloadState = 1
            this.library.backgroundNotification.show = true
            this.library.backgroundNotification.message = app.getLz('notification.updatingLibrarySongs')

            function downloadChunk() {
                const params = {
                    "include[library-songs]": "catalog,artists,albums",
                    "fields[artists]": "name,url,id",
                    "fields[albums]": "name,url,id",
                    platform: "web",
                    "fields[catalog]": "artistUrl,albumUrl",
                    "fields[songs]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
                    limit: 100,
                    l: self.mklang
                }
                const safeparams = {
                    "platform": "web",
                    "limit": 80
                }
                self.library.songs.downloadState = 1
                if (downloaded == null) {
                    app.mk.api.v3.music(`/v1/me/library/songs/`, params).then((response) => {
                        processChunk(response.data)
                    }).catch((error) => {
                        console.log('safe loading');
                        app.mk.api.v3.music(`/v1/me/library/songs/`, safeparams).then((response) => {
                            processChunk(response.data)
                        }).catch((error) => {
                            console.log('safe loading failed', error)
                            app.library.songs.downloadState = 2
                            app.library.backgroundNotification.show = false
                        })
                    })
                } else {
                    if (downloaded.next != null) {
                        app.mk.api.v3.music(downloaded.next, params).then((response) => {
                            processChunk(response.data)
                        }).catch((error) => {
                            console.log('safe loading');
                            app.mk.api.v3.music(downloaded.next, safeparams).then((response) => {
                                processChunk(response.data)
                            }).catch((error) => {
                                console.log('safe loading failed', error)
                                app.library.songs.downloadState = 2
                                app.library.backgroundNotification.show = false
                            })
                        })
                    } else {
                        console.log("Download next", downloaded.next)
                    }
                }
            }

            function processChunk(response) {
                downloaded = response
                library = library.concat(downloaded.data)
                self.library.backgroundNotification.show = true
                self.library.backgroundNotification.message = app.getLz('notification.updatingLibrarySongs')
                self.library.backgroundNotification.total = downloaded.meta.total
                self.library.backgroundNotification.progress = library.length

                if (downloaded.meta.total == 0) {
                    self.library.songs.downloadState = 3
                    return
                }
                if (typeof downloaded.next == "undefined") {
                    console.log("downloaded.next is undefined")
                    self.library.songs.listing = library
                    self.library.songs.downloadState = 2
                    self.library.backgroundNotification.show = false
                    self.searchLibrarySongs()
                    localStorage.setItem("librarySongs", JSON.stringify(library))
                }
                if (downloaded.meta.total > library.length || typeof downloaded.meta.next != "undefined") {
                    console.log(`downloading next chunk - ${library.length} songs so far`)
                    downloadChunk()
                } else {
                    self.library.songs.listing = library
                    self.library.songs.downloadState = 2
                    self.library.backgroundNotification.show = false
                    self.searchLibrarySongs()
                    localStorage.setItem("librarySongs", JSON.stringify(library))
                    // console.log(library)
                }
            }

            downloadChunk()
        },
        // copy the getLibrarySongsFull function except change Songs to Albums
        async getLibraryAlbumsFull(force = false, index) {
            let self = this
            let library = []
            let downloaded = null;
            if ((this.library.albums.downloadState == 2 || this.library.albums.downloadState == 1) && !force) {
                return
            }
            if (localStorage.getItem("libraryAlbums") != null) {
                this.library.albums.listing = JSON.parse(localStorage.getItem("libraryAlbums"))
                this.searchLibraryAlbums(index)
            }
            if (this.songstest) {
                return
            }
            this.library.albums.downloadState = 1
            this.library.backgroundNotification.show = true
            this.library.backgroundNotification.message = app.getLz('notification.updatingLibraryAlbums')

            function downloadChunk() {
                self.library.albums.downloadState = 1
                const params = {
                    "include[library-albums]": "catalog,artists,albums",
                    "fields[artists]": "name,url,id",
                    "fields[albums]": "name,url,id",
                    platform: "web",
                    "fields[catalog]": "artistUrl,albumUrl",
                    "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
                    limit: 100,
                    l: self.mklang
                }
                const safeparams = {
                    platform: "web",
                    limit: "60",
                    "include[library-albums]": "artists",
                    "include[library-artists]": "catalog",
                    "include[albums]": "artists",
                    "fields[artists]": "name,url",
                    "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
                    "includeOnly": "catalog,artists"
                }
                if (downloaded == null) {
                    app.mk.api.v3.music(`/v1/me/library/albums/`, params).then((response) => {
                        processChunk(response.data)
                    }).catch((error) => {
                        console.log('safe loading');
                        app.mk.api.v3.music(`/v1/me/library/albums/`, safeparams).then((response) => {
                            processChunk(response.data)
                        }).catch((error) => {
                            console.log('safe loading failed', error)
                            app.library.albums.downloadState = 2
                            app.library.backgroundNotification.show = false
                        })
                    })
                } else {
                    if (downloaded.next != null) {
                        app.mk.api.v3.music(downloaded.next, params).then((response) => {
                            processChunk(response.data)
                        }).catch((error) => {
                            console.log('safe loading');
                            app.mk.api.v3.music(downloaded.next, safeparams).then((response) => {
                                processChunk(response.data)
                            }).catch((error) => {
                                console.log('safe loading failed', error);
                                app.library.albums.downloadState = 2
                                app.library.backgroundNotification.show = false
                            })
                        })
                    } else {
                        console.log("Download next", downloaded.next)
                    }
                }
            }

            function processChunk(response) {
                downloaded = response
                library = library.concat(downloaded.data)
                self.library.backgroundNotification.show = true
                self.library.backgroundNotification.message = app.getLz('notification.updatingLibraryAlbums')
                self.library.backgroundNotification.total = downloaded.meta.total
                self.library.backgroundNotification.progress = library.length
                if (downloaded.meta.total == 0) {
                    self.library.albums.downloadState = 3
                    return
                }
                if (typeof downloaded.next == "undefined") {
                    console.log("downloaded.next is undefined")
                    self.library.albums.listing = library
                    self.library.albums.downloadState = 2
                    self.library.backgroundNotification.show = false
                    localStorage.setItem("libraryAlbums", JSON.stringify(library))
                    self.searchLibraryAlbums(index)
                }
                if (downloaded.meta.total > library.length || typeof downloaded.meta.next != "undefined") {
                    console.log(`downloading next chunk - ${library.length
                    } albums so far`)
                    downloadChunk()
                } else {
                    self.library.albums.listing = library
                    self.library.albums.downloadState = 2
                    self.library.backgroundNotification.show = false
                    localStorage.setItem("libraryAlbums", JSON.stringify(library))
                    self.searchLibraryAlbums(index)
                    // console.log(library)
                }
            }

            downloadChunk()
        },
        // copy the getLibrarySongsFull function except change Songs to Albums
        async getLibraryArtistsFull(force = false, index) {
            let self = this
            let library = []
            let downloaded = null;
            if ((this.library.artists.downloadState == 2 || this.library.artists.downloadState == 1) && !force) {
                return
            }
            if (localStorage.getItem("libraryArtists") != null) {
                this.library.artists.listing = JSON.parse(localStorage.getItem("libraryArtists"))
                this.searchLibraryArtists(index)
            }
            if (this.songstest) {
                return
            }
            this.library.artists.downloadState = 1
            this.library.backgroundNotification.show = true
            this.library.backgroundNotification.message = app.getLz('notification.updatingLibraryArtists')

            function downloadChunk() {
                self.library.artists.downloadState = 1
                const params = {
                    include: "catalog",
                    // "include[library-artists]": "catalog,artists,albums",
                    // "fields[artists]": "name,url,id",
                    // "fields[albums]": "name,url,id",
                    platform: "web",
                    // "fields[catalog]": "artistUrl,albumUrl",
                    // "fields[artists]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
                    limit: 100,
                    l: self.mklang
                }
                const safeparams = {
                    include: "catalog",
                    platform: "web",
                    limit: 50,
                }
                if (downloaded == null) {
                    app.mk.api.v3.music(`/v1/me/library/artists/`, params).then((response) => {
                        processChunk(response.data)
                    }).catch((error) => {
                        console.log('safe loading');
                        app.mk.api.v3.music(`/v1/me/library/artists/`, safeparams).then((response) => {
                            processChunk(response.data)
                        }).catch((error) => {
                            console.log('safe loading failed', error)
                            app.library.artists.downloadState = 2
                            app.library.backgroundNotification.show = false
                        })
                    })

                } else {
                    if (downloaded.next != null) {
                        app.mk.api.v3.music(downloaded.next, params).then((response) => {
                            processChunk(response.data)
                        }).catch((error) => {
                            console.log('safe loading');
                            app.mk.api.v3.music(downloaded.next, safeparams).then((response) => {
                                processChunk(response.data)
                            }).catch((error) => {
                                console.log('safe loading failed', error)
                                app.library.artists.downloadState = 2
                                app.library.backgroundNotification.show = false
                            })
                        })
                    } else {
                        console.log("Download next", downloaded.next)
                    }

                }
            }

            function processChunk(response) {
                downloaded = response
                library = library.concat(downloaded.data)
                self.library.backgroundNotification.show = true
                self.library.backgroundNotification.message = app.getLz('notification.updatingLibraryArtists')
                self.library.backgroundNotification.total = downloaded.meta.total
                self.library.backgroundNotification.progress = library.length
                if (downloaded.meta.total == 0) {
                    self.library.albums.downloadState = 3
                    return
                }
                if (typeof downloaded.next == "undefined") {
                    console.log("downloaded.next is undefined")
                    self.library.artists.listing = library
                    self.library.artists.downloadState = 2
                    self.library.artists.show = false
                    localStorage.setItem("libraryArtists", JSON.stringify(library))
                    self.searchLibraryArtists(index)
                }
                if (downloaded.meta.total > library.length || typeof downloaded.meta.next != "undefined") {
                    console.log(`downloading next chunk - ${library.length
                    } artists so far`)
                    downloadChunk()
                } else {
                    self.library.artists.listing = library
                    self.library.artists.downloadState = 2
                    self.library.backgroundNotification.show = false
                    localStorage.setItem("libraryArtists", JSON.stringify(library))
                    self.searchLibraryArtists(index)
                    // console.log(library)
                }
            }

            downloadChunk()
        },
        getTotalTime() {
            try {
                if (app.showingPlaylist.relationships.tracks.data.length > 0) {
                    let time = Math.round([].concat(...app.showingPlaylist.relationships.tracks.data).reduce((a, {attributes: {durationInMillis}}) => a + durationInMillis, 0) / 1000);
                    let hours = Math.floor(time / 3600)
                    let mins = Math.floor(time / 60) % 60
                    let secs = time % 60
                    return app.showingPlaylist.relationships.tracks.data.length + " " + app.getLz('term.tracks') + ", " + ((hours > 0) ? (hours + (" " + ((hours > 1) ? app.getLz('term.time.hours') + ", " : app.getLz('term.time.hour') + ", "))) : "") + ((mins > 0) ? (mins + ((mins > 1) ? " " + app.getLz('term.time.minutes') + ", " : " " + app.getLz('term.time.minute') + ", ")) : "") + secs + ((secs > 1) ? " " + app.getLz('term.time.seconds') + "." : " " + app.getLz('term.time.second') + ".");
                } else return ""
            } catch (err) {
                return ""
            }
        },
        async getLibrarySongs() {
            let response = await this.mkapi("songs", true, "", {limit: 100, l : this.mklang}, {includeResponseMeta: !0})
            this.library.songs.listing = response.data.data
            this.library.songs.meta = response.data.meta
        },
        async getLibraryAlbums() {
            let response = await this.mkapi("albums", true, "", {limit: 100, l : this.mklang}, {includeResponseMeta: !0})
            this.library.albums.listing = response.data.data
            this.library.albums.meta = response.data.meta
        },
        async getListenNow(attempt = 0) {
            if (this.listennow.timestamp > Date.now() - 120000) {
                return
            }

            if (attempt > 3) {
                return
            }
            try {
                this.listennow = (await this.mk.api.v3.music(`v1/me/recommendations?timezone=${encodeURIComponent(this.formatTimezoneOffset())}`, {
                    name: "listen-now",
                    with: "friendsMix,library,social",
                    "art[social-profiles:url]": "c",
                    "art[url]": "c,f",
                    "omit[resource]": "autos",
                    "relate[editorial-items]": "contents",
                    extend: ["editorialCard", "editorialVideo"],
                    "extend[albums]": ["artistUrl"],
                    "extend[library-albums]": ["artistUrl", "editorialVideo"],
                    "extend[playlists]": ["artistNames", "editorialArtwork", "editorialVideo"],
                    "extend[library-playlists]": ["artistNames", "editorialArtwork", "editorialVideo"],
                    "extend[social-profiles]": "topGenreNames",
                    "include[albums]": "artists",
                    "include[songs]": "artists",
                    "include[music-videos]": "artists",
                    "fields[albums]": ["artistName", "artistUrl", "artwork", "contentRating", "editorialArtwork", "editorialVideo", "name", "playParams", "releaseDate", "url"],
                    "fields[artists]": ["name", "url"],
                    "extend[stations]": ["airDate", "supportsAirTimeUpdates"],
                    "meta[stations]": "inflectionPoints",
                    types: "artists,albums,editorial-items,library-albums,library-playlists,music-movies,music-videos,playlists,stations,uploaded-audios,uploaded-videos,activities,apple-curators,curators,tv-shows,social-upsells",
                    platform: "web",
                    l: this.mklang
                }, {
                    includeResponseMeta: !0,
                    reload: !0
                })).data;
                this.listennow.timestamp = Date.now()
                console.log(this.listennow)
            } catch (e) {
                console.log(e)
                this.getListenNow(attempt + 1)
            }
        },
        async getBrowsePage(attempt = 0) {
            if (this.browsepage.timestamp > Date.now() - 120000) {
                return
            }
            if (attempt > 3) {
                return
            }
            try {
                let browse = await app.mk.api.v3.music(`/v1/editorial/${app.mk.storefrontId}/groupings`, {
                    platform: "web",
                    name: "music",
                    "omit[resource:artists]": "relationships",
                    "include[albums]": "artists",
                    "include[songs]": "artists",
                    "include[music-videos]": "artists",
                    extend: "editorialArtwork,artistUrl",
                    "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
                    "art[url]": "f",
                    l: this.mklang
                });
                this.browsepage = browse.data.data[0];
                this.browsepage.timestamp = Date.now()
                console.log(this.browsepage)
            } catch (e) {
                console.log(e)
                this.getBrowsePage(attempt + 1)
            }
        },
        async getRadioStations(attempt = 0) {
            if (attempt > 3) {
                return
            }
            try {
                this.radio.personal = (await app.mk.api.v3.music(`/v1/me/recent/radio-stations`, {
                    "platform": "web",
                    "art[url]": "f",
                    l: this.mklang
                })).data.data;
            } catch (e) {
                console.log(e)
                this.getRadioStations(attempt + 1)
            }
        },
        async getMadeForYou(attempt = 0) {
            if (attempt > 3) {
                return
            }
            try {
                mfu = await app.mk.api.v3.music("/v1/me/library/playlists?platform=web&extend=editorialVideo&fields%5Bplaylists%5D=lastModifiedDate&filter%5Bfeatured%5D=made-for-you&include%5Blibrary-playlists%5D=catalog&fields%5Blibrary-playlists%5D=artwork%2Cname%2CplayParams%2CdateAdded")
                this.madeforyou = mfu.data
            } catch (e) {
                console.log(e)
                this.getMadeForYou(attempt + 1)
            }
        },
        newPlaylistFolder(name = app.getLz('term.newPlaylistFolder')) {
            let self = this
            this.mk.api.v3.music(
                "/v1/me/library/playlist-folders/", {}, {
                    fetchOptions: {
                        method: "POST",
                        body: JSON.stringify({
                            attributes: {name: name}
                        })
                    }
                }
            ).then((res) => {
                let playlist = (res.data.data[0])
                self.playlists.listing.push({
                    id: playlist.id,
                    attributes: {
                        name: playlist.attributes.name
                    },
                    type: "library-playlist-folders",
                    parent: "p.playlistsroot"
                })
                self.sortPlaylists()
                setTimeout(() => {
                    app.refreshPlaylists()
                }, 13000)
            })
        },
        unauthorize() {
            this.mk.unauthorize()
        },
        showSearch() {
            this.page = "search"
        },
        loadLyrics() { 
            const musicType = (MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem["type"] ?? '' : '';
            console.log("mt", musicType)
            if (musicType === "musicVideo") {
                this.loadYTLyrics();
            } else {
                if (app.cfg.lyrics.enable_mxm) {
                    this.loadMXM();
                } else {
                    this.loadAMLyrics();
                }
            }
        },
        loadAMLyrics() {
            const songID = (this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem["_songId"] ?? (this.mk.nowPlayingItem["songId"] ?? -1) : -1;
            // this.getMXM( trackName, artistName, 'en', duration);
            if (songID != -1) {
                this.mk.api.v3.music(`v1/catalog/${this.mk.storefrontId}/songs/${songID}/lyrics`)
                    .then((response) => {
                        this.lyricsMediaItem = response.data?.data[0]?.attributes["ttml"]
                        this.parseTTML()
                    })
            }
        },
        addToLibrary(id) {
            let self = this
            this.mk.addToLibrary(id).then((data) => {
                self.getLibrarySongsFull(true)
            })
            notyf.success(app.getLz('action.addToLibrary.success'));
        },
        removeFromLibrary(kind, id) {
            let self = this
            let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
            app.mk.api.v3.music(`v1/me/library/${truekind}/${id.toString()}`, {}, {
                fetchOptions: {
                    method: "DELETE"
                }
            }).then((data) => {
                self.getLibrarySongsFull(true)
            })
            notyf.success(app.getLz('action.removeFromLibrary.success'))
        },
        
        async losslessBadge() {
            const songID = (this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem["_songId"] ?? (this.mk.nowPlayingItem["songId"] ?? -1) : -1;
            if (app.cfg.advanced.ciderPPE && songID != -1) {
                /**let extendedAssets = await app.mk.api.song(songID, {extend : 'extendedAssetUrls'})
                 if (extendedAssets.attributes.audioTraits.includes('lossless')) {*/
                    app.mk.nowPlayingItem['attributes']['lossless'] = true
                    CiderAudio.audioNodes.llpwEnabled = 1
                    console.log("[Cider][Enhanced] Audio being processed by PPE")
                /**}
                else {
                    CiderAudio.audioNodes.llpwEnabled = 0
                }    */
            }
            
            else {
                CiderAudio.audioNodes.llpwEnabled = 0
            }
        },
        async loadYTLyrics() {
            const track = (this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.title ?? '' : '';
            const artist = (this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.artistName ?? '' : '';
            const time = (this.mk.nowPlayingItem != null) ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1;
            ipcRenderer.invoke('getYTLyrics', track, artist).then((result) => {
                if (result.length > 0) {
                    let ytid = result[0]['id']['videoId'];
                    if (app.cfg.lyrics.enable_yt) {
                        loadYT(ytid, app.cfg.lyrics.mxm_language ?? "en")
                    } else {
                        app.loadMXM()
                    }
                } else {
                    app.loadMXM()
                }

                function loadYT(id, lang) {
                    let req = new XMLHttpRequest();
                    let url = `https://www.youtube.com/watch?&v=${id}`;
                    req.open('GET', url, true);
                    req.onerror = function (e) {
                        this.loadMXM();
                    }
                    req.onload = function () {
                        // console.log(this.responseText);
                        res = this.responseText;
                        let captionurl1 = res.substring(res.indexOf(`{"playerCaptionsRenderer":{"baseUrl":"`) + (`{"playerCaptionsRenderer":{"baseUrl":"`).length);
                        let captionurl = captionurl1.substring(0, captionurl1.indexOf(`"`));
                        if (captionurl.includes("timedtext")) {
                            let json = JSON.parse(`{"url": "${captionurl}"}`);
                            let newurl = json.url + `&lang=${lang}&format=ttml`

                            let req2 = new XMLHttpRequest();

                            req2.open('GET', newurl, true);
                            req2.onerror = function (e) {
                                app.loadMXM();
                            }
                            req2.onload = function () {
                                try {
                                    const ttmlLyrics = this.responseText;
                                    if (ttmlLyrics) {
                                        this.lyricsMediaItem = ttmlLyrics
                                        this.parseTTML()
                                    }
                                } catch (e) {
                                    app.loadMXM();
                                }

                            }
                            req2.send();
                        } else {

                            app.loadMXM();

                        }
                    }
                    req.send();
                }

            })

        },
        loadMXM() {
            let attempt = 0;
            const track = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.title ?? '' : '');
            const artist = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.artistName ?? '' : '');
            const time = encodeURIComponent((this.mk.nowPlayingItem != null) ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1);
            const id = encodeURIComponent((this.mk.nowPlayingItem != null) ? app.mk.nowPlayingItem._songId ?? (app.mk.nowPlayingItem["songId"] ?? '') : '');
            let lrcfile = "";
            let richsync = [];
            const lang = app.cfg.lyrics.mxm_language //  translation language
            function revisedRandId() {
                return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
            }

            /* get token */
            function getToken(mode, track, artist, songid, lang, time, id) {
                if (attempt > 2) {
                    app.loadAMLyrics();
                } else {
                    attempt = attempt + 1;
                    let url = "https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0&t=" + revisedRandId();
                    let req = new XMLHttpRequest();
                    req.overrideMimeType("application/json");
                    req.open('GET', url, true);
                    req.setRequestHeader("authority", "apic-desktop.musixmatch.com");
                    req.onload = function () {
                        let jsonResponse = JSON.parse(this.responseText);
                        let status2 = jsonResponse["message"]["header"]["status_code"];
                        if (status2 == 200) {
                            let token = jsonResponse["message"]["body"]["user_token"] ?? '';
                            if (token != "" && token != "UpgradeOnlyUpgradeOnlyUpgradeOnlyUpgradeOnly") {
                                console.log('200 token', mode);
                                // token good
                                app.mxmtoken = token;

                                if (mode == 1) {
                                    getMXMSubs(track, artist, app.mxmtoken, lang, time, id);
                                } else {
                                    getMXMTrans(songid, lang, app.mxmtoken);
                                }
                            } else {
                                console.log('fake 200 token');
                                getToken(mode, track, artist, songid, lang, time)
                            }
                        } else {
                            console.log('token 4xx');
                            getToken(mode, track, artist, songid, lang, time)
                        }

                    };
                    req.onerror = function () {
                        console.log('error');
                        app.loadAMLyrics();
                    };
                    req.send();
                }
            }

            function getMXMSubs(track, artist, token, lang, time, id) {
                let usertoken = encodeURIComponent(token);
                let richsyncQuery = (app.cfg.lyrics.mxm_karaoke) ? "&optional_calls=track.richsync" : ""
                let timecustom = (!time || (time && time < 0)) ? '' : `&f_subtitle_length=${time}&q_duration=${time}&f_subtitle_length_max_deviation=40`;
                let itunesid = (id && id != "") ? `&track_itunes_id=${id}` : '';
                let url = "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched" + richsyncQuery + "&subtitle_format=lrc&q_artist=" + artist + "&q_track=" + track + itunesid + "&usertoken=" + usertoken + timecustom + "&app_id=web-desktop-app-v1.0&t=" + revisedRandId();
                let req = new XMLHttpRequest();
                req.overrideMimeType("application/json");
                req.open('GET', url, true);
                req.setRequestHeader("authority", "apic-desktop.musixmatch.com");
                req.onload = function () {
                    let jsonResponse = JSON.parse(this.responseText);
                    console.log(jsonResponse);
                    let status1 = jsonResponse["message"]["header"]["status_code"];

                    if (status1 == 200) {
                        let id = '';
                        try {
                            if (jsonResponse["message"]["body"]["macro_calls"]["matcher.track.get"]["message"]["header"]["status_code"] == 200 && jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["header"]["status_code"] == 200) {
                                id = jsonResponse["message"]["body"]["macro_calls"]["matcher.track.get"]["message"]["body"]["track"]["track_id"] ?? '';
                                lrcfile = jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["body"]["subtitle_list"][0]["subtitle"]["subtitle_body"];

                                try {
                                    lrcrich = jsonResponse["message"]["body"]["macro_calls"]["track.richsync.get"]["message"]["body"]["richsync"]["richsync_body"];
                                    richsync = JSON.parse(lrcrich);
                                    app.richlyrics = richsync;
                                } catch (_) {
                                }
                            }

                            if (lrcfile == "") {
                                app.loadAMLyrics()
                            } else {
                                if (richsync == [] || richsync.length == 0) {
                                    console.log("ok");
                                    // process lrcfile to json here
                                    app.lyricsMediaItem = lrcfile
                                    let u = app.lyricsMediaItem.split(/[\r\n]/);
                                    let preLrc = []
                                    for (var i = u.length - 1; i >= 0; i--) {
                                        let xline = (/(\[[0-9.:\[\]]*\])+(.*)/).exec(u[i])
                                        let end = (preLrc.length > 0) ? ((preLrc[preLrc.length - 1].startTime) ?? 99999) : 99999
                                        preLrc.push({
                                            startTime: app.toMS(xline[1].substring(1, xline[1].length - 2)) ?? 0,
                                            endTime: end,
                                            line: xline[2],
                                            translation: ''
                                        })
                                    }
                                    if (preLrc.length > 0)
                                        preLrc.push({
                                            startTime: 0,
                                            endTime: preLrc[preLrc.length - 1].startTime,
                                            line: "lrcInstrumental",
                                            translation: ''
                                        });
                                    app.lyrics = preLrc.reverse();
                                } else {
                                    preLrc = richsync.map(function (item) {
                                        return {
                                            startTime: item.ts,
                                            endTime: item.te,
                                            line: item.x,
                                            translation: ''
                                        }
                                    })
                                    if (preLrc.length > 0)
                                        preLrc.unshift({
                                            startTime: 0,
                                            endTime: preLrc[0].startTime,
                                            line: "lrcInstrumental",
                                            translation: ''
                                        });
                                    app.lyrics = preLrc;
                                }
                                if (lrcfile != null && lrcfile != '' && lang != "disabled") {
                                    // load translation
                                    getMXMTrans(id, lang, token);
                                } else {
                                    app.loadAMLyrics()
                                }
                            }
                        } catch (e) {
                            console.log(e);
                            app.loadAMLyrics()
                        }
                    } else { //4xx rejected
                        getToken(1, track, artist, '', lang, time);
                    }
                }
                req.send();
            }

            function getMXMTrans(id, lang, token) {
                if (lang != "disabled" && id != '') {
                    let usertoken = encodeURIComponent(token);
                    let url2 = "https://apic-desktop.musixmatch.com/ws/1.1/crowd.track.translations.get?translation_fields_set=minimal&selected_language=" + lang + "&track_id=" + id + "&comment_format=text&part=user&format=json&usertoken=" + usertoken + "&app_id=web-desktop-app-v1.0&t=" + revisedRandId();
                    let req2 = new XMLHttpRequest();
                    req2.overrideMimeType("application/json");
                    req2.open('GET', url2, true);
                    req2.setRequestHeader("authority", "apic-desktop.musixmatch.com");
                    req2.onload = function () {
                        let jsonResponse2 = JSON.parse(this.responseText);
                        console.log(jsonResponse2);
                        let status2 = jsonResponse2["message"]["header"]["status_code"];
                        if (status2 == 200) {
                            try {
                                let preTrans = []
                                let u = app.lyrics;
                                let translation_list = jsonResponse2["message"]["body"]["translations_list"];
                                if (translation_list.length > 0) {
                                    for (var i = 0; i < u.length - 1; i++) {
                                        preTrans[i] = ""
                                        for (var trans_line of translation_list) {
                                            if (u[i].line == " " + trans_line["translation"]["matched_line"] || u[i].line == trans_line["translation"]["matched_line"]) {
                                                u[i].translation = trans_line["translation"]["description"];
                                                break;
                                            }
                                        }
                                    }
                                    app.lyrics = u;
                                }
                            } catch (e) {
                                /// not found trans -> ignore		
                            }
                        } else { //4xx rejected
                            getToken(2, '', '', id, lang, '');
                        }
                    }
                    req2.send();
                }

            }

            if (track != "" & track != "No Title Found") {
                if (app.mxmtoken != null && app.mxmtoken != '') {
                    getMXMSubs(track, artist, app.mxmtoken, lang, time, id)
                } else {
                    getToken(1, track, artist, '', lang, time);
                }
            }
        },
        toMS(str) {
            let rawTime = str.match(/(\d+:)?(\d+:)?(\d+)(\.\d+)?/);
            let hours = (rawTime[2] != null) ? (rawTime[1].replace(":", "")) : 0;
            let minutes = (rawTime[2] != null) ? (hours * 60 + rawTime[2].replace(":", "") * 1) : ((rawTime[1] != null) ? rawTime[1].replace(":", "") : 0);
            let seconds = (rawTime[3] != null) ? (rawTime[3]) : 0;
            let milliseconds = (rawTime[4] != null) ? (rawTime[4].replace(".", "")) : 0
            return parseFloat(`${minutes * 60 + seconds * 1}.${milliseconds * 1}`);
        },
        parseTTML() {
            this.lyrics = [];
            let preLrc = [];
            let xml = this.stringToXml(this.lyricsMediaItem);
            let lyricsLines = xml.getElementsByTagName('p');
            let synced = true;
            let endTimes = [];
            if (xml.getElementsByTagName('tt')[0].getAttribute("itunes:timing") === "None") {
                synced = false;
            }
            endTimes.push(0);
            if (synced) {
                for (element of lyricsLines) {
                    start = this.toMS(element.getAttribute('begin'))
                    end = this.toMS(element.getAttribute('end'))
                    if (start - endTimes[endTimes.length - 1] > 5 && endTimes[endTimes.length - 1] != 0) {
                        preLrc.push({
                            startTime: endTimes[endTimes.length - 1],
                            endTime: start,
                            line: "lrcInstrumental"
                        });
                    }
                    preLrc.push({startTime: start, endTime: end, line: element.textContent});
                    endTimes.push(end);
                }
                // first line dot
                if (preLrc.length > 0)
                    preLrc.unshift({startTime: 0, endTime: preLrc[0].startTime, line: "lrcInstrumental"});
            } else {
                for (element of lyricsLines) {
                    preLrc.push({startTime: 9999999, endTime: 9999999, line: element.textContent});
                }
            }
            this.lyrics = preLrc;

        },
        parseLyrics() {
            let xml = this.stringToXml(this.lyricsMediaItem)
            let json = xmlToJson(xml);
            this.lyrics = json
        },
        stringToXml(st) {
            // string to xml
            let xml = (new DOMParser()).parseFromString(st, "text/xml");
            return xml;

        },
        getCurrentTime() {
            return parseFloat(this.hmsToSecondsOnly(this.parseTime(this.mk.nowPlayingItem.attributes.durationInMillis - app.mk.currentPlaybackTimeRemaining * 1000)));
        },
        seekTo(time) {
            this.mk.seekToTime(time);
        },
        parseTime(value) {
            let minutes = Math.floor(value / 60000);
            let seconds = ((value % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        },
        parseTimeDecimal(value) {
            let minutes = Math.floor(value / 60000);
            let seconds = ((value % 60000) / 1000).toFixed(0);
            return minutes + "." + (seconds < 10 ? '0' : '') + seconds;
        },
        hmsToSecondsOnly(str) {
            let p = str.split(':'),
                s = 0,
                m = 1;

            while (p.length > 0) {
                s += m * parseInt(p.pop(), 10);
                m *= 60;
            }

            return s;
        },
        getLyricBGStyle(start, end) {
            let currentTime = this.getCurrentTime();
            // let duration = this.mk.nowPlayingItem.attributes.durationInMillis
            let start2 = this.hmsToSecondsOnly(start)
            let end2 = this.hmsToSecondsOnly(end)
            // let currentProgress = ((100 * (currentTime)) / (end2))
            // check if currenttime is between start and end
            this.player.lyricsDebug.start = start2
            this.player.lyricsDebug.end = end2
            this.player.lyricsDebug.current = currentTime
            if (currentTime >= start2 && currentTime <= end2) {
                return {
                    "--bgSpeed": `${(end2 - start2)}s`
                }
            } else {
                return {}
            }
        },
        playMediaItemById(id, kind, isLibrary, raurl = "") {
            let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
            console.log(id, truekind, isLibrary)
            try {
                if (truekind.includes("artist")) {
                    app.mk.setStationQueue({artist: 'a-' + id}).then(() => {
                        app.mk.play()
                    })
                } else if (truekind == "radioStations") {
                    this.mk.setStationQueue({url: raurl}).then(function (queue) {
                        MusicKit.getInstance().play()
                    });
                } else {
                    this.mk.setQueue({
                        [truekind]: [id],
                        parameters : {l : this.mklang}
                    }).then(function (queue) {
                        MusicKit.getInstance().play()
                    })
                }
            } catch (err) {
                console.log(err)
                this.playMediaItemById(id, kind, isLibrary, raurl)
            }
        },
        queueParentandplayChild(parent, childIndex, item) {

            /* Randomize array in-place using Durstenfeld shuffle algorithm */
            function shuffleArray(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }

            let kind = parent.substring(0, parent.indexOf(":"))
            let id = parent.substring(parent.indexOf(":") + 1, parent.length)
            let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
            console.log(truekind, id)

            try {
                if (app.library.songs.displayListing.length > childIndex && parent == "librarysongs") {
                    console.log(item)
                    if (item && ((app.library.songs.displayListing[childIndex].id != item.id))) {
                        childIndex = app.library.songs.displayListing.indexOf(item)
                    }

                    let query = app.library.songs.displayListing.map(item => new MusicKit.MediaItem(item));


                    app.mk.stop().then(() => {
                        if (item) {
                            app.mk.setQueue({
                                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                                parameters : {l : app.mklang}
                            }).then(function () {
                                app.mk.play().then(() => {
                                    if (app.mk.shuffleMode == 1) {
                                        shuffleArray(query)
                                    } else {
                                        for (let i = 0; i < query.length; i++) {
                                            if (query[i].id == item.id) {
                                                query.splice(0, i + 1);
                                                break;
                                            }
                                        }
                                    }
                                    app.mk.queue.append(query)
                                })
                            })
                        } else {
                            this.mk.clearQueue().then(function (_) {
                                if (app.mk.shuffleMode == 1) {
                                    shuffleArray(query)
                                }
                                app.mk.queue.append(query)
                                if (childIndex != -1) {
                                    app.mk.changeToMediaAtIndex(childIndex)
                                } else {
                                    app.mk.play()
                                }
                            })
                        }
                    })
                } else {
                    app.mk.stop().then(() => {
                        if (truekind == "playlists" && (id.startsWith("p.") || id.startsWith("pl.u"))) {
                            app.mk.setQueue({
                                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                                parameters : {l : app.mklang}
                            }).then(function () {
                                app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(item.id) ?? 1).then(function () {
                                    if ((app.showingPlaylist && app.showingPlaylist.id == id)) {
                                        let query = app.showingPlaylist.relationships.tracks.data.map(item => new MusicKit.MediaItem(item));
                                        let u = query;
                                        if (app.mk.shuffleMode == 1) {
                                            shuffleArray(u)
                                        } else {
                                            for (let i = 0; i < app.showingPlaylist.relationships.tracks.data.length; i++) {
                                                if (app.showingPlaylist.relationships.tracks.data[i].id == item.id) {
                                                    u.splice(0, i + 1);
                                                    break;
                                                }
                                            }
                                        }
                                        app.mk.queue.append(u)
                                    } else {
                                        app.getPlaylistFromID(id, true).then(function () {
                                            let query = app.showingPlaylist.relationships.tracks.data.map(item => new MusicKit.MediaItem(item));
                                            let u = query;
                                            if (app.mk.shuffleMode == 1) {
                                                shuffleArray(u)
                                            } else {
                                                for (let i = 0; i < app.showingPlaylist.relationships.tracks.data.length; i++) {
                                                    if (app.showingPlaylist.relationships.tracks.data[i].id == item.id) {
                                                        u.splice(0, i + 1);
                                                        break;
                                                    }
                                                }
                                            }
                                            app.mk.queue.append(u)
                                        })
                                    }
                                })

                            })
                        } else {
                            this.mk.setQueue({
                                [truekind]: [id],
                                parameters : {l : this.mklang}
                            }).then(function (queue) {
                                if (item && ((queue._itemIDs[childIndex] != item.id))) {
                                    childIndex = queue._itemIDs.indexOf(item.id)
                                }
                                if (childIndex != -1) {
                                    app.mk.changeToMediaAtIndex(childIndex)
                                } else if (item) {
                                    app.mk.playNext({
                                        [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id
                                    }).then(function () {
                                        app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(item.id) ?? 1)
                                        app.mk.play()
                                    })
                                } else {
                                    app.mk.play()
                                }
                            })
                        }
                    })
                }
            } catch (err) {
                console.log(err)
                try {
                    app.mk.stop()
                } catch (e) {
                }
                this.playMediaItemById(item.attributes.playParams.id ?? item.id, item.attributes.playParams.kind ?? item.type, item.attributes.playParams.isLibrary ?? false, item.attributes.url)
            }

        },
        friendlyTypes(type) {
            // use switch statement to return friendly name for media types "songs,artists,albums,playlists,music-videos,stations,apple-curators,curators"
            switch (type) {
                case "song":
                    return app.getLz('term.songs')
                    break;
                case "artist":
                    return app.getLz('term.artists')
                    break;
                case "album":
                    return app.getLz('term.albums')
                    break;
                case "playlist":
                    return app.getLz('term.playlists')
                    break;
                case "music_video":
                    return app.getLz('term.musicVideos')
                    break;
                case "station":
                    return app.getLz('term.stations')
                    break;
                case "apple-curator":
                    return app.getLz('term.appleCurators')
                    break;
                case "radio_show":
                    return app.getLz('term.radioShows')
                    break;
                case "record_label":
                    return app.getLz('term.recordLabels')
                    break;
                case "radio_episode":
                    return app.getLz('podcast.episodes')
                    break;
                case "video_extra":
                    return app.getLz('term.videoExtras')
                    break;
                case "curator":
                    return app.getLz('term.curators')
                    break;
                case "top":
                    return app.getLz('term.top')
                    break;
                default:
                    return type
                    break;
            }
        },
        async searchQuery(term = this.search.term) {
            let self = this
            if (term == "") {
                return
            }
            //this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/search?term=${this.search.term}`
            this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/search?term=${encodeURIComponent(this.search.term)}`, {
                types: "activities,albums,apple-curators,artists,curators,editorial-items,music-movies,music-videos,playlists,songs,stations,tv-episodes,uploaded-videos,record-labels",
                "relate[editorial-items]": "contents",
                "include[editorial-items]": "contents",
                "include[albums]": "artists",
                "include[artists]": "artists",
                "include[songs]": "artists,albums",
                "include[music-videos]": "artists",
                "extend": "artistUrl",
                "fields[artists]": "url,name,artwork,hero",
                "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
                "with": "serverBubbles,lyricHighlights",
                "art[url]": "c,f",
                "omit[resource]": "autos",
                "platform": "web",
                limit: 25,
                l: this.mklang
            }).then(function (results) {
                results.data.results["meta"] = results.data.meta
                self.search.results = results.data.results
            })

            await app.mk.api.v3.music(`v1/social/${app.mk.storefrontId}/search?term=${app.search.term}`, {
                types: ["playlists", "social-profiles"],
                limit: 25,
                with: ["serverBubbles", "lyricSnippet"],
                "art[url]": "f",
                "art[social-profiles:url]": "c"
            }, {includeResponseMeta: !0}).then(function (results) {
                results.data.results["meta"] = results.data.meta
                self.search.resultsSocial = results.data.results
            })
        },
        async inLibrary(items = []) {
            let types = []

            for (let item of items) {
                let type = item.type
                if (type.slice(-1) != "s") {
                    type += "s"
                }
                type = type.replace("library-", "") 
                let id = item.attributes.playParams.catalogId ?? item.id

                let index = types.findIndex(function (type) {
                    return type.type == this
                }, type)
                if (index == -1) {
                    types.push({type: type, id: [id]})
                } else {
                    types[index].id.push(id)
                }
            }
            types2 = types.map(function (item) {
                return {
                    [`ids[${item.type}]`]: [item.id]
                }
            })
            types2 = types2.reduce(function (result, item) {
                var key = Object.keys(item)[0]; //first property: a, b, c
                result[key] = item[key];
                return result;
            }, {});
            return (await this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}`, {
                ...{
                    "omit[resource]": "autos",
                    relate: "library",
                    fields: "inLibrary"
                },
                ...types2
            })).data.data
        },
        isInLibrary(playParams) {
            let self = this
            let id = ""
            // ugly code to check if current playback item is in library
            if (typeof playParams == "undefined") {
                return true
            }
            if (playParams["isLibrary"]) {
                return true
            } else if (playParams["catalogId"]) {
                id = playParams["catalogId"]
            } else if (playParams["id"]) {
                id = playParams["id"]
            }
            let found = this.library.songs.listing.filter((item) => {
                if (item["attributes"]) {
                    if (item["attributes"]["playParams"] && (item["attributes"]["playParams"]["catalogId"] == id)) {
                        return item;
                    }
                }
            })
            if (found.length != 0) {
                return true
            } else {
                return false
            }
        },
        mkReady() {
            if (this.mk["nowPlayingItem"]) {
                return true
            } else {
                return false
            }
        },
        getMediaItemArtwork(url, height = 64, width) {
            if (typeof url == "undefined" || url == "") {
                return "https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg"
            }
            let newurl = `${url.replace('{w}', width ?? height).replace('{h}', height).replace('{f}', "webp").replace('{c}', ((width === 900) ? "sr" : "cc"))}`;

            if (newurl.includes("900x516")) {
                newurl = newurl.replace("900x516cc", "900x516sr").replace("900x516bb", "900x516sr");
            }
            return newurl
        },
        _rgbToRgb(rgb = [0, 0, 0]) {
            // if rgb
            return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
        },
        getNowPlayingArtworkBG(size = 32, force = false) {
            let self = this
            if (typeof this.mk.nowPlayingItem === "undefined") return;
            let bginterval = setInterval(() => {
                if (!this.mkReady()) {
                    return ""
                }

                try {
                    if ((this.mk.nowPlayingItem && this.mk.nowPlayingItem["id"] != this.currentTrackID && document.querySelector('.bg-artwork')) || force) {
                        if (document.querySelector('.bg-artwork')) {
                            clearInterval(bginterval);
                        }
                        this.currentTrackID = this.mk.nowPlayingItem["id"];
                        document.querySelector('.bg-artwork').src = "";
                        if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
                            getBase64FromUrl(this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"].replace('{w}', size).replace('{h}', size)).then(img => {
                                document.querySelectorAll('.bg-artwork').forEach(artwork => {
                                    artwork.src = img;
                                })
                                self.$store.commit("setLCDArtwork", img)
                            })
                            try {
                                clearInterval(bginterval);
                            } catch (err) {
                            }
                        } else {
                            this.setLibraryArtBG()
                        }
                    } else if (this.mk.nowPlayingItem["id"] == this.currentTrackID) {
                        try {
                            clearInterval(bginterval);
                        } catch (err) {
                        }
                    }
                } catch (e) {
                    if (this.mk.nowPlayingItem && this.mk.nowPlayingItem["id"] && document.querySelector('.bg-artwork')) {
                        this.setLibraryArtBG()
                        try {
                            clearInterval(bginterval);
                        } catch (err) {
                        }
                    }
                }
            }, 200)
        },
        async getCurrentArtURL() {
            try {
                this.currentArtUrl = '';
                if (app.mk.nowPlayingItem != null && app.mk.nowPlayingItem.attributes != null && app.mk.nowPlayingItem.attributes.artwork != null && app.mk.nowPlayingItem.attributes.artwork.url != null && app.mk.nowPlayingItem.attributes.artwork.url != '') {
                    this.currentArtUrl = (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"] ?? '').replace('{w}', 50).replace('{h}', 50);
                    try {
                        document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', `url("${this.currentArtUrl}")`);
                    } catch (e) {
                    }
                } else {
                    let data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
                    data = data.data.data[0];
                    if (data != null && data !== "" && data.attributes != null && data.attributes.artwork != null) {
                        this.currentArtUrl = (data["attributes"]["artwork"]["url"] ?? '').replace('{w}', 50).replace('{h}', 50);
                        try {
                            document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', `url("${this.currentArtUrl}")`);
                        } catch (e) {
                        }
                    } else {
                        this.currentArtUrl = '';
                        try {
                            document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', `url("${this.currentArtUrl}")`);
                        } catch (e) {
                        }
                    }
                }
            } catch (e) {

            }
        },
        async setLibraryArt() {
            if (typeof this.mk.nowPlayingItem === "undefined") return;
            try {
                const data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
                data = data.data.data[0];

                if (data != null && data !== "") {
                    document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', 'url("' + (data["attributes"]["artwork"]["url"]).toString() + '")');
                } else {
                    document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', `url("")`);
                }
            } catch (e) {
            }
        },
        async setLibraryArtBG() {
            if (typeof this.mk.nowPlayingItem === "undefined") return;
            try {
                const data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
                data = data.data.data[0];

                if (data != null && data !== "") {
                    getBase64FromUrl((data["attributes"]["artwork"]["url"]).toString()).then(img => {
                        document.querySelector('.bg-artwork').forEach(artwork => {
                            artwork.src = img;
                        })
                        self.$store.commit("setLCDArtwork", img)
                    })
                }
            } catch (e) {
            }

        },
        quickPlay(query) {
            let self = this
            MusicKit.getInstance().api.search(query, {limit: 2, types: 'songs'}).then(function (data) {
                MusicKit.getInstance().setQueue({song: data["songs"]['data'][0]["id"], parameters : {l : app.mklang}}).then(function (queue) {
                    MusicKit.getInstance().play()
                    setTimeout(() => {
                        self.$forceUpdate()
                    }, 1000)
                })
            })
        },
        async getRating(item) {
            let type = item.type.slice(-1) === "s" ? item.type : item.type + "s"
            let id = item.attributes.playParams.catalogId ? item.attributes.playParams.catalogId : item.id
            if (item.id.startsWith("i.")) {
                if (!type.startsWith("library-")) {
                    type = "library-" + type
                }
                id = item.id
            }
            let response = await this.mk.api.v3.music(`/v1/me/ratings/${type}?platform=web&ids=${type.includes('library') ? item.id : id}`)
            if (response.data.data.length != 0) {
                let value = response.data.data[0].attributes.value
                return value
            } else {
                return 0
            }
        },
        love(item) {
            let type = item.type.slice(-1) === "s" ? item.type : item.type + "s"
            let id = item.attributes.playParams.catalogId ? item.attributes.playParams.catalogId : item.id
            if (item.id.startsWith("i.")) {
                if (!type.startsWith("library-")) {
                    type = "library-" + type
                }
                id = item.id
            }
            this.mk.api.v3.music(`/v1/me/ratings/${type}/${id}`, {}, {
                fetchOptions: {
                    method: "PUT",
                    body: JSON.stringify({
                        "type": "rating",
                        "attributes": {
                            "value": 1
                        }
                    })
                }
            })
        },
        dislike(item) {
            let type = item.type.slice(-1) === "s" ? item.type : item.type + "s"
            let id = item.attributes.playParams.catalogId ? item.attributes.playParams.catalogId : item.id
            if (item.id.startsWith("i.")) {
                if (!type.startsWith("library-")) {
                    type = "library-" + type
                }
                id = item.id
            }
            this.mk.api.v3.music(`/v1/me/ratings/${type}/${id}`, {}, {
                fetchOptions: {
                    method: "PUT",
                    body: JSON.stringify({
                        "type": "rating",
                        "attributes": {
                            "value": -1
                        }
                    })
                }
            })
        },
        unlove(item) {
            let type = item.type.slice(-1) === "s" ? item.type : item.type + "s"
            let id = item.attributes.playParams.catalogId ? item.attributes.playParams.catalogId : item.id
            if (item.id.startsWith("i.")) {
                if (!type.startsWith("library-")) {
                    type = "library-" + type
                }
                id = item.id
            }
            this.mk.api.v3.music(`/v1/me/ratings/${type}/${id}`, {}, {
                fetchOptions: {
                    method: "DELETE",
                }
            })
        },
        checkScrollDirectionIsUp(event) {
            if (event.wheelDelta) {
                return event.wheelDelta > 0;
            }
            return event.deltaY < 0;
        },
        volumeUp() {
            if ((app.mk.volume + app.cfg.audio.volumeStep) > 1) {
                app.mk.volume = app.cfg.audio.maxVolume;
                console.log('setting max volume')
            } else {
                console.log('volume up')
                app.mk.volume += app.cfg.audio.volumeStep;
            }
        },
        volumeDown() {
            if ((app.mk.volume - app.cfg.audio.volumeStep) < 0) {
                app.mk.volume = 0;
                console.log('setting volume to 0')
            } else {
                console.log('volume down')
                app.mk.volume -= app.cfg.audio.volumeStep;
            }
        },
        volumeWheel(event) {
            app.checkScrollDirectionIsUp(event) ? app.volumeUp() : app.volumeDown()
        },
        muteButtonPressed() {
            if (this.cfg.audio.muted) {
                this.mk.volume = this.cfg.audio.lastVolume;
                this.cfg.audio.muted = false;
            } else {
                this.cfg.audio.lastVolume = this.cfg.audio.volume;
                this.mk.volume = 0;
                this.cfg.audio.muted = true;
            }
        },
        checkMuteChange() {
            if (this.cfg.audio.muted) {
                this.cfg.audio.muted = false;
            }
        },
        async apiCall(url, callback) {
            const xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = (e) => {
                if (xmlHttp.readyState !== 4) {
                    return;
                }

                if (xmlHttp.status === 200) {
                    // console.log('SUCCESS', xmlHttp.responseText);
                    callback(JSON.parse(xmlHttp.responseText));
                } else {
                    console.warn('request_error');
                }
            };

            xmlHttp.open("GET", url);
            xmlHttp.setRequestHeader("Authorization", "Bearer " + MusicKit.getInstance().developerToken);
            xmlHttp.setRequestHeader("Music-User-Token", "" + MusicKit.getInstance().musicUserToken);
            xmlHttp.setRequestHeader("Accept", "application/json");
            xmlHttp.setRequestHeader("Content-Type", "application/json");
            xmlHttp.responseType = "text";
            xmlHttp.send();
        },
        fetchPlaylist(id, callback) {
            // id can be found in playlist.attributes.playParams.globalId
            // this.mk.api.
            this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/playlists/${id}`).then(res => {
                callback(res.data.data[0])
            })

            // tracks are found in relationship.data
        },
        windowFocus(val) {
            if (val) {
                document.querySelectorAll(".animated-artwork-video").forEach(el => {
                    el.play()
                })
                document.querySelector("body").classList.remove("stopanimation")
                this.animateBackground = true
            } else {
                document.querySelectorAll(".animated-artwork-video").forEach(el => {
                    el.pause()
                })
                document.querySelector("body").classList.add("stopanimation")
                this.animateBackground = false
            }
        },
        async nowPlayingContextMenu(event) {
            let self = this
            let data_type = this.mk.nowPlayingItem.playParams.kind
            let item_id = this.mk.nowPlayingItem.attributes.playParams.id ?? this.mk.nowPlayingItem.id
            let isLibrary = this.mk.nowPlayingItem.attributes.playParams.isLibrary ?? false
            let params = {"fields[songs]": "inLibrary", "fields[albums]": "inLibrary", "relate": "library", "t": "1"}
            app.selectedMediaItems = []
            app.select_selectMediaItem(item_id, data_type, 0, '12344', isLibrary)
            let useMenu = "normal"
            let menus = {
                multiple: {
                    items: []
                },
                normal: {
                    headerItems: [{
                        "icon": "./assets/feather/heart.svg",
                        "id": "love",
                        "name": app.getLz('action.love'),
                        "hidden": false,
                        "disabled": true,
                        "action": function () {
                            app.love(app.mk.nowPlayingItem)
                        }
                    },
                        {
                            "icon": "./assets/feather/heart.svg",
                            "id": "unlove",
                            "active": true,
                            "name": app.getLz('action.unlove'),
                            "hidden": true,
                            "action": function () {
                                app.unlove(app.mk.nowPlayingItem)
                            }
                        },
                        {
                            "icon": "./assets/feather/thumbs-down.svg",
                            "id": "dislike",
                            "name": app.getLz('action.dislike'),
                            "hidden": false,
                            "disabled": true,
                            "action": function () {
                                app.dislike(app.mk.nowPlayingItem)
                            }
                        },
                        {
                            "icon": "./assets/feather/thumbs-down.svg",
                            "id": "undo_dislike",
                            "name": app.getLz('action.undoDislike'),
                            "active": true,
                            "hidden": true,
                            "action": function () {
                                app.unlove(app.mk.nowPlayingItem)
                            }
                        },
                    ],
                    items: [{
                        "icon": "./assets/feather/list.svg",
                        "name": app.getLz('action.addToPlaylist') + " ...",
                        "action": function () {
                            app.promptAddToPlaylist()
                        }
                    },
                        {
                            "icon": "./assets/feather/plus.svg",
                            "id": "addToLibrary",
                            "name": app.getLz('action.addToLibrary') + " ...",
                            "disabled": false,
                            "action": function () {
                                app.addToLibrary(app.mk.nowPlayingItem.id);
                            }
                        },
                        {
                            "icon": "./assets/feather/radio.svg",
                            "name": app.getLz('action.startRadio'),
                            "action": function () {
                                app.mk.setStationQueue({song: app.mk.nowPlayingItem.id}).then(() => {
                                    app.mk.play()
                                    app.selectedMediaItems = []
                                })
                            }
                        },
                        {
                            "icon": "./assets/feather/share.svg",
                            "name": app.getLz('action.share'),
                            "action": function () {
                                app.mkapi(app.mk.nowPlayingItem.attributes?.playParams?.kind ?? app.mk.nowPlayingItem.type ?? 'songs', false, app.mk.nowPlayingItem._songId ?? (app.mk.nowPlayingItem.songId ?? app.mk.nowPlayingItem.id) ?? '').then(u => {
                                    app.copyToClipboard((u.data.data.length && u.data.data.length > 0) ? u.data.data[0].attributes.url : u.data.data.attributes.url)
                                })
                            }
                        },
                        {
                            "icon": "./assets/feather/share.svg",
                            "name": `${app.getLz('action.share')} (song.link)`,
                            "action": function () {
                                app.mkapi(app.mk.nowPlayingItem.attributes?.playParams?.kind ?? app.mk.nowPlayingItem.type ?? 'songs', false, app.mk.nowPlayingItem._songId ?? (app.mk.nowPlayingItem.songId ?? app.mk.nowPlayingItem.id) ?? '').then(u => {
                                    app.songLinkShare((u.data.data.length && u.data.data.length > 0) ? u.data.data[0].attributes.url : u.data.data.attributes.url)
                                })
                            }
                        }                        
                    ]
                }
            }
            if (this.contextExt) {
                if (this.contextExt.normal) {
                    menus.normal.items = menus.normal.items.concat(this.contextExt.normal)
                }
            }
            this.showMenuPanel(menus[useMenu], event)

            try {
                let rating = await app.getRating(app.mk.nowPlayingItem)
                if (rating == 0) {
                    menus.normal.headerItems.find(x => x.id == 'love').disabled = false
                    menus.normal.headerItems.find(x => x.id == 'dislike').disabled = false
                } else if (rating == 1) {
                    menus.normal.headerItems.find(x => x.id == 'unlove').hidden = false
                    menus.normal.headerItems.find(x => x.id == 'love').hidden = true
                } else if (rating == -1) {
                    menus.normal.headerItems.find(x => x.id == 'undo_dislike').hidden = false
                    menus.normal.headerItems.find(x => x.id == 'dislike').hidden = true
                }
            } catch (err) {

            }
        },
        LastFMDeauthorize() {
            ipcRenderer.invoke('setStoreValue', 'lastfm.enabled', false).catch((e) => console.error(e));
            ipcRenderer.invoke('setStoreValue', 'lastfm.auth_token', '').catch((e) => console.error(e));
            app.cfg.lastfm.auth_token = "";
            app.cfg.lastfm.enabled = false;
            const element = document.getElementById('lfmConnect');
            element.innerHTML = app.getLz('term.connect');
            element.onclick = app.LastFMAuthenticate;
        },
        LastFMAuthenticate() {
            console.log("[LastFM] Received LastFM authentication callback")
            const element = document.getElementById('lfmConnect');
            // new key : f9986d12aab5a0fe66193c559435ede3
            window.open('https://www.last.fm/api/auth?api_key=f9986d12aab5a0fe66193c559435ede3&cb=cider://auth/lastfm');
            element.innerText = app.getLz('term.connecting') + '...';

            /* Just a timeout for the button */
            setTimeout(() => {
                if (element.innerText === app.getLz('term.connecting') + '...') {
                    element.innerText = app.getLz('term.connect');
                    console.warn('[LastFM] Attempted connection timed out.');
                }
            }, 20000);

            ipcRenderer.on('LastfmAuthenticated', function (_event, lfmAuthKey) {
                app.cfg.lastfm.auth_token = lfmAuthKey;
                app.cfg.lastfm.enabled = true;
                element.innerHTML = `${app.getLz('term.disconnect')}\n<p style="font-size: 8px"><i>(${app.getLz('term.authed')}: ${lfmAuthKey})</i></p>`;
                element.onclick = app.LastFMDeauthorize;
            });
        },
        parseSCTagToRG: function (tag) {
            let soundcheck = tag.split(" ")
            let numbers = []
            for (item of soundcheck) {
                numbers.push(parseInt(item, 16))

            }
            numbers.shift()
            let gain = Math.log10((Math.max(numbers[0], numbers[1]) ?? 1000) / 1000.0) * -10
            let peak = Math.max(numbers[6], numbers[7]) / 32768.0
            return {
                gain: gain,
                peak: peak
            }
        },
        fullscreen(flag) {
            if (flag) {
                ipcRenderer.send('setFullScreen', true);
                if (app.mk.nowPlayingItem.type && app.mk.nowPlayingItem.type.toLowerCase().includes("video")) {
                    document.querySelector('video#apple-music-video-player').requestFullscreen()
                } else {
                    app.appMode = 'fullscreen';
                }
                document.addEventListener('keydown', event => {
                    if (event.key === 'Escape' && app.appMode === 'fullscreen') {
                        this.fullscreen(false);
                    }
                });
            } else {
                ipcRenderer.send('setFullScreen', false);
                app.appMode = 'player';
            }
        },
        miniPlayer(flag) {
            if (flag) {
                this.tmpWidth = window.innerWidth;
                this.tmpHeight = window.innerHeight;
                ipcRenderer.send('unmaximize');
                ipcRenderer.send('windowmin', 250, 250)
                ipcRenderer.send('windowresize', 300, 300, false)
                app.appMode = 'mini';
            } else {
                ipcRenderer.send('windowmin', 844, 410)
                ipcRenderer.send('windowresize', this.tmpWidth, this.tmpHeight, false)
                ipcRenderer.send('windowontop', false)
                this.cfg.visual.miniplayer_top_toggle = true;
                app.appMode = 'player';
            }
        },
        pinMiniPlayer() {
            if (this.cfg.visual.miniplayer_top_toggle) {
                ipcRenderer.send('windowontop', true)
                this.cfg.visual.miniplayer_top_toggle = false
            } else {
                ipcRenderer.send('windowontop', false)
                this.cfg.visual.miniplayer_top_toggle = true;
            }
        },
        formatTimezoneOffset: (e = new Date) => {
            let leadingZeros = (e, s = 2) => {
                let n = "" + e;
                for (; n.length < s;)
                    n = "0" + n;
                return n
            }

            const s = e.getTimezoneOffset(),
                n = Math.floor(Math.abs(s) / 60),
                d = Math.round(Math.abs(s) % 60);
            let h = "+";
            return 0 !== s && (h = s > 0 ? "-" : "+"),
                `${h}${leadingZeros(n, 2)}:${leadingZeros(d, 2)}`
        },
        toggleHideUserInfo() {
            if (this.chrome.hideUserInfo) {
                this.cfg.visual.showuserinfo = true
                this.chrome.hideUserInfo = false
            } else {
                this.cfg.visual.showuserinfo = false
                this.chrome.hideUserInfo = true
            }
        },
        isElementOverflowing(selector) {
            try {
                let element = document.querySelector(selector);
                var overflowX = element.offsetWidth < element.scrollWidth,
                    overflowY = element.offsetHeight < element.scrollHeight;
                element.setAttribute('data-value', '\xa0\xa0\xa0\xa0' + element.textContent);

                return (overflowX || overflowY);
            } catch (e) {
                return false
            }
        },
        async showWebRemoteQR() {
            //this.webremoteqr = await ipcRenderer.invoke('setRemoteQR','')
            this.webremoteurl = await ipcRenderer.invoke('showQR', '')
            //this.modals.qrcode = true;
        },
        checkMarquee() {
            if (isElementOverflowing('#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-artist') == true) {
                document.getElementsByClassName('song-artist')[0].classList.add('marquee');
                document.getElementsByClassName('song-artist')[1].classList.add('marquee-after');
            }
            if (isElementOverflowing('#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-name') == true) {
                document.getElementsByClassName('song-name')[0].classList.add('marquee');
                document.getElementsByClassName('song-name')[1].classList.add('marquee-after');
            }
        },
        closeWindow() {
            ipcRenderer.send('close');
        },
        checkForUpdate() {
            ipcRenderer.send('check-for-update')
        },
        darwinShare(url) {
            ipcRenderer.send('share-menu', url)
        },
        arrayToChunk(arr, chunkSize) {
            let R = [];
            for (let i = 0, len = arr.length; i < len; i += chunkSize) {
                R.push(arr.slice(i, i + chunkSize));
            }
            return R;
        },
        SpacePause() {       
            const elems = document.querySelectorAll('input');
            for (elem of elems){
                if (elem === document.activeElement) {
                    return;
                }
            }
            if (!this.isDev) // disable in dev mode to keep my sanity
            MusicKitInterop.playPause();
        },
        async MKJSLang(){
            let u = this.cfg.general.language;
            // use MusicKit.getInstance or crash
            try {
                item = await MusicKit.getInstance().api.v3.music(`v1/storefronts/${app.mk.storefrontId}`)
                let langcodes = item.data.data[0].attributes.supportedLanguageTags;
                if (langcodes) langcodes = langcodes.map(function (u) { return u.toLowerCase() })
                console.log(langcodes)
                let sellang = ""
                if (u && langcodes.includes(u.toLowerCase().replace('_', "-"))) {
                    sellang = ((u.toLowerCase()).replace('_', "-"))
                } else if (u && u.includes('_') && langcodes.includes(((u.toLowerCase()).replace('_', "-")).split("-")[0])) {
                    sellang = ((u.toLowerCase()).replace('_', "-")).split("-")[0]
                }
                if (sellang == "") sellang = (item.data.data[0].attributes.defaultLanguageTag).toLowerCase()
                console.log(sellang)
                return await sellang
            }
            catch (err) {
                console.log('locale err', err)
                let langcodes = ['af', 'sq', 'ar', 'eu', 'bg', 'be', 'ca', 'zh', 'zh-tw', 'zh-cn', 'zh-hk', 'zh-sg', 'hr', 'cs', 'da', 'nl', 'nl-be', 'en', 'en-us', 'en-eg', 'en-au', 'en-gb', 'en-ca', 'en-nz', 'en-ie', 'en-za', 'en-jm', 'en-bz', 'en-tt', 'en-001', 'et', 'fo', 'fa', 'fi', 'fr', 'fr-ca', 'gd', 'de', 'de-ch', 'el', 'he', 'hi', 'hu', 'is', 'id', 'it', 'ja', 'ko', 'lv', 'lt', 'mk', 'mt', 'no', 'nb', 'nn', 'pl', 'pt-br', 'pt', 'rm', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'es-mx', 'es-419', 'sv', 'th', 'ts', 'tn', 'tr', 'uk', 'ur', 've', 'vi', 'xh', 'yi', 'zu', 'ms', 'iw', 'lo', 'tl', 'kk', 'ta', 'te', 'bn', 'ga', 'ht', 'la', 'pa', 'sa'];
                let sellang = "en"
                if (u && langcodes.includes(u.toLowerCase().replace('_', "-"))) {
                    sellang = ((u.toLowerCase()).replace('_', "-"))
                } else if (u && u.includes('_') && langcodes.includes(((u.toLowerCase()).replace('_', "-")).split("-")[0])) {
                    sellang = ((u.toLowerCase()).replace('_', "-")).split("-")[0]
                }
                if (sellang.startsWith("en") && this.mk.storefrontId != "us") sellang = "en-gb"
                return await sellang
            }          
        }
    }
})

Vue.component('animated-number', {

    template: "<div style='display: inline-block;'>{{ displayNumber }}</div>",
    props: {'number': {default: 0}},

    data() {
        return {
            displayNumber: 0,
            interval: false
        }
    },

    ready() {
        this.displayNumber = this.number ? this.number : 0;
    },

    watch: {
        number() {
            clearInterval(this.interval);

            if (this.number == this.displayNumber) {
                return;
            }

            this.interval = window.setInterval(() => {
                if (this.displayNumber != this.number) {
                    var change = (this.number - this.displayNumber) / 10;
                    change = change >= 0 ? Math.ceil(change) : Math.floor(change);
                    this.displayNumber = this.displayNumber + change;
                }
            }, 20);
        }
    }
})

Vue.component('sidebar-library-item', {
    template: '#sidebar-library-item',
    props: {
        name: {
            type: String,
            required: true
        },
        page: {
            type: String,
            required: true
        },
        svgIcon: {
            type: String,
            required: false,
            default: ''
        },
        cdClick: {
            type: Function,
            required: false
        }
    },
    data: function () {
        return {
            app: app,
            svgIconData: ""
        }
    },
    async mounted() {
        if (this.svgIcon) {
            this.svgIconData = await this.app.getSvgIcon(this.svgIcon)
        }
    },
    methods: {}
});

// Key binds
document.addEventListener('keydown', function (e) {
    if (e.keyCode === 70 && e.ctrlKey) {
        app.$refs.searchInput.focus()
        app.$refs.searchInput.select()
    }
});

// Hang Timer
app.hangtimer = setTimeout(() => {
    if (confirm("Cider is not responding. Reload the app?")) {
        window.location.reload()
    }
}, 10000)

// add event listener for when window.location.hash changes
window.addEventListener("hashchange", function () {
    app.appRoute(window.location.hash)
});


function fallbackinitMusicKit() {
    const request = new XMLHttpRequest();

    function loadAlternateKey() {
        let parsedJson = JSON.parse(this.responseText)
        MusicKit.configure({
            developerToken: parsedJson.developerToken,
            app: {
                name: 'Apple Music',
                build: '1978.4.1',
                version: "1.0"
            },
            sourceType: 24,
            suppressErrorDialog: true
        });
        setTimeout(() => {
            app.init()
        }, 1000)
    }

    request.addEventListener("load", loadAlternateKey);
    request.open("GET", "https://raw.githubusercontent.com/lujjjh/LitoMusic/main/token.json");
    request.send();
}

document.addEventListener('musickitloaded', function () {
    // MusicKit global is now defined
    function initMusicKit() {
        let parsedJson = JSON.parse(this.responseText)
        MusicKit.configure({
            developerToken: parsedJson.token,
            app: {
                name: 'Apple Music',
                build: '1978.4.1',
                version: "1.0"
            },
            sourceType: 24,
            suppressErrorDialog: true
        });
        setTimeout(() => {
            app.init()
        }, 1000)
    }


    const request = new XMLHttpRequest();
    request.timeout = 5000;
    request.addEventListener("load", initMusicKit);
    request.onreadystatechange = function (aEvt) {
        if (request.readyState == 4) {
            if (request.status != 200)
                fallbackinitMusicKit()
        }
    };
    request.open("GET", "https://api.cider.sh/v1/");
    request.send();

    // check for widevine failure and reconfigure the instance.
    window.addEventListener("drmUnsupported", function () {
        initMusicKit()
    });
});

if ('serviceWorker' in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js?v=1');
    });
}

const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
        }
    });
}

function Clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function refreshFocus() {
    if (document.hasFocus() == false) {
        app.windowFocus(false)
    } else {
        app.windowFocus(true)
    }
    setTimeout(refreshFocus, 200);
}

app.getHTMLStyle()

refreshFocus();

function xmlToJson(xml) {

    // Create the return object
    let obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                let attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    console.log(obj);
    return obj;
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

var checkIfScrollIsStatic = setInterval(() => {
    try {
        if (position === document.getElementsByClassName('lyric-body')[0].scrollTop) {
            clearInterval(checkIfScrollIsStatic)
            // do something
        }
        position = document.getElementsByClassName('lyric-body')[0].scrollTop
    } catch (e) {
    }

}, 50);

// WebGPU Console Notification
async function webGPU() {
    try {
        const currentGPU = await navigator.gpu.requestAdapter()
        console.log("WebGPU enabled on", currentGPU.name, "with feature ID", currentGPU.features.size)
    } catch (e) {
        console.log("WebGPU disabled / WebGPU initialization failed")
    }
}

webGPU().then()

let screenWidth = screen.width;
let screenHeight = screen.height;

// Key bind to unjam MusicKit in case it fails: CTRL+F10
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.keyCode == 121) {
        try {
            app.mk._services.mediaItemPlayback._currentPlayer.stop()
        } catch (e) {
        }
        try {
            app.mk._services.mediaItemPlayback._currentPlayer.destroy()
        } catch (e) {
        }
    }
});

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.keyCode == 122) {
        try {
            ipcRenderer.send('detachDT', '')
        } catch (e) {
        }
    }
});
