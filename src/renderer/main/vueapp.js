import { store } from './vuex-store.js';

Vue.use(VueHorizontal);
Vue.use(VueObserveVisibility);
Vue.use(BootstrapVue)
/* @namespace */
const app = new Vue({
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
        pluginInstalled: false,
        pluginMenuEntries: [],
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
        fullscreenState: ipcRenderer.sendSync("getFullScreen"),
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
            personal: {},
            recent: {},
            amlive: {},
        },
        mklang: 'en',
        webview: {
            url: "",
            title: "",
            loading: false
        },
        showingPlaylist: [],
        appleCurator: [],
        multiroom: [],
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
                meta: { total: 0, progress: 0 },
                search: "",
                displayListing: [],
                downloadState: 0 // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
            },
            albums: {
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
                meta: { total: 0, progress: 0 },
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
                meta: { total: 0, progress: 0 },
                search: "",
                displayListing: [],
                downloadState: 0 // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
            },
        },
        playlists: {
            listing: [],
            details: {},
            loadingState: 0, // 0 loading, 1 loaded, 2 error
            id: "",
            trackMapping: {}
        },
        webremoteurl: "",
        webremoteqr: "",
        mxmtoken: "",
        mkIsReady: false,
        playerReady: false,
        animateBackground: false,
        currentArtUrl: '',
        currentArtUrlRaw: '',
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
        tmpX: '',
        tmpY: '',
        miniTmpX: '',
        miniTmpY: '',
        tmpVar: [],
        notification: false,
        chrome: {
            sidebarCollapsed: false,
            nativeControls: false,
            contentScrollPosY: 0,
            appliedTheme: {
                location: "",
                info: {}
            },
            desiredPageTransition: "wpfade_transform",
            hideUserInfo: ipcRenderer.sendSync("is-dev") || false,
            artworkReady: false,
            userinfo: {
                "id": "",
                "attributes": {
                    "name": "Cider User",
                    "handle": "CiderUser",
                    "artwork": { "url": "./assets/logocut.png" }
                }
            },
            forceDirectives: {

            },
            menuOpened: false,
            maximized: false,
            drawerOpened: false,
            drawerState: "queue",
            topChromeVisible: true,
            progresshover: false,
            windowControlPosition: "right",
            contentAreaScrolling: true,
            showCursor: false
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
            pluginMenu: false,
            audioControls: false,
            audioPlaybackRate: false,
            showPlaylist: false,
            castMenu: false,
            moreInfo: false,
            airplayPW: false,
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
        },
        pauseButtonTimer: null,
        activeCasts: [],
        pluginPages: {
            page: "hello-world",
            pages: [],
        },
        moreinfodata: [],
        notyf: notyf,
        idleTimer : null,
        idleState : false,
    },
    watch: {
        cfg: {
            handler: function (val, oldVal) {
                console.debug(`Config changed: ${JSON.stringify(val)}`);
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
        }
    },
    mounted() {
        window.addEventListener("hashchange", function (event) {
            let currentPath = window.location.hash.slice(1);
            console.debug("hashchange", currentPath);
        }, false)
    },
    methods: {
        setTimeout(func, time) {
            return setTimeout(func, time);
        },
        songLinkShare(amUrl) {
            notyf.open({ type: "info", className: "notyf-info", message: app.getLz('term.song.link.generate') })
            let self = this
            let httpRequest = new XMLHttpRequest();
            httpRequest.open('GET', `https://api.song.link/v1-alpha.1/links?url=${amUrl}&userCountry=US`, true);
            httpRequest.send();
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        let response = JSON.parse(httpRequest.responseText);
                        console.debug(response);
                        self.copyToClipboard(response.pageUrl)
                    } else {
                        console.warn('There was a problem with the request.');
                        notyf.error(app.getLz('term.requestError'))
                    }
                }
            }
        },
        formatVolumeTooltip() {
            return this.cfg.audio.dBSPL ? (Number(this.cfg.audio.dBSPLcalibration) + (Math.log10(this.mk.volume) * 20)).toFixed(2) + ' dB SPL' : (Math.log10(this.mk.volume) * 20).toFixed(2) + ' dBFS'
        },
        mainMenuVisibility(val) {
            if(this.chrome.sidebarCollapsed) {
                this.chrome.sidebarCollapsed = false
                return
            }
            if (val) {
                (this.mk.isAuthorized) ? this.chrome.menuOpened = !this.chrome.menuOpened : false;
                if (!this.mk.isAuthorized) {
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
            try {
                this.listennow.timestamp = 0;
                this.browsepage.timestamp = 0;
                this.radio.timestamp = 0;
            } catch (e) { }
        },
        /**
         * Grabs translation for localization.
         * @param {string} message - The key to grab the translated term
         * @param {object} options - Optional options
         * @author booploops#7139
         * @memberOf app
         */
        getLz(message, options = {}) {
            if (this.lz[message]) {
                if (options["count"]) {
                    if (typeof this.lz[message] === "object") {
                        let type = window.fastPluralRules.getPluralFormNameForCardinalByLocale(this.cfg.general.language.replace("_", "-"), options["count"]);
                        return this.lz[message][type] ?? ((this.lz[message])[Object.keys(this.lz[message])[0]] ?? this.lz[message])
                    } else {
                        // fallback English plural forms ( old i18n )
                        if (options["count"] > 1) {
                            return this.lz[message + "s"] ?? this.lz[message]
                        } else {
                            return this.lz[message] ?? this.lz[message + "s"]
                        }
                    }
                } else if (typeof this.lz[message] === "object") {
                    return (this.lz[message])[Object.keys(this.lz[message])[0]]
                }
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
                "artistName": app.getLz('term.sortBy.artist'),
                "name": app.getLz('term.sortBy.name'),
                "genre": app.getLz('term.sortBy.genre'),
                "releaseDate": app.getLz('term.sortBy.releaseDate')
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
            app.showCollection({ data: this.socialBadges.mediaItems }, "Friends Listening To", "albums")
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
        saveFile(fileName, urlFile) {
            let a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            a.href = urlFile;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
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
            this.chrome.desiredPageTransition = "wpfade_transform_backwards"
            return new Promise((resolve, reject) => {
                history.back()
                setTimeout(() => {


                    resolve(this.chrome.desiredPageTransition = "wpfade_transform")
                }, 100)
            })
        },
        goToGrouping(url = "https://music.apple.com/WebObjects/MZStore.woa/wa/viewGrouping?cc=us&id=34") {
            const id = url.split("id=")[1];
            window.location.hash = `#groupings/${id}`
        },
        navigateForward() {
            history.forward()
        },
        getHTMLStyle() {
            if (app.cfg.visual.uiScale != 1) {
                document.querySelector("#app").style.zoom = app.cfg.visual.uiScale
            } else {
                document.querySelector("#app").style.zoom = ""
            }
        },
        resetState() {
            this.menuPanel.visible = false;
            app.selectedMediaItems = [];
            this.chrome.contentAreaScrolling = true
            for (let key in app.modals) {
                app.modals[key] = false;
            }
        },
        resumeTabs() {
            if (app.cfg.general.resumeTabs.tab == "dynamic") {
                this.appRoute(app.cfg.general.resumeTabs.dynamicData)
            } else {
                this.appRoute(app.cfg.general.resumeTabs.tab)
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
                        return { id: i.id, type: i.type }
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
                        return { id: i.id, type: i.type }
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
                        return { id: i.id, type: i.type }
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
                        return { id: i.id, type: i.type }
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
                    this.getPlaylistFromID(this.showingPlaylist.id, true)
                }
            })
        },
        async init() {
            let self = this

            if (this.cfg.visual.styles.length != 0) {
                await this.reloadStyles()
            }

            if (this.platform == "darwin") {
                this.chrome.windowControlPosition = "left"
            }

            if (this.cfg.visual.nativeTitleBar) {
                this.chrome.nativeControls = true
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
                this.mk.privateEnabled = this.cfg.general.privateEnabled
            }
            if (this.cfg.visual.hw_acceleration == "disabled") {
                document.body.classList.add("no-gpu")
            }
            this.mk._services.timing.mode = 0
            this.platform = this.cfg.main.PLATFORM

            this.mklang = await this.MKJSLang()

            try {
                // Set profile name
                this.chrome.userinfo = (await app.mk.api.v3.music(`/v1/me/social-profile`)).data.data[0]
                // check if this.chrome.userinfo.attributes.artwork exists
                if (this.chrome.userinfo.attributes.artwork && !this.chrome.hideUserInfo) {
                    document.documentElement.style
                        .setProperty('--cvar-userprofileimg', `url("${this.getMediaItemArtwork(this.chrome.userinfo.attributes.artwork.url)}")`);
                }
            } catch (err) {
            }

            this.mk._bag.features['seamless-audio-transitions'] = this.cfg.audio.seamless_audio
            this.mk._bag.features["broadcast-radio"] = true
            this.mk._services.apiManager.store.storekit._restrictedEnabled = false
            // API Fallback
            if (!this.chrome.userinfo) {
                this.chrome.userinfo = {
                    "id": "",
                    "attributes": {
                        "name": "Cider User",
                        "handle": "CiderUser",
                        "artwork": { "url": "./assets/logocut.png" }
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
            let librarySongs = await CiderCache.getCache("library-songs")
            let libraryAlbums = await CiderCache.getCache("library-albums")
            if (librarySongs) {
                this.library.songs.listing = librarySongs
                this.library.songs.displayListing = this.library.songs.listing
            }
            if (libraryAlbums) {
                this.library.albums.listing = libraryAlbums
                this.library.albums.displayListing = this.library.albums.listing
            }


            if (typeof MusicKit.PlaybackBitrate[app.cfg.audio.quality] !== "string") {
                app.mk.bitrate = MusicKit.PlaybackBitrate[app.cfg.audio.quality]
            } else {
                app.mk.bitrate = 256
                app.cfg.audio.quality = "HIGH"
            }

            switch (this.cfg.general.resumeOnStartupBehavior) {
                default:
                case "local":
                    // load last played track
                    try {
                        let lastItem = window.localStorage.getItem("currentTrack")
                        let time = window.localStorage.getItem("currentTime")
                        let queue = window.localStorage.getItem("currentQueue")
                        app.mk.queue.position = 0; // Reset queue position.
                        if (lastItem != null) {
                            lastItem = JSON.parse(lastItem)
                            let kind = lastItem.attributes.playParams.kind;
                            let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
                            app.mk.setQueue({
                                [truekind]: [lastItem.attributes.playParams.id],
                                parameters: { l: app.mklang }
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
                                                let ids = queue.map(e => (e.playParams ? e.playParams.id : (e.item.attributes.playParams ? e.item.attributes.playParams.id : '')))
                                                let i = 0;
                                                if (ids.length > 0) {
                                                    for (let id of ids) {
                                                        if (!(i == 0 && ids[0] == lastItem.attributes.playParams.id)) {
                                                            try {
                                                                app.mk.playLater({ songs: [id] })
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
                    break;
                case "history":
                    let history = await app.mk.api.v3.music(`/v1/me/recent/played/tracks`, { l: app.mklang })
                    if (history.data.data.length > 0) {
                        let lastItem = history.data.data[0]
                        let kind = lastItem.attributes.playParams.kind;
                        let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
                        app.mk.setQueue({
                            [truekind]: [lastItem.attributes.playParams.id],
                            parameters: { l: app.mklang }
                        })
                        app.mk.mute()
                        setTimeout(() => {
                            app.mk.play().then(() => {
                                app.mk.pause().then(() => {
                                    app.mk.unmute()
                                })
                            })
                        }, 1500)
                    }

                    break;
                case "disabled":

                    break;
            }

            MusicKit.getInstance().videoContainerElement = document.getElementById("apple-music-video-player")

            ipcRenderer.on('theme-update', async (event, arg) => {
                await less.refresh(true, true, true)
                self.setTheme(self.cfg.visual.theme, true)
                if (app.cfg.visual.styles.length != 0) {
                    app.reloadStyles()
                }
            })

            ipcRenderer.on('SoundCheckTag', (event, tag) => {
                // let replaygain = self.parseSCTagToRG(tag)
                try {
                    if (app.mk.nowPlayingItem.type !== 'song') {
                        CiderAudio.audioNodes.gainNode.gain.value = 0.70794578438;
                    }
                    else {
                        let soundcheck = tag.split(" ")
                        let numbers = []
                        for (let item of soundcheck) {
                            numbers.push(parseInt(item, 16))

                        }
                        numbers.shift()
                        let peak = Math.max(numbers[6], numbers[7]) / 32768.0
                        let gain = Math.pow(10, ((-1.3 - (Math.log10(peak) * 20)) / 20))// EBU R 128 Compliant
                        console.debug(`[Cider][MaikiwiSoundCheck] Peak Gain: '${(Math.log10(peak) * 20).toFixed(2)}' dB | Adjusting '${(Math.log10(gain) * 20).toFixed(2)}' dB`)
                        try {
                            //CiderAudio.audioNodes.gainNode.gain.value = (Math.min(Math.pow(10, (replaygain.gain / 20)), (1 / replaygain.peak)))
                            CiderAudio.audioNodes.gainNode.gain.value = gain
                        } catch (e) { }
                    }
                } catch (e) { 
                    try { ipcRenderer.send('SoundCheckTag', event, tag); } 
                    catch (e) { 
                        try {ipcRenderer.send('SoundCheckTag', event, tag);} 
                        catch (e) {console.log("[Cider][MaikiwiSoundCheck] Error [Gave up after 3 consecutive attempts]: " + e)}
                    }
                } // brute force until it works
            })

            ipcRenderer.on('play', function (_event, mode, id) {
                if (mode !== 'url') {
                    self.mk.setQueue({ [mode]: id, parameters: { l: self.mklang } }).then(() => {
                        app.mk.play()
                    })

                } else {
                    app.openAppleMusicURL(id)
                }
            });

            this.mk.addEventListener(MusicKit.Events.playbackStateDidChange, (event) => {
                ipcRenderer.send('wsapi-updatePlaybackState', wsapi.getAttributes());
                document.body.setAttribute("playback-state", event.state == 2 ? "playing" : "paused")
            })

            this.mk.addEventListener(MusicKit.Events.playbackTimeDidChange, (a) => {
                self.lyriccurrenttime = self.mk.currentPlaybackTime
                this.currentSongInfo = a
                self.playerLCD.playbackDuration = (self.mk.currentPlaybackTime)
                // wsapi
                ipcRenderer.send('wsapi-updatePlaybackState', wsapi.getAttributes());
            })

            this.mk.addEventListener(MusicKit.Events.queueItemsDidChange, ()=>{
                if (self.$refs.queue) {
                    setTimeout(()=>{
                        self.$refs.queue.updateQueue();
                    }, 100)
                }
            })

            this.mk.addEventListener(MusicKit.Events.nowPlayingItemDidChange, (a) => {
                if (self.$refs.queue) {
                    self.$refs.queue.updateQueue();
                }
                this.currentSongInfo = a
                
                try { 
                    if (app.mk.nowPlayingItem.flavor.includes("64")) {
                        if (localStorage.getItem("playingBitrate") !== "64") {
                            localStorage.setItem("playingBitrate", "64")
                            CiderAudio.hierarchical_loading();
                        }
                    }
                    else if (app.mk.nowPlayingItem.flavor.includes("256")) { 
                        if (localStorage.getItem("playingBitrate") !== "256") {
                            localStorage.setItem("playingBitrate", "256")
                            CiderAudio.hierarchical_loading();
                        }
                    }
                    else {
                        localStorage.setItem("playingBitrate", "256")
                        CiderAudio.hierarchical_loading();
                    }
                } catch(e) {
                    localStorage.setItem("playingBitrate", "256")
                    CiderAudio.hierarchical_loading();
                }
                
                if (app.cfg.audio.normalization) {
                    // get unencrypted audio previews to get SoundCheck's normalization tag
                    try {
                        let previewURL = null
                        try {
                            previewURL = app.mk.nowPlayingItem.previewURL
                        } catch (e) {
                        }
                        if (previewURL == null && ((app.mk.nowPlayingItem?._songId ?? (app.mk.nowPlayingItem["songId"] ?? app.mk.nowPlayingItem.relationships.catalog.data[0].id)) != -1)) {
                            app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/songs/${app.mk.nowPlayingItem?._songId ?? (app.mk.nowPlayingItem["songId"] ?? app.mk.nowPlayingItem.relationships.catalog.data[0].id)}`).then((response) => {
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

                if (type.includes("musicVideo") || type.includes("uploadedVideo") || type.includes("music-movie") || (self.mk.nowPlayingItem?.type == "radioStation" & self.mk.nowPlayingItem?.attributes?.mediaKind == "video")) {
                    document.getElementById("apple-music-video-container").style.display = "block";
                    document.body.setAttribute("video-playing", "true")
                    // app.chrome.topChromeVisible = false
                } else {
                    document.body.removeAttribute("video-playing")
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

                // Playback Notifications
                if (this.cfg.general.playbackNotifications && !document.hasFocus() && a.artistName && a.artwork && a.name) {
                    if (this.notification) {
                        this.notification.close()
                    }
                    this.notification = new Notification(a.name, {
                        body: `${a.artistName} — ${a.albumName}`,
                        icon: a.artwork.url.replace('/{w}x{h}bb', '/512x512bb').replace('/2000x2000bb', '/35x35bb'),
                        silent: true,
                    });
                }
                setTimeout(() => {
                    let i = (document.querySelector('#apple-music-player')?.src ?? "")
                    if (i.endsWith(".m3u8") || i.endsWith(".m3u")){
                        this._playRadioStream(i)
                    }
                }, 1500)
            })


            this.mk.addEventListener(MusicKit.Events.playbackVolumeDidChange, (_a) => {
                this.cfg.audio.volume = this.mk.volume
            })

            this.refreshPlaylists(this.isDev)
            document.body.removeAttribute("loading")
            if (window.location.hash != "") {
                this.appRoute(window.location.hash)
            }

            if(this.page != "home") {
                this.resumeTabs()
            }
            this.mediaKeyFixes()

            setTimeout(() => {
                this.getSocialBadges()
                this.getBrowsePage();
                this.$forceUpdate()
            }, 500)
            document.querySelector('#apple-music-video-player-controls').addEventListener('mousemove', () => {
                    this.showFoo('.music-player-info',2000);
            })
            ipcRenderer.invoke("renderer-ready", true)
            document.querySelector("#LOADER").remove()
            if (this.cfg.general.themeUpdateNotification && !this.isDev) {
                this.checkForThemeUpdates()
            }
        },
        showFoo(querySelector,time) {
            clearTimeout(this.idleTimer);
            if (this.idleState == true) {
                document.querySelector(querySelector).classList.remove("inactive");
            }
            this.idleState = false;
            this.idleTimer = setTimeout(() => {
                document.querySelector(querySelector).classList.add("inactive");
                this.idleState = true;
            }, time);
        },
        setContentScrollPos(scroll) {
            this.chrome.contentScrollPosY = scroll.target.scrollTop
        },
        async checkForThemeUpdates() {
            let self = this
            const themes = ipcRenderer.sendSync("get-themes")
            await asyncForEach(themes, async (theme) => {
                if (theme.commit != "") {
                    await fetch(`https://api.github.com/repos/${theme.github_repo}/commits`)
                        .then(res => res.json())
                        .then(res => {
                            if (res[0].sha != theme.commit) {
                                const notify = notyf.open({ className: "notyf-info", type: "info", message: `[Themes] ${theme.name} has an update available.` })
                                notify.on("click", () => {
                                    app.appRoute("themes-github")
                                    notyf.dismiss(notify)
                                })
                            }
                        })
                }
            })
        },
        async setTheme(theme = "", onlyPrefs = false) {
            console.debug(theme)
            if (this.cfg.visual.theme == "") {
                this.cfg.visual.theme = "default.less"
            }
            if (theme == "") {
                theme = this.cfg.visual.theme
            } else {
                this.cfg.visual.theme = ""
                this.cfg.visual.theme = theme
            }
            const info = {}
            try {
                const infoResponse = await fetch("themes/" + app.cfg.visual.theme.replace("index.less", "theme.json"))
                this.chrome.appliedTheme.info = await infoResponse.json()
            } catch (e) {
                e = null
                console.warn("failed to get theme.json")
                this.chrome.appliedTheme.info = {}
            }


            if (!onlyPrefs) {
                document.querySelector("#userTheme").href = `themes/${this.cfg.visual.theme}`
                document.querySelectorAll(`[id*='less']`).forEach(el => {
                    el.remove()
                });
                await less.refresh()
            }
        },
        async reloadStyles() {
            const styles = this.cfg.visual.styles
            document.querySelectorAll(`[id*='less']`).forEach(el => {
                if (el.id != "less:style") {
                    el.remove()
                }
            });

            this.chrome.appliedTheme.info = {}
            await asyncForEach(styles, async (style) => {
                let styleEl = document.createElement("link")
                styleEl.id = `less-${style.replace(".less", "")}`
                styleEl.rel = "stylesheet/less"
                styleEl.href = `themes/${style}`
                styleEl.type = "text/css"
                document.head.appendChild(styleEl)
                try {
                    let infoResponse = await fetch("themes/" + style.replace("index.less", "theme.json"))
                    this.chrome.appliedTheme.info = Object.assign(this.chrome.appliedTheme.info, await infoResponse.json())
                } catch (e) {
                    e = null
                    console.warn("failed to get theme.json")
                }
            })
            less.registerStylesheetsImmediately()
            await less.refresh(true, true, true)
            this.$forceUpdate()
            return
        },
        macOSEmu() {
            this.chrome.forceDirectives["macosemu"] = {
                value: true
            }
            this.chrome.windowControlPosition = "left"
        },
        getThemeDirective(directive = "") {
            let directives = {}
            if (typeof this.chrome.appliedTheme.info.directives == "object") {
                directives = this.chrome.appliedTheme.info.directives
            }
            directives = Object.assign(directives, this.chrome.forceDirectives)
            if (directives[directive]) {
                return directives[directive].value
            } else if (this.cfg.visual.directives[directive]) {
                return this.cfg.visual.directives[directive]
            } else {
                return ""
            }
        },
        unauthorize() {
            bootbox.confirm(app.getLz('term.confirmLogout'), function (result) {
                if (result) {
                    app.mk.unauthorize()
                    document.location.reload()
                }
            });
        },
        getAppClasses() {
            let classes = {}
            if (this.cfg.advanced.experiments.includes('compactui')) {
                classes.compact = true
            }
            if (this.cfg.visual.window_background_style == "none") {
                classes.simplebg = true
            }

            if (this.platform !== "darwin") {
                switch (parseInt(this.cfg.visual.windowControlPosition)) {
                    default:
                    case 0:
                        this.chrome.windowControlPosition = "right"
                        this.chrome.forceDirectives["macosemu"] = {
                            value: false
                        }
                        break;
                    case 1:
                        this.chrome.windowControlPosition = "left"
                        this.chrome.forceDirectives["macosemu"] = {
                            value: true
                        }
                        break;
                }
            }

            if (this.getThemeDirective('windowLayout') == 'twopanel') {
                classes.twopanel = true
            }
            if (this.getThemeDirective("appNavigation") == "seperate") {
                classes.navbar = true
            }
            if (this.getThemeDirective("macosemu") == true) {
                classes.macosemu = true
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
        async refreshPlaylists(localOnly = false, useCachedPlaylists = true) {
            let self = this
            let trackMap = this.cfg.advanced.playlistTrackMapping
            let newListing = []
            let trackMapping = {}
            
            if (useCachedPlaylists) {
                const cachedPlaylist = await CiderCache.getCache("library-playlists")
                const cachedTrackMapping = await CiderCache.getCache("library-playlists-tracks")

                if (cachedPlaylist) {
                    console.debug("using cached playlists")
                    this.playlists.listing = cachedPlaylist
                    self.sortPlaylists()
                } else {
                    console.debug("playlist has no cache")
                }

                if (cachedTrackMapping) {
                    console.debug("using cached track mapping")
                    this.playlists.trackMapping = cachedTrackMapping
                }
                if (localOnly) {
                    return
                }
            }

            this.library.backgroundNotification.message = "Building playlist cache..."
            this.library.backgroundNotification.show = true

            async function deepScan(parent = "p.playlistsroot") {
                console.debug(`scanning ${parent}`)
                // const playlistData = await app.mk.api.v3.music(`/v1/me/library/playlist-folders/${parent}/children/`)
                const playlistData = await MusicKitTools.v3Continuous({href: `/v1/me/library/playlist-folders/${parent}/children/`})
                console.log(playlistData)
                await asyncForEach(playlistData, async (playlist) => {
                    playlist.parent = parent
                    if (
                        playlist.type != "library-playlist-folders" &&
                        typeof playlist.attributes.playParams["versionHash"] != "undefined"
                    ) {
                        playlist.parent = "p.applemusic"
                    }
                    playlist.children = []
                    playlist.tracks = []
                    try {
                        if (trackMap) {
                            let tracks = await app.mk.api.v3.music(playlist.href + "/tracks").catch(e => {
                                // no tracks
                                e = null
                            })
                            tracks.data.data.forEach(track => {
                                if (!trackMapping[track.id]) {
                                    trackMapping[track.id] = []
                                }
                                trackMapping[track.id].push(playlist.id)

                                if (typeof track.attributes.playParams.catalogId == "string") {
                                    if (!trackMapping[track.attributes.playParams.catalogId]) {
                                        trackMapping[track.attributes.playParams.catalogId] = []
                                    }
                                    trackMapping[track.attributes.playParams.catalogId].push(playlist.id)
                                }
                            })
                        }
                    } catch (e) { }
                    if (playlist.type == "library-playlist-folders") {
                        try {
                            await deepScan(playlist.id).catch(e => { })
                        } catch (e) {

                        }
                    }
                    newListing.push(playlist)
                })
            }

            await deepScan()

            this.library.backgroundNotification.show = false
            this.playlists.listing = newListing
            self.sortPlaylists()
            if (trackMap) {
                CiderCache.putCache("library-playlists-tracks", trackMapping)
                this.playlists.trackMapping = trackMapping
            }
            CiderCache.putCache("library-playlists", newListing)
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
                        attributes: { name: name }
                    })
                }
            }
            ).then(res => {
                self.refreshPlaylists(false, false)
            })
        },
        async editPlaylist(id, name = app.getLz('term.newPlaylist')) {
            let self = this
            this.mk.api.v3.music(
                `/v1/me/library/playlists/${id}`, {}, {
                fetchOptions: {
                    method: "PATCH",
                    body: JSON.stringify({
                        attributes: { name: name }
                    })
                }
            }
            ).then(res => {
                self.refreshPlaylists(false, false)
            })
        },
        copyToClipboard(str) {
            // if (navigator.userAgent.includes('Darwin') || navigator.appVersion.indexOf("Mac") != -1) {
            // this.darwinShare(str)
            // } else {
            notyf.success(app.getLz('term.share.success'))
            navigator.clipboard.writeText(str).then(r => console.debug("Copied to clipboard."))
            // }
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
                        "attributes": { "name": name },
                        "relationships": {
                            "tracks": { "data": tracks },
                        }
                    })
                }
            }).then(res => {
                res = res.data.data[0]
                console.debug(res)
                self.appRoute(`playlist_` + res.id);
                self.showingPlaylist = [];
                self.getPlaylistFromID(app.page.substring(9), true)
                self.playlists.listing.push({
                    id: res.id,
                    attributes: {
                        name: name
                    },
                    parent: "p.playlistsroot"
                })
                self.sortPlaylists()
                setTimeout(() => {
                    app.refreshPlaylists(false, false)
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
                    setTimeout(() => {
                        app.refreshPlaylists(false, false);
                    }, 8000);
                })
            }
        },
        /** 
         * @param {string} url, href for the initial request
         * @memberof app
        */
        async showRoom(url) {
            let self = this
            const response = await this.mk.api.v3.music(url)
            let room = response.data.data[0]
            this.showCollection(room.relationships.contents, room.attributes.title)
        },
        async showCollection(response, title, type, requestBody = {}) {
            let self = this
            console.debug(response)
            this.collectionList.requestBody = {}
            this.collectionList.response = response
            this.collectionList.title = title
            this.collectionList.type = type
            this.collectionList.requestBody = requestBody
            app.appRoute("collection-list")
        },
        async showArtistView(artist, title, view) {
            let response = (await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists/${artist}/view/${view}?l=${this.mklang}`, {}, { includeResponseMeta: !0 })).data
            console.debug(response)
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
                l: this.mklang
            }
            let response = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/search?term=${term}`, requestBody, {
                includeResponseMeta: !0
            })

            console.debug('searchres', response)
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
            this.playlists.loadingState = (!transient) ? 0 : 1
            this.showingPlaylist = response
            if (!response.relationships?.tracks?.next) {
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
                l: this.mklang
            }
            if (!transient) {
                this.playlists.loadingState = 0;
            }
            app.mk.api.v3.music(`/v1/me/library/playlists/${id}`, params).then(res => {
                self.getPlaylistContinuous(res, transient)
            }).catch((e) => {
                console.debug(e);
                try {
                    app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/playlists/${id}`, params).then(res => {
                        self.getPlaylistContinuous(res, transient)
                    })
                } catch (err) {
                    console.debug(err)
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
                l: this.mklang
            }, { includeResponseMeta: !0 })
            console.debug(artistData.data.data[0])
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
                'background': ('linear-gradient(to right, var(--songProgressColor) 0%, var(--songProgressColor) ' + value + '%, var(--songProgressBackground) ' + value + '%, var(--songProgressBackground) 100%)')
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
                console.debug("has next")
                returnData.data.concat(response.data)
                returnData.meta = response.meta
                return await this.getRecursive(await response.next())
            } else {
                console.debug("no next")
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
        /**
         * Converts seconds to dd:hh:mm:ss / Days:Hours:Minutes:Seconds
         * @param {number} seconds
         * @param {string} format (short, long)
         * @returns {string}
         * @author Core#1034
         * @memberOf app
         */
        convertTime(seconds, format = "short") {

            if (isNaN(seconds) || seconds === Infinity) {
                seconds = 0
            }

            const datetime = new Date(seconds * 1000)

            if (format === "long") {
                const d = Math.floor(seconds / (3600 * 24));
                const h = Math.floor(seconds % (3600 * 24) / 3600);
                const m = Math.floor(seconds % 3600 / 60);
                const s = Math.floor(seconds % 60);

                const dDisplay = d > 0 ? `${d} ${app.getLz("term.time.day", { "count": d })}` : "";
                const hDisplay = h > 0 ? `${h} ${app.getLz("term.time.hour", { "count": h })}` : "";
                const mDisplay = m > 0 ? `${m} ${app.getLz("term.time.minute", { "count": m })}` : "";

                return dDisplay + (dDisplay && hDisplay ? ", " : "") + hDisplay + (hDisplay && mDisplay ? ", " : "") + mDisplay;
            }
            else {
                let returnTime = datetime.toISOString().substring(11, 19);

                const timeGates = {
                    600: 15, // 10 Minutes
                    3600: 14, // Hour
                    36000: 12, // 10 Hours
                }

                for (let key in timeGates) {
                    if (seconds < key) {
                        returnTime = datetime.toISOString().substring(timeGates[key], 19)
                        break
                    }
                }

                // Add the days on the front
                if (seconds >= 86400) {
                    returnTime = parseInt(datetime.toISOString().substring(8, 10)) - 1 + ":" + returnTime
                }

                return returnTime
            }
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
            if (route == "" || route == "#" || route == "/") {
                return;
            }
            route = route.replace(/#/g, "")
            if (app.cfg.general.resumeTabs.tab == "dynamic") {
                if (route == "home" || route == "listen_now" || route == "browse" || route == "radio" || route == "library-songs" || route == "library-albums" || route == "library-artists" || route == "library-videos" || route == "podcasts") {
                    app.cfg.general.resumeTabs.dynamicData = route
                } else {
                    app.cfg.general.resumeTabs.dynamicData = "home"
                }
            }
            // if the route contains does not include a / then route to the page directly
            if (route.indexOf("/") == -1) {
                this.page = route
                window.location.hash = this.page
                // if (this.page == "settings") {
                //     this.version
                // }
                return
            }
            let hash = route.split("/")
            let page = hash[0]
            let id = hash[1]
            let isLibrary = hash[2] ?? false
            if (page == "plugin") {
                this.pluginPages.page = "plugin." + id
                this.page = "plugin-renderer"
                return
            }
            this.routeView({
                kind: page,
                id: id,
                attributes: {
                    playParams: { kind: page, id: id, isLibrary: isLibrary }
                }
            })
        },
        routeView(item) {
            let kind = (item.attributes?.playParams ? (item.attributes?.playParams?.kind ?? (item.type ?? '')) : (item.type ?? ''));
            let id = (item.attributes?.playParams ? (item.attributes?.playParams?.id ?? (item.id ?? '')) : (item.id ?? ''));
            let isLibrary = item.attributes?.playParams ? (item.attributes?.playParams?.isLibrary ?? false) : false;
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
            } else if (kind == "editorial-elements" || kind == "editorial-items") {
                console.debug(item)
                if (item.relationships?.contents?.data != null && item.relationships?.contents?.data.length > 0) {
                    this.routeView(item.relationships.contents.data[0])
                } else if (item.attributes?.link?.url != null) {
                    if (item.attributes.link.url.includes("viewMultiRoom")) {
                        const params = new Proxy(new URLSearchParams(item.attributes.link.url), {
                            get: (searchParams, prop) => searchParams.get(prop),
                          });
                        id = params.fcId
                        app.getTypeFromID("multiroom", id, false, {
                            platform: "web",
                            extend: "editorialArtwork,uber,lockupStyle"
                        }).then(()=> {
                            kind = "multiroom"
                            window.location.hash = `${kind}/${id}`
                            document.querySelector("#app-content").scrollTop = 0
                        })
                        
                        return;
                    } else {
                    window.open(item.attributes.link.url)}
                }

            } else if (kind == "multirooms"){
                app.getTypeFromID("multiroom", id, false, {
                    platform: "web",
                    extend: "editorialArtwork,uber,lockupStyle"
                }).then(()=> {
                    kind = "multiroom"
                    window.location.hash = `${kind}/${id}`
                    document.querySelector("#app-content").scrollTop = 0
                })
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
                if (kind.includes("playlist")) {
                    params["include"] = "tracks";
                }
                if (kind.includes("album")) {
                    params["include[albums]"] = "artists"
                    params["fields[artists]"] = "name,url"
                    params["omit[resource]"] = "autos"
                    params["meta[albums:tracks]"] = 'popularity'
                    params["fields[albums]"] = "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialNotes,editorialVideo,name,playParams,releaseDate,url,copyright"
                }
                if (kind.includes("playlist") || kind.includes("album")){
                    app.page = (kind) + "_" + (id);
                    window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ''}`
                    app.getTypeFromID((kind), (id), (isLibrary), params);
                } else {
                    app.page = (kind)
                    window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ''}`
                }

                // app.getTypeFromID((kind), (id), (isLibrary), params);
            } else {
                app.playMediaItemById((id), (kind), (isLibrary), item.attributes.url ?? '')
            }
        },
        prevButton() {
            if (!app.prevButtonBackIndicator && app.mk.nowPlayingItem && app.mk.currentPlaybackTime > 2) {
                app.prevButtonBackIndicator = true;
                try {
                    clearTimeout(app.pauseButtonTimer)
                } catch (e) {
                }
                app.mk.seekToTime(0);
                app.pauseButtonTimer = setTimeout(() => {
                    app.prevButtonBackIndicator = false
                }, 3000);
            } else {
                try {
                    clearTimeout(app.pauseButtonTimer)
                } catch (e) {
                }
                app.prevButtonBackIndicator = false;
                app.skipToPreviousItem()
            }
        },
        isDisabled() {
            if(!app.mk.nowPlayingItem || app.mk.nowPlayingItem.attributes.playParams.kind == 'radioStation') {
                return true;
            }
            return false;
        },
        isPrevDisabled() {
            if(this.isDisabled()  || (app.mk.queue._position == 0 && app.mk.currentPlaybackTime <= 2)) {
                return true;
            }
            return false;
        },
        isNextDisabled() {
            if(this.isDisabled()  || app.mk.queue._position + 1 == app.mk.queue.length) {
                return true;
            }
            return false;
        },
        
        async getNowPlayingItemDetailed(target) {
            try {
                let u = await app.mkapi(app.mk.nowPlayingItem.playParams.kind,
                    (app.mk.nowPlayingItem.songId == -1),
                    (app.mk.nowPlayingItem.songId != -1) ? app.mk.nowPlayingItem.songId : app.mk.nowPlayingItem["id"],
                    { "include[songs]": "albums,artists", l: app.mklang });
                app.searchAndNavigate(u.data.data[0], target)
            } catch (e) {
                app.searchAndNavigate(app.mk.nowPlayingItem, target)
            }
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
                                console.debug(artistId)
                            }
                        } catch (e) {
                        }
                    }
                    console.debug(artistId);
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
                                console.debug(albumId)
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
                                console.debug(labelId)
                            }
                        } catch (e) {
                        }
                    }
                    if (labelId != "") {
                        app.showingPlaylist = []
                        await app.getTypeFromID("recordLabel", labelId, false, { views: 'top-releases,latest-releases,top-artists' });
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
        followArtistById(id, follow) {
            if (follow && !this.followingArtist(id)) {
                this.cfg.home.followedArtists.push(id)
            } else {
                let index = this.cfg.home.followedArtists.indexOf(id)
                if (index > -1) {
                    this.cfg.home.followedArtists.splice(index, 1)
                }
            }
        },
        followingArtist(id) {
            console.debug(`check for ${id}`)
            return this.cfg.home.followedArtists.includes(id)
        },
        playMediaItem(item) {
            let kind = (item.attributes.playParams ? (item.attributes.playParams.kind ?? (item.type ?? '')) : (item.type ?? ''));
            let id = (item.attributes.playParams ? (item.attributes.playParams.id ?? (item.id ?? '')) : (item.id ?? ''));
            ;
            let isLibrary = item.attributes.playParams ? (item.attributes.playParams.isLibrary ?? false) : false;
            let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
            // console.log(kind, id, isLibrary)
            app.mk.stop().then(() => {
                if (kind.includes("artist")) {
                    app.mk.setStationQueue({ artist: 'a-' + id }).then(() => {
                        app.mk.play()
                    })
                }
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
                console.debug(e);
                try {
                    a = await this.mkapi(kind.toString(), !isLibrary, id.toString(), params, params2);
                } catch (err) {
                    console.log(err);
                    a = []
                } finally {
                    if (kind == "appleCurator") {
                        app.appleCurator = a.data.data[0]
                    } else if (kind == "multiroom"){
                        app.multiroom = a.data.data[0]
                    } else {
                        this.getPlaylistContinuous(a, true)
                    }
                }
            } finally {
                if (kind == "appleCurator") {
                    app.appleCurator = a.data.data[0]
                } else if (kind == "multiroom"){
                    app.multiroom = a.data.data[0]
                } else {
                    this.getPlaylistContinuous(a, true)
                }
            }
            ;
        },
        searchLibrarySongs() {
            let self = this
            let prefs = this.cfg.libraryPrefs.songs
            let albumAdded = self.library?.albums?.listing?.map(function (i) {
                return { [i.id]: i.attributes?.dateAdded }
            })
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
                    if (prefs.sort == "dateAdded") {
                        let albumida = a.relationships?.albums?.data[0]?.id ?? '1970-01-01T00:01:01Z'
                        let albumidb = b.relationships?.albums?.data[0]?.id ?? '1970-01-01T00:01:01Z'
                        aa = startTime - new Date(((albumAdded.find(i => i[albumida])) ?? [])[albumida] ?? '1970-01-01T00:01:01Z').getTime()
                        bb = startTime - new Date(((albumAdded.find(i => i[albumidb])) ?? [])[albumidb] ?? '1970-01-01T00:01:01Z').getTime()
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
                    searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "")
                    itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "")
                    artistName = artistName.replace(/[^\p{L}\p{N} ]/gu, "")
                    albumName = albumName.replace(/[^\p{L}\p{N} ]/gu, "")

                    if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
                        return item
                    }
                })
                sortSongs()
            }
        },
        getAlbumSort() {
            this.library.albums.sortOrder[1] = this.cfg.libraryPrefs.albums.sortOrder;
            this.library.albums.sorting[1] = this.cfg.libraryPrefs.albums.sort;
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
                    searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "")
                    itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "")
                    artistName = artistName.replace(/[^\p{L}\p{N} ]/gu, "")
                    albumName = albumName.replace(/[^\p{L}\p{N} ]/gu, "")

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
                    searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "")
                    itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "")


                    if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
                        return item
                    }
                })
                sortArtists()
            }
        },
        focusSearch() {
            app.appRoute('search')
            const search = document.getElementsByClassName("search-input")
            if (search.length > 0) {
                search[0].focus()
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
                if (method.includes(`multiroom`)) {
                    return await this.mk.api.v3.music(`v1/editorial/${app.mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2)
                }
                else if (library) {
                    return await this.mk.api.v3.music(`v1/me/library/${truemethod}/${term.toString()}`, params, params2)
                } else {
                    return await this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2)
                }
            } catch (e) {
                console.debug(e)
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
            let cacheId = "library-songs"
            let downloaded = null;
            if ((this.library.songs.downloadState == 2) && !force) {
                return
            }
            if (this.library.songs.downloadState == 1) {
                return
            }
            let librarySongs = await CiderCache.getCache(cacheId)
            if (librarySongs) {
                this.library.songs.listing.data = librarySongs
                this.searchLibrarySongs()
            }
            if (this.songstest) {
                return
            }
            this.library.songs.downloadState = 1
            this.library.backgroundNotification.show = true
            this.library.backgroundNotification.message = app.getLz('notification.updatingLibrarySongs')

            library = await MusicKitTools.v3Continuous({
                href: `/v1/me/library/songs/`,
                options: {
                    "include[library-songs]": "catalog,artists,albums",
                    "fields[artists]": "name,url,id",
                    "fields[albums]": "name,url,id",
                    platform: "web",
                    "fields[catalog]": "artistUrl,albumUrl",
                    "fields[songs]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
                    limit: 100,
                    l: app.mklang,
                },
                onProgress: (data) => {
                    console.debug(`${data.total}/${data.response.data.meta.total}`)
                    self.library.backgroundNotification.show = true
                    self.library.backgroundNotification.message = app.getLz('notification.updatingLibrarySongs')
                    self.library.backgroundNotification.total = data.response.data.meta.total
                    self.library.backgroundNotification.progress = data.total
                },
                onSuccess: () => {

                }
            })

            self.library.songs.listing = library
            self.library.songs.downloadState = 2
            self.library.backgroundNotification.show = false
            self.searchLibrarySongs()
            CiderCache.putCache(cacheId, library)
            console.debug("Done!")

            return
        },
        // copy the getLibrarySongsFull function except change Songs to Albums
        async getLibraryAlbumsFull(force = false, index) {
            let self = this
            let library = []
            let cacheId = "library-albums"
            let downloaded = null;
            if ((this.library.albums.downloadState == 2 || this.library.albums.downloadState == 1) && !force) {
                return
            }
            let libraryAlbums = await CiderCache.getCache(cacheId)
            if (libraryAlbums) {
                this.library.albums.listing = libraryAlbums
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
                    // "fields[albums]": "name,url,id",
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
                        console.debug('safe loading');
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
                            console.debug('safe loading');
                            app.mk.api.v3.music(downloaded.next, safeparams).then((response) => {
                                processChunk(response.data)
                            }).catch((error) => {
                                console.log('safe loading failed', error);
                                app.library.albums.downloadState = 2
                                app.library.backgroundNotification.show = false
                            })
                        })
                    } else {
                        console.debug("Download next", downloaded.next)
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
                    console.debug("downloaded.next is undefined")
                    self.library.albums.listing = library
                    self.library.albums.downloadState = 2
                    self.library.backgroundNotification.show = false
                    CiderCache.putCache(cacheId, library)
                    self.searchLibraryAlbums(index)
                }
                if (downloaded.meta.total > library.length || typeof downloaded.meta.next != "undefined") {
                    console.debug(`downloading next chunk - ${library.length
                        } albums so far`)
                    downloadChunk()
                } else {
                    self.library.albums.listing = library
                    self.library.albums.downloadState = 2
                    self.library.backgroundNotification.show = false
                    CiderCache.putCache(cacheId, library)
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
            let cacheId = "library-artists"
            let downloaded = null;
            if ((this.library.artists.downloadState == 2 || this.library.artists.downloadState == 1) && !force) {
                return
            }
            let libraryArtists = await CiderCache.getCache(cacheId)
            if (libraryArtists) {
                this.library.artists.listing = libraryArtists
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
                        console.debug('safe loading');
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
                    CiderCache.putCache(cacheId, library)
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
                    CiderCache.putCache(cacheId, library)
                    self.searchLibraryArtists(index)
                    // console.log(library)
                }
            }

            downloadChunk()
        },
        /**
         * Gets the total duration in seconds of a playlist
         * @returns {string} Total tracks, and duration
         * @author Core#1034
         * @memberOf app
         */
        getTotalTime() {
            try {
                if (app.showingPlaylist.relationships.tracks.data.length === 0) return ""
                const timeInSeconds = Math.round([].concat(...app.showingPlaylist.relationships.tracks.data).reduce((a, { attributes: { durationInMillis } }) => a + durationInMillis, 0) / 1000);
                return `${app.showingPlaylist.relationships.tracks.data.length} ${app.getLz("term.track", { "count": app.showingPlaylist.relationships.tracks.data.length })}, ${app.convertTime(timeInSeconds, 'long')}`
            } catch (err) {
                return ""
            }
        },
        async getLibrarySongs() {
            let response = await this.mkapi("songs", true, "", { limit: 100, l: this.mklang }, { includeResponseMeta: !0 })
            this.library.songs.listing = response.data.data
            this.library.songs.meta = response.data.meta
        },
        async getLibraryAlbums() {
            let response = await this.mkapi("albums", true, "", { limit: 100, l: this.mklang }, { includeResponseMeta: !0 })
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
                console.debug(this.listennow)
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
                console.debug(this.browsepage)
            } catch (e) {
                console.log(e)
                this.getBrowsePage(attempt + 1)
            }
        },
        async getMadeForYou(attempt = 0) {
            if (attempt > 3) {
                return
            }
            try {
                let mfu = await app.mk.api.v3.music("/v1/me/library/playlists?platform=web&extend=editorialVideo&fields%5Bplaylists%5D=lastModifiedDate&filter%5Bfeatured%5D=made-for-you&include%5Blibrary-playlists%5D=catalog&fields%5Blibrary-playlists%5D=artwork%2Cname%2CplayParams%2CdateAdded")
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
                        attributes: { name: name }
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
                    app.refreshPlaylists(false, false)
                }, 13000)
            })
        },
        showSearch() {
            this.page = "search"
        },
        loadLyrics() {
            const musicType = (MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem["type"] ?? '' : '';
            // console.log("mt", musicType)
            if (musicType === "musicVideo") {
                this.loadYTLyrics();
            } else {
                // if (app.cfg.lyrics.enable_mxm) {
                this.loadMXM();
                // } else {
                //     this.loadAMLyrics();
                // }
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
                        let res = this.responseText;
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
                return Math.random().toString(36).replace(/[^a-z]+/g, '').slice(2, 10);
            }

            /* get token */
            function getToken(mode, track, artist, songid, lang, time, id) {
                if (attempt > 2) {
                    app.loadNeteaseLyrics();
                    // app.loadAMLyrics();
                } else {
                    attempt = attempt + 1;
                    let url = "https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0&t=" + revisedRandId();
                    let req = new XMLHttpRequest();
                    req.overrideMimeType("application/json");
                    req.open('GET', url, true);
                    req.setRequestHeader("authority", "apic-desktop.musixmatch.com");
                    req.onload = function () {
                        try {
                            let jsonResponse = JSON.parse(this.responseText);
                            let status2 = jsonResponse["message"]["header"]["status_code"];
                            if (status2 == 200) {
                                let token = jsonResponse["message"]["body"]["user_token"] ?? '';
                                if (token != "" && token != "UpgradeOnlyUpgradeOnlyUpgradeOnlyUpgradeOnly") {
                                    console.debug('200 token', mode);
                                    // token good
                                    app.mxmtoken = token;

                                    if (mode == 1) {
                                        getMXMSubs(track, artist, app.mxmtoken, lang, time, id);
                                    } else {
                                        getMXMTrans(songid, lang, app.mxmtoken);
                                    }
                                } else {
                                    console.debug('fake 200 token');
                                    getToken(mode, track, artist, songid, lang, time)
                                }
                            } else {
                                // console.log('token 4xx');
                                getToken(mode, track, artist, songid, lang, time)
                            }
                        } catch (e) {
                            console.log('error');
                            app.loadQQLyrics();
                            //app.loadAMLyrics();
                        }
                    };
                    req.onerror = function () {
                        console.log('error');
                        app.loadQQLyrics();
                        // app.loadAMLyrics();
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
                    try {
                        let jsonResponse = JSON.parse(this.responseText);
                        console.debug(jsonResponse);
                        let status1 = jsonResponse["message"]["header"]["status_code"];

                        if (status1 == 200) {
                            let id = '';
                            try {
                                if (jsonResponse["message"]["body"]["macro_calls"]["matcher.track.get"]["message"]["header"]["status_code"] == 200 && jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["header"]["status_code"] == 200) {
                                    id = jsonResponse["message"]["body"]["macro_calls"]["matcher.track.get"]["message"]["body"]["track"]["track_id"] ?? '';
                                    lrcfile = jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["body"]["subtitle_list"][0]["subtitle"]["subtitle_body"];

                                    try {
                                        let lrcrich = jsonResponse["message"]["body"]["macro_calls"]["track.richsync.get"]["message"]["body"]["richsync"]["richsync_body"];
                                        richsync = JSON.parse(lrcrich);
                                        app.richlyrics = richsync;
                                    } catch (_) {
                                    }
                                }

                                if (lrcfile == "") {
                                    app.loadQQLyrics();
                                    // app.loadAMLyrics()
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
                                        let preLrc = richsync.map(function (item) {
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
                                    if (lrcfile != null && lrcfile != '') {
                                        // load translation
                                        getMXMTrans(id, lang, token);
                                    } else {
                                        // app.loadAMLyrics()
                                        app.loadQQLyrics();
                                    }
                                }
                            } catch (e) {
                                console.log(e);
                                app.loadQQLyrics();
                                //  app.loadAMLyrics()
                            }
                        } else { //4xx rejected
                            getToken(1, track, artist, '', lang, time);
                        }
                    } catch (e) {
                        console.log(e);
                        app.loadQQLyrics();
                        //app.loadAMLyrics()
                    }
                }
                req.onerror = function () {
                    app.loadQQLyrics();
                    console.log('error');
                    // app.loadAMLyrics();
                };
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
                        try {
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
                        } catch (e) { }
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
        loadNeteaseLyrics() {
            const track = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.title ?? '' : '');
            const artist = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.artistName ?? '' : '');
            const time = encodeURIComponent((this.mk.nowPlayingItem != null) ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1);
            var url = `http://music.163.com/api/search/get/?csrf_token=hlpretag=&hlposttag=&s=${track + " " + artist}&type=1&offset=0&total=true&limit=6`;
            var req = new XMLHttpRequest();
            req.overrideMimeType("application/json");
            req.open('GET', url, true);
            req.onload = function () {
                try {
                    var jsonResponse = JSON.parse(req.responseText);
                    var id = jsonResponse["result"]["songs"][0]["id"];
                    var url2 = "https://music.163.com/api/song/lyric?os=pc&id=" + id + "&lv=-1&kv=-1&tv=-1";
                    var req2 = new XMLHttpRequest();
                    req2.overrideMimeType("application/json");
                    req2.open('GET', url2, true);
                    req2.onload = function () {
                        try {
                            var jsonResponse2 = JSON.parse(req2.responseText);
                            var lrcfile = jsonResponse2["lrc"]["lyric"];
                            app.lyricsMediaItem = lrcfile
                            let u = app.lyricsMediaItem.split(/[\n]/);
                            let preLrc = []
                            for (var i = u.length - 1; i >= 0; i--) {
                                let xline = (/(\[[0-9.:\[\]]*\])+(.*)/).exec(u[i])
                                if (xline != null) {
                                    let end = (preLrc.length > 0) ? ((preLrc[preLrc.length - 1].startTime) ?? 99999) : 99999
                                    preLrc.push({
                                        startTime: app.toMS(xline[1].substring(1, xline[1].length - 2)) ?? 0,
                                        endTime: end,
                                        line: xline[2],
                                        translation: ''
                                    })
                                }
                            }
                            if (preLrc.length > 0)
                                preLrc.push({
                                    startTime: 0,
                                    endTime: preLrc[preLrc.length - 1].startTime,
                                    line: "lrcInstrumental",
                                    translation: ''
                                });
                            app.lyrics = preLrc.reverse();
                        }
                        catch (e) {
                            app.lyrics = "";
                        }
                    };
                    req2.onerror = function () {

                    }
                    req2.send();
                } catch (e) {
                    app.lyrics = "";
                }
            };
            req.send();
            req.onerror = function () {

            }
        },
        loadQQLyrics() {
            if (!app.cfg.lyrics.enable_qq) return;
            const track = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.title ?? '' : '');
            const artist = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.artistName ?? '' : '');
            const time = encodeURIComponent((this.mk.nowPlayingItem != null) ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1);
            var url = `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?w=${track + " " + artist}&t=0&n=1&page=1&cr=1&new_json=1&format=json&platform=yqq.json`;

            var req = new XMLHttpRequest();
            req.overrideMimeType("application/json");
            req.open('GET', url, true);
            req.onload = function () {
                try {
                    var jsonResponse = JSON.parse(req.responseText);
                    let id = jsonResponse?.data?.song?.list[0]?.mid;
                    console.log(jsonResponse)
                    let usz = new Date().getTime()
                    var url2 = `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?-=MusicJsonCallback_lrc&songmid=${id}&pcachetime=${usz}&g_tk=5381&loginUin=3003436226&hostUin=0&inCharset=utf-8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0`;
                    var req2 = new XMLHttpRequest();
                    req2.overrideMimeType("application/json");
                    req2.open('GET', url2, true);
                    req2.onload = function () {
                        try {
                            function b64_to_utf8(str) {
                                return decodeURIComponent(escape(window.atob(str)));
                            }
                            const htmlDecode = (input) => {
                                const doc = new DOMParser().parseFromString(input, "text/html");
                                return doc.documentElement.textContent;
                            }
                            var jsonResponse2 = JSON.parse(req2.responseText.replace("MusicJsonCallback(", "").replace("})", "}"));
                            var lrcfile = htmlDecode(b64_to_utf8(jsonResponse2["lyric"]));
                            app.lyricsMediaItem = lrcfile
                            let u = app.lyricsMediaItem.split(/[\n]/);

                            let preLrc = []
                            for (var i = u.length - 1; i >= 0; i--) {
                                let xline = (/(\[[0-9.:\[\]]*\])+(.*)/).exec(u[i])
                                if (xline != null) {
                                    let end = (preLrc.length > 0) ? ((preLrc[preLrc.length - 1].startTime) ?? 99999) : 99999
                                    preLrc.push({
                                        startTime: app.toMS(xline[1].substring(1, xline[1].length - 2)) ?? 0,
                                        endTime: end,
                                        line: xline[2],
                                        translation: ''
                                    })
                                }
                            }
                            if (preLrc.length > 0)
                                preLrc.push({
                                    startTime: 0,
                                    endTime: preLrc[preLrc.length - 1].startTime,
                                    line: "lrcInstrumental",
                                    translation: ''
                                });
                            app.lyrics = preLrc.reverse();
                        }
                        catch (e) {
                            console.log(e)
                            app.loadNeteaseLyrics();
                            app.lyrics = "";
                        }
                    };
                    req2.onerror = function () {
                        app.loadNeteaseLyrics();
                    }
                    req2.send();
                } catch (e) {
                    console.log(e)
                    app.loadNeteaseLyrics();
                    app.lyrics = "";
                }
            }
            req.onerror = function () {
                app.loadNeteaseLyrics();
            }
            req.send();
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
                for (let element of lyricsLines) {
                    let start = this.toMS(element.getAttribute('begin'))
                    let end = this.toMS(element.getAttribute('end'))
                    if (start - endTimes[endTimes.length - 1] > 5 && endTimes[endTimes.length - 1] != 0) {
                        preLrc.push({
                            startTime: endTimes[endTimes.length - 1],
                            endTime: start,
                            line: "lrcInstrumental"
                        });
                    }
                    preLrc.push({ startTime: start, endTime: end, line: element.textContent });
                    endTimes.push(end);
                }
                // first line dot
                if (preLrc.length > 0)
                    preLrc.unshift({ startTime: 0, endTime: preLrc[0].startTime, line: "lrcInstrumental" });
            } else {
                for (let element of lyricsLines) {
                    preLrc.push({ startTime: 9999999, endTime: 9999999, line: element.textContent });
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
            console.debug(id, truekind, isLibrary)
            try {
                if (truekind.includes("artist")) {
                    app.mk.setStationQueue({ artist: 'a-' + id }).then(() => {
                        app.mk.play()
                    })
                } else if (truekind == "radioStations") {
                    this.mk.setStationQueue({ url: raurl }).then(function (queue) {
                        MusicKit.getInstance().play()
                    });
                } else {
                    this.mk.setQueue({
                        [truekind]: [id],
                        parameters: { l: this.mklang }
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
                                parameters: { l: app.mklang }
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
                            app.mk.queue.splice(0, app.mk.queue._itemIDs.length)
                            if (app.mk.shuffleMode == 1) {
                                shuffleArray(query)
                            }
                            app.mk.queue.append(query)
                            if (childIndex != -1) {
                                app.mk.changeToMediaAtIndex(childIndex)
                            } else {
                                app.mk.play()
                            }

                        }
                    })
                } else if (parent.startsWith('listitem-hr')) {
                    app.mk.stop().then(() => {
                        if (app.mk.shuffleMode == 1) {
                            app.mk.setQueue({
                                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id
                            }).then(function () {
                                app.mk.play().then(() => {
                                    let data = JSON.parse(parent.split('listitem-hr')[1] ?? '[]')
                                    let itemsToPlay = {}
                                    let u = data.map(x => x.id)
                                    try {
                                        data.splice(u.indexOf(item.attributes.playParams.id ?? item.id), 1)
                                    } catch (e) {
                                    }
                                    if (app.mk.shuffleMode == 1) {
                                        shuffleArray(data)
                                    }
                                    data.forEach(item => {
                                        if (!itemsToPlay[item.kind]) {
                                            itemsToPlay[item.kind] = []
                                        }
                                        itemsToPlay[item.kind].push(item.id)
                                    })
                                    // loop through itemsToPlay
                                    for (let kind in itemsToPlay) {
                                        let ids = itemsToPlay[kind]
                                        if (ids.length > 0) {
                                            app.mk.playLater({ [kind + "s"]: itemsToPlay[kind] })
                                        }
                                    }
                                })
                            })
                        } else {
                            let data = JSON.parse(parent.split('listitem-hr')[1] ?? '[]')
                            let itemsToPlay = {}
                            data.forEach(item => {
                                if (!itemsToPlay[item.kind]) {
                                    itemsToPlay[item.kind] = []
                                }
                                itemsToPlay[item.kind].push(item.id)
                            })
                            // loop through itemsToPlay
                            app.mk.queue.splice(0, app.mk.queue._itemIDs.length)
                            let ind = 0;
                            for (let kind in itemsToPlay) {
                                let ids = itemsToPlay[kind]
                                if (ids.length > 0) {
                                    if (app.mk.queue._itemIDs.length > 0) {
                                        app.mk.playLater({ [kind + "s"]: itemsToPlay[kind] }).then(function () {
                                            ind += 1;
                                            console.log(ind, Object.keys(itemsToPlay).length)
                                            if (ind >= Object.keys(itemsToPlay).length) {
                                                app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(item.attributes.playParams.id ?? item.id))
                                            }
                                        }
                                        )
                                    } else {
                                        app.mk.setQueue({ [kind + "s"]: itemsToPlay[kind] }).then(function () {
                                            ind += 1;
                                            console.log(ind, Object.keys(itemsToPlay).length)
                                            if (ind >= Object.keys(itemsToPlay).length) {
                                                app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(item.attributes.playParams.id ?? item.id))
                                            }
                                        }
                                        )
                                    }
                                }

                            }
                        }
                    })
                } else {
                    app.mk.stop().then(() => {
                        if (truekind == "playlists" && (id.startsWith("p.") || id.startsWith("pl.u"))) {
                            app.mk.setQueue({
                                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                                parameters: { l: app.mklang }
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
                                parameters: { l: this.mklang }
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
                "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url",
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
            }, { includeResponseMeta: !0 }).then(function (results) {
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
                let id = item.attributes.playParams.catalogId ?? item.attributes.playParams.id ?? item.id

                let index = types.findIndex(function (type) {
                    return type.type == this
                }, type)
                if (index == -1) {
                    types.push({ type: type, id: [id] })
                } else {
                    types[index].id.push(id)
                }
            }
            let types2 = types.map(function (item) {
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
            height = parseInt(height * window.devicePixelRatio)
            if (width) {
                width = parseInt(width * window.devicePixelRatio)
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
                let artworkSize = 50
                if (app.getThemeDirective("lcdArtworkSize") != "") {
                    artworkSize = app.getThemeDirective("lcdArtworkSize")
                } else if (this.cfg.visual.directives.windowLayout == "twopanel") {
                    artworkSize = 110
                }
                this.currentArtUrl = '';
                this.currentArtUrlRaw = '';
                if (app.mk.nowPlayingItem != null && app.mk.nowPlayingItem.attributes != null && app.mk.nowPlayingItem.attributes.artwork != null && app.mk.nowPlayingItem.attributes.artwork.url != null && app.mk.nowPlayingItem.attributes.artwork.url != '') {
                    this.currentArtUrlRaw = (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"] ?? '')
                    this.currentArtUrl = (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"] ?? '').replace('{w}', artworkSize).replace('{h}', artworkSize);
                    try {
                        document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', `url("${this.currentArtUrl}")`);
                    } catch (e) {
                    }
                } else {
                    let data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
                    data = data.data.data[0];
                    if (data != null && data !== "" && data.attributes != null && data.attributes.artwork != null) {
                        this.currentArtUrlRaw = (data["attributes"]["artwork"]["url"] ?? '')
                        this.currentArtUrl = (data["attributes"]["artwork"]["url"] ?? '').replace('{w}', artworkSize).replace('{h}', artworkSize);
                        ipcRenderer.send('updateRPCImage', this.currentArtUrl ?? '');
                        try {
                            document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', `url("${this.currentArtUrl}")`);
                        } catch (e) {
                        }
                    } else {
                        this.currentArtUrlRaw = ''
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
                let data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
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
                let data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
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
            MusicKit.getInstance().api.search(query, { limit: 2, types: 'songs' }).then(function (data) {
                MusicKit.getInstance().setQueue({
                    song: data["songs"]['data'][0]["id"],
                    parameters: { l: app.mklang }
                }).then(function (queue) {
                    MusicKit.getInstance().play()
                    setTimeout(() => {
                        self.$forceUpdate()
                    }, 1000)
                })
            })
        },
        async getRating(item) {
            let type = item.type.slice(-1) === "s" ? item.type : item.type + "s"
            let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id)
            if (item.id != null && (item.id.toString()).startsWith("i.")) {
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
            let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id)
            if (item.id != null && (item.id.toString()).startsWith("i.")) {
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
            let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id)
            if (item.id != null && (item.id.toString()).startsWith("i.")) {
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
            if ((app.mk.volume + app.cfg.audio.volumeStep) > app.cfg.audio.maxVolume) {
                app.mk.volume = app.cfg.audio.maxVolume;
            } else {
                app.mk.volume = (Math.floor((app.mk.volume * 100)) + (app.cfg.audio.volumeStep * 100)) / 100
            }
        },
        volumeDown() {
            if ((app.mk.volume - app.cfg.audio.volumeStep) < 0) {
                app.mk.volume = 0;
            } else {
                app.mk.volume = (Math.floor((app.mk.volume * 100)) - (app.cfg.audio.volumeStep * 100)) / 100
            }
        },
        volumeWheel(event) {
            app.checkScrollDirectionIsUp(event) ? this.volumeUp() : this.volumeDown()
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
        setAirPlayCodeUI() {
            this.modals.airplayPW = true
        },
        sendAirPlaySuccess(){
            notyf.success('Device paired successfully!');
        },
        sendAirPlayFailed(){
            notyf.error('Device paring failed!');
        },
        windowFocus(val) {
            if (val) {
                document.querySelectorAll(".animated-artwork-video").forEach(el => {
                    el.play()
                })
                document.querySelector("body").classList.remove("stopanimation")
                document.body.setAttribute("focus-state", "focused")
                this.animateBackground = true
            } else {
                document.querySelectorAll(".animated-artwork-video").forEach(el => {
                    el.pause()
                })
                document.querySelector("body").classList.add("stopanimation")
                document.body.setAttribute("focus-state", "blurred")
                this.animateBackground = false
            }
        },
        async nowPlayingContextMenu(event) {
            let self = this
            let data_type = this.mk.nowPlayingItem.playParams.kind
            let item_id = this.mk.nowPlayingItem.attributes.playParams.id ?? this.mk.nowPlayingItem.id
            let isLibrary = this.mk.nowPlayingItem.attributes.playParams.isLibrary ?? false
            let params = { "fields[songs]": "inLibrary", "fields[albums]": "inLibrary", "relate": "library", "t": "1" }
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
                    items: [
                        {
                            "icon": "./assets/feather/plus.svg",
                            "id": "addToLibrary",
                            "name": app.getLz('action.addToLibrary') + " ...",
                            "disabled": true,
                            "action": function () {
                                app.addToLibrary(app.mk.nowPlayingItem.id);
                            }
                        },
                        {
                            "id": "removeFromLibrary",
                            "icon": "./assets/feather/x-circle.svg",
                            "name": app.getLz('action.removeFromLibrary'),
                            "hidden": true,
                            "action": function () {
                                self.removeFromLibrary()
                            }
                        },
                        {
                            "icon": "./assets/feather/list.svg",
                            "name": app.getLz('action.addToPlaylist') + " ...",
                            "action": function () {
                                app.promptAddToPlaylist()
                            }
                        },
                        {
                            "icon": "./assets/feather/radio.svg",
                            "name": app.getLz('action.startRadio'),
                            "action": function () {
                                app.mk.setStationQueue({ song: app.mk.nowPlayingItem.id }).then(() => {
                                    app.mk.play()
                                    app.selectedMediaItems = []
                                })
                            }
                        },
                        {
                            "icon": "./assets/feather/user.svg",
                            "name": app.getLz('action.goToArtist'),
                            "action": function () {
                                app.appRoute(`artist/${app.mk.nowPlayingItem.relationships.artists.data[0].id}`)
                            }
                        },
                        {
                            "icon": "./assets/feather/disc.svg",
                            "name": app.getLz('action.goToAlbum'),
                            "action": function () {
                                app.appRoute(`album/${app.mk.nowPlayingItem.relationships.albums.data[0].id}`)
                            }
                        },
                        {
                            "id": "showInMusic",
                            "icon": "./assets/music.svg",
                            "hidden": true,
                            "name": app.getLz('action.showInAppleMusic'),
                            "action": function () {
                                app.routeView(app.mk.nowPlayingItem._container)
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
                        },
                        {
                            "id": "equalizer",
                            "icon": "../views/svg/speaker.svg",
                            "name": app.getLz('term.equalizer'),
                            "hidden": true,
                            "action": function () {
                                app.modals.equalizer = true
                                app.modals.audioSettings = false
                            }
                        },
                        {
                            "id": "audioLab",
                            "icon": "../views/svg/speaker.svg",
                            "name": app.getLz('settings.option.audio.audioLab'),
                            "hidden": true,
                            "action": function () {
                                app.appRoute('audiolabs')
                            }
                        },
                    ]
                }
            }
            if (this.cfg.advanced.AudioContext) {
                menus.normal.items.find(i => i.id === 'audioLab').hidden = false
                menus.normal.items.find(i => i.id === 'equalizer').hidden = false
            }
            if (this.contextExt) {
                if (this.contextExt.normal) {
                    menus.normal.items = menus.normal.items.concat(this.contextExt.normal)
                }
            }

            const nowPlayingContainer = app.mk.nowPlayingItem._container;
            if (nowPlayingContainer && nowPlayingContainer["attributes"] && nowPlayingContainer.name != "station") {
                menus.normal.items.find(x => x.id == "showInMusic").hidden = false
            }

            this.showMenuPanel(menus[useMenu], event)

            try {
                let result = await this.inLibrary([this.mk.nowPlayingItem])
                if (result[0].attributes.inLibrary) {
                    menus.normal.items.find(x => x.id == 'addToLibrary').hidden = true
                    menus.normal.items.find(x => x.id == 'removeFromLibrary').hidden = false
                } else {
                    menus.normal.items.find(x => x.id == 'addToLibrary').disabled = false
                }
            } catch (e) {
                e = null
            }

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
        fullscreen(flag) {
            this.fullscreenState = flag; 
            if (flag) {
                ipcRenderer.send('setFullScreen', true);
                app.appMode = 'fullscreen';

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
        pip(){
            document.querySelector('video#apple-music-video-player').requestPictureInPicture()
            // .then(pictureInPictureWindow => {
            //     pictureInPictureWindow.addEventListener("resize", () => {
            //         console.log("[PIP] Resized")
            //     }, false);
            //   })
        },
        miniPlayer(flag) {
            if (flag) {
                this.tmpWidth = window.innerWidth;
                this.tmpHeight = window.innerHeight;
                this.tmpX = window.screenX;
                this.tmpY = window.screenY;
                ipcRenderer.send('unmaximize');
                ipcRenderer.send('windowmin', 250, 250)
                if (this.miniTmpX !== '' && this.miniTmpY !== '') ipcRenderer.send('windowmove', this.miniTmpX, this.miniTmpY)
                ipcRenderer.send('windowresize', 300, 300, false)
                app.appMode = 'mini';
            } else {
                this.miniTmpX = window.screenX;
                this.miniTmpY = window.screenY;
                ipcRenderer.send('windowmin', 844, 410)
                ipcRenderer.send('windowresize', this.tmpWidth, this.tmpHeight, false)
                ipcRenderer.send('windowmove', this.tmpX, this.tmpY)
                ipcRenderer.send('windowontop', false)
                //this.cfg.visual.miniplayer_top_toggle = true;
                app.appMode = 'player';
            }
        },
        pinMiniPlayer(status = false) {
            if (!status) {
                if (!this.cfg.visual.miniplayer_top_toggle) {
                    ipcRenderer.send('windowontop', true)
                    this.cfg.visual.miniplayer_top_toggle = true;
                } else {
                    ipcRenderer.send('windowontop', false)
                    this.cfg.visual.miniplayer_top_toggle = false;
                }
            } else {
                ipcRenderer.send('windowontop', this.cfg.visual.miniplayer_top_toggle ?? false)
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
            for (let elem of elems) {
                if (elem === document.activeElement) {
                    return;
                }
            }
            if (!this.isDev) {
                // disable in dev mode to keep my sanity
                MusicKitInterop.playPause();
            }
        },
        async MKJSLang() {
            let u = this.cfg.general.language;
            // use MusicKit.getInstance or crash
            try {
                let item = await MusicKit.getInstance().api.v3.music(`v1/storefronts/${app.mk.storefrontId}`)
                let langcodes = item.data.data[0].attributes.supportedLanguageTags;
                if (langcodes) langcodes = langcodes.map(function (u) {
                    return u.replace(/-Han[s|t]/i, "").toLowerCase()
                })
                console.log(langcodes)
                let sellang = ""
                if (u && langcodes.includes(u.toLowerCase().replace('_', "-"))) {
                    sellang = ((u.toLowerCase()).replace('_', "-"))
                } else if (u && u.includes('_') && langcodes.includes(((u.toLowerCase()).replace('_', "-")).split("-")[0])) {
                    sellang = ((u.toLowerCase()).replace('_', "-")).split("-")[0]
                }
                if (sellang == "") sellang = (item.data.data[0].attributes.defaultLanguageTag).toLowerCase()

                // Fix weird locales:
                if (sellang == "iw") sellang = "iw-il"
                sellang = sellang.replace(/-Han[s|t]/i, "").toLowerCase()

                console.log(sellang)
                return await sellang
            } catch (err) {
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
        },
        skipToNextItem() {
            app.prevButtonBackIndicator = false;
            // app.mk.skipToNextItem() is buggy somehow so use this
            if (this.mk.queue.nextPlayableItemIndex != -1 && this.mk.queue.nextPlayableItemIndex != null)
                this.mk.changeToMediaAtIndex(this.mk.queue.nextPlayableItemIndex);
        },
        skipToPreviousItem() {
            // app.mk.skipToPreviousItem() is buggy somehow so use this
            if (this.mk.queue.previousPlayableItemIndex != -1 && this.mk.queue.previousPlayableItemIndex != null)
                this.mk.changeToMediaAtIndex(this.mk.queue.previousPlayableItemIndex);
        },
        mediaKeyFixes() {
            navigator.mediaSession.setActionHandler('previoustrack', function () {
                app.prevButton()
            });
            navigator.mediaSession.setActionHandler('nexttrack', function () {
                app.skipToNextItem()
            });
        },
        authCC() {
            ipcRenderer.send('cc-auth')
        },
        _playRadioStream(e) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = process;
            xhr.open("GET", e , true);
            xhr.send();
            let self = this
            function process() {
              if (xhr.readyState == 4) {
                let sources = xhr.responseText.match(/^(?!#)(?!\s).*$/mg).filter(function(element){return (element);});
                // Load first source
                let src = sources[0];
                app.mk._services.mediaItemPlayback._currentPlayer._playAssetURL(src, false)
              }
            }
        }
    }
})


export { app }
