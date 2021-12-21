Vue.use(VueObserveVisibility);


Vue.component('sidebar-library-item', {
    template: '#sidebar-library-item',
    props: ['name', 'page', 'cd-click'],
    methods: {}
});


// This is going to suck to code
var CiderContextMenu = {
    Menu: function (event) {
        this.items = []
    },
    Create(event, menudata) {
        var menuBackground = document.createElement("div");
        var menu = document.createElement("div");
        menu.classList.add("context-menu-body");
        menu.classList.add("context-menu-open");
        menuBackground.classList.add("context-menu");
        menu.style.left = 0 + "px";
        menu.style.top = 0 + "px";
        menu.style.position = "absolute";
        menu.style.zIndex = "99909";
        menu.addEventListener("animationend", function () {
            menu.classList.remove("context-menu-open");
        }, {once: true});

        function close () {
            menuBackground.style.pointerEvents = "none";
            menu.classList.add("context-menu-close");
            menu.addEventListener("animationend", function () {
                menuBackground.remove();
                menu.remove();
            }, {once: true});
        }

        // when menubackground is clicked, remove it
        menuBackground.addEventListener("click", close);
        menuBackground.addEventListener("contextmenu", close);

        // add menu to menuBackground
        menuBackground.appendChild(menu);

        document.body.appendChild(menuBackground);


        // for each item in menudata create a menu item
        for (var i = 0; i < menudata.items.length; i++) {
            var item = document.createElement("button")
            item.tabIndex = 0
            item.classList.add("context-menu-item")
            item.innerHTML = menudata.items[i].name
            item.onclick = menudata.items[i].action
            menu.appendChild(item)
        }
        menu.style.width = (menu.offsetWidth + 10) + "px";
        menu.style.left = event.clientX + "px";
        menu.style.top = event.clientY + "px";
        // if menu would be off the screen, move it into view, but preserve the width
        if (menu.offsetLeft + menu.offsetWidth > window.innerWidth) {
            menu.style.left = (window.innerWidth - menu.offsetWidth) + "px";
        }
        if (menu.offsetTop + menu.offsetHeight > window.innerHeight) {
            menu.style.top = (window.innerHeight - menu.offsetHeight) + "px";
        }

        return menuBackground;
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

function msToMinSec(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

class NavigationEvent {
    constructor(page, onnavigate, scrollPosition) {
        this.page = page;
        this.onnavigate = onnavigate;
        this.scrollPosition = scrollPosition;
    }

    navigate() {
        this.onnavigate();
        document.querySelector("#app-content").scrollTop = this.scrollPosition;
    }
}

const app = new Vue({
    el: "#app",
    data: {
        drawertest: false,
        platform: "",
        mk: {},
        quickPlayQuery: "",
        search: {
            term: "",
            hints: [],
            showHints: false,
            results: {},
            limit: 10
        },
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
            downloadNotification: {
                show: false,
                message: "",
                total: 0,
                progress: 0
            },
            songs: {
                sortingOptions: {
                    "albumName": "Album",
                    "artistName": "Artist",
                    "name": "Name",
                    "genre": "Genre",
                    "releaseDate": "Release Date",
                    "durationInMillis": "Duration"
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
                    "artistName": "Artist",
                    "name": "Name",
                    "genre": "Genre",
                    "releaseDate": "Release Date"
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
            details: {}
        },
        mxmtoken: "",
        playerReady: false,
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
        tmpVar: [],
        notification: false,
        chrome: {
            hideUserInfo: false,
            artworkReady: false,
            userinfo: {
                "id": "",
                "attributes": {
                    "name": "Cider User",
                    "handle": "CiderUser",
                    "artwork": {"url": "http://localhost:9000/assets/logocut.png"}
                }
            },
            menuOpened: false,
            maximized: false,
            drawerOpened: false,
            drawerState: "queue",
            topChromeVisible: true,
            progresshover: false,
        },
        collectionList: {
            response: {},
            title: "",
            type: ""
        },
        currentSongInfo: {},
        page: "browse",
        pageHistory: [],
        songstest: false,
        hangtimer: null,
        selectedMediaItems: [],
        routes: ["browse", "listen_now", "radio"]
    },
    watch: {
        page: () => {
            document.getElementById("app-content").scrollTo(0, 0);
            app.selectedMediaItems = [];
        },
        showingPlaylist: () => {
            document.getElementById("app-content").scrollTo(0, 0);
            app.selectedMediaItems = [];
        },
        artistPage: () => {
            document.getElementById("app-content").scrollTo(0, 0);
            app.selectedMediaItems = [];
        },
    },
    methods: {
        async init() {
            let self = this
            clearTimeout(this.hangtimer)
            this.mk = MusicKit.getInstance()
            this.mk.authorize()
            this.$forceUpdate()
            this.mk.privateEnabled = true
            this.platform = ipcRenderer.sendSync('cider-platform');
            // Set profile name
            this.chrome.userinfo = await this.mkapi("personalSocialProfile", false, "")
            // API Fallback
            if (!this.chrome.userinfo) {
                this.chrome.userinfo = {
                    "id": "",
                    "attributes": {
                        "name": "Cider User",
                        "handle": "CiderUser",
                        "artwork": {"url": "http://localhost:9000/assets/logocut.png"}
                    }
                }
            }

            // Set the volume
            ipcRenderer.invoke('getStoreValue', 'volume').then((value) => {
                self.mk.volume = value
            })

            // load cached library
            if (localStorage.getItem("librarySongs") != null) {
                this.library.songs.listing = JSON.parse(localStorage.getItem("librarySongs"))
                this.library.songs.displayListing = this.library.songs.listing
            }
            if (localStorage.getItem("libraryAlbums") != null) {
                this.library.albums.listing = JSON.parse(localStorage.getItem("libraryAlbums"))
                this.library.albums.displayListing = this.library.albums.listing
            }

            MusicKit.getInstance().videoContainerElement = document.getElementById("apple-music-video-player")
            


            this.mk.addEventListener(MusicKit.Events.playbackTimeDidChange, (a) => {
                if (self.mk.nowPlayingItem && self.mk.nowPlayingItem.playParams.kind.includes('ideo')){
                    self.lyriccurrenttime = (self.mk.currentPlaybackTime)
                }
                this.currentSongInfo = a
                self.playerLCD.playbackDuration = (self.mk.currentPlaybackTime)
                if (!self.playerReady) {
                    if (document.getElementById("apple-music-player")) {
                        self.playerReady = true;
                        document.getElementById("apple-music-player").addEventListener('timeupdate', function () {
                            self.lyriccurrenttime = this.currentTime;
                        })
                    }
                }
                // animated dot like AM - bad perf
            })

            this.mk.addEventListener(MusicKit.Events.nowPlayingItemDidChange, (a) => {
                if(self.$refs.queue) {
                    self.$refs.queue.updateQueue();
                }
                this.currentSongInfo = a
                try {
                    a = a.item.attributes;
                } catch (_) {
                }

                let type = (self.mk.nowPlayingItem != null) ? self.mk.nowPlayingItem["type"] ?? '' : '';

                if (type.includes("musicVideo") || type.includes("uploadedVideo")) {
                    document.getElementById("apple-music-video-container").style.display = "block";
                    // app.chrome.topChromeVisible = false
                } else {
                    document.getElementById("apple-music-video-container").style.display = "none";
                    // app.chrome.topChromeVisible = true
                }
                self.chrome.artworkReady = false
                self.lyrics = []
                self.richlyrics = []
                app.getNowPlayingArtwork(42);
                app.getNowPlayingArtworkBG(32);
                app.loadLyrics()

                // Playback Notifications
                if ((app.platform === "darwin" || app.platform === "linux") && !document.hasFocus()) {
                    if (this.notification) {
                        this.notification.close()
                    }
                    this.notification = new Notification(a.name, {
                        body: a.artistName,
                        icon: (a.artwork.url.replace('/{w}x{h}bb', '/512x512bb')).replace('/2000x2000bb', '/35x35bb'),
                        silent: true
                    })
                }

            })

            this.mk.addEventListener(MusicKit.Events.playbackVolumeDidChange, (_a) => {
                ipcRenderer.invoke('setStoreValue', 'volume', this.mk.volume)
            })

            this.apiCall('https://api.music.apple.com/v1/me/library/playlists', res => {
                self.playlists.listing = res.data
            })
            document.body.removeAttribute("loading")
            if(window.location.hash != "") {
                this.appRoute(window.location.hash)
            }
        },
        invokeDrawer(panel) {
            if(this.drawer.panel == panel && this.drawer.open) {
                if(panel == "lyrics") {
                    this.lyricon = false
                }
                this.drawer.panel = ""
                this.drawer.open = false
            }else{
                if(panel == "lyrics") {
                    this.lyricon = true
                }else{
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
            if(found) {
                return true
            }else{
                return false
            }
        },
        select_selectMediaItem(id, kind, index, guid) {
            if(!this.select_hasMediaItem(guid)) {
                this.selectedMediaItems.push({
                    id: id,
                    kind: kind,
                    index: index,
                    guid: guid
                })
            }
        },
        async showCollection(response, title, type) {
            let self = this
            this.collectionList.response = response
            this.collectionList.title = title
            this.collectionList.type = type
            app.appRoute("collection-list")
        },
        async showArtistView(artist, title, view) {
            let response = await this.mk.api.artistView(artist, view, {}, {view: view, includeResponseMeta: !0})
            await this.showCollection(response, title, "artists")
        },
        async showRecordLabelView(label, title, view) {
            let response = await this.mk.api.recordLabelView(label, view, {}, {view: view, includeResponseMeta: !0})
            await this.showCollection(response, title, "record-labels")
        },
        async showSearchView(term, group, title) {
            let response = await this.mk.api.search(term, {
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
                }
            }, {groups: group, includeResponseMeta: !0})
            console.log(response)
            let responseFormat = {
                data: response[group].data.data,
                next: response[group].next,
                groups: group
            }
            await this.showCollection(responseFormat, title, "search")
        },
        async getPlaylistFromID(id) {
            const params = {
                include: "tracks",
                platform: "web",
                "include[library-playlists]": "catalog,tracks",
                "fields[playlists]": "curatorName,playlistType,name,artwork,url",
                "include[library-songs]": "catalog,artists,albums",
                "fields[catalog]": "artistUrl,albumUrl",
                "fields[songs]": "artistUrl,albumUrl"
            }
            try {
                this.showingPlaylist = await app.mk.api.library.playlist(id, params)
            } catch (e) {
                console.log(e);
                try {
                    this.showingPlaylist = await app.mk.api.playlist(id, params)
                } catch (err) {
                    console.log(err)
                }
            }

        },
        async getArtistFromID(id) {
            var artistData = await this.mkapi("artists", false, id, {
                "views": "featured-release,full-albums,appears-on-albums,featured-albums,featured-on-albums,singles,compilation-albums,live-albums,latest-release,top-music-videos,similar-artists,top-songs,playlists,more-to-hear,more-to-see",
                "extend": "artistBio,bornOrFormed,editorialArtwork,editorialVideo,isGroup,origin,hero",
                "extend[playlists]": "trackCount",
                "include[songs]": "albums",
                "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount",
                "limit[artists:top-songs]": 20,
                "art[url]": "f"
            }, {includeResponseMeta: !0})
            console.log(artistData)
            this.artistPage.data = artistData.data[0]
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
        async getRecursive(response, sendTo) {
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
            let hints = await app.mkapi("searchHints", false, this.search.term)
            this.search.hints = hints ? hints.terms : []
        },
        getSongProgress() {
            if (this.playerLCD.userInteraction) {
                return this.playerLCD.desiredDuration
            } else {
                return this.playerLCD.playbackDuration
            }
        },
        convertToMins(time) {
            let mins = Math.floor(time / 60)
            let seconds = (Math.floor(time % 60) / 100).toFixed(2)
            return `${mins}:${seconds.replace("0.", "")}`
        },
        hashCode(str) {
            var hash = 0, i, chr;
            if (str.length === 0) return hash;
            for (i = 0; i < str.length; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },
        appRoute(route) {
            if(route == "" || route == "#" || route == "/") {
                return;
            }
            route = route.replace(/#/g, "")
            // if the route contains does not include a / then route to the page directly
            if (route.indexOf("/") == -1) {
                this.page = route
                window.location.hash = this.page
                return
            }
            let hash = route.split("/")
            let page = hash[0]
            let id = hash[1]
            console.log(`page: ${page} id: ${id}`)
            this.routeView({
                kind: page,
                id: id,
                attributes: {
                    playParams: {kind: page, id: id}
                }
            })
        },
        routeView(item) {
            let self = this


            let kind = (item.attributes.playParams ? (item.attributes.playParams.kind ?? (item.type ?? '')) : (item.type ?? ''));
            let id = (item.attributes.playParams ? (item.attributes.playParams.id ?? (item.id ?? '')) : (item.id ?? ''));
            ;
            let isLibrary = item.attributes.playParams ? (item.attributes.playParams.isLibrary ?? false) : false;
            console.log(kind, id, isLibrary)
           
            if (true) {
                app.showingPlaylist = [];
                if (kind.toString().includes("apple-curator")){
                    kind = "appleCurator"
                    app.getTypeFromID("appleCurator", (id), false, {
                        platform: "web",
                        include: "grouping,playlists",
                        extend: "editorialArtwork",
                        "art[url]": "f"
                    });
                }
                else if (kind.toString().includes("artist")) {
                    app.getArtistInfo(id, isLibrary)
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
                } else if (!kind.toString().includes("radioStation") && !kind.toString().includes("song") && !kind.toString().includes("musicVideo") && !kind.toString().includes("uploadedVideo")) {
                    app.page = (kind) + "_" + (id);
                    app.getTypeFromID((kind), (id), (isLibrary), {extend: "editorialVideo"});
                } else {
                    app.playMediaItemById((id), (kind), (isLibrary), item.attributes.url ?? '')
                }
                document.querySelector("#app-content").scrollTop = 0
            }
            window.location.hash = `${kind}/${id}`
        },
        async getNowPlayingItemDetailed(target) {
            let u = await app.mkapi(app.mk.nowPlayingItem.playParams.kind, (app.mk.nowPlayingItem.songId == -1), (app.mk.nowPlayingItem.songId != -1) ? app.mk.nowPlayingItem.songId : app.mk.nowPlayingItem["id"], {"include[songs]": "albums,artists"});
            app.searchAndNavigate(u, target)
        },
        async searchAndNavigate(item, target) {
            let self = this
            app.tmpVar = item;
            switch (target) {
                case "artist":
                    let artistId = '';
                    try {
                        if (item.relationships.artists && item.relationships.artists.data.length > 0) {
                            if (item.relationships.artists.data[0].type === "artist" || item.relationships.artists.data[0].type === "artists") {
                                artistId = item.relationships.artists.data[0].id
                            }
                        } else {
                            const url = (item.relationships.catalog.data[0].attributes.artistUrl);
                            artistId = (url).substring(url.lastIndexOf('/') + 1)
                            if (artistId.includes('viewCollaboration')) {
                                artistId = artistId.substring(artistId.lastIndexOf('ids=') + 4, artistId.lastIndexOf('-'))
                            }
                        }
                    } catch (_) {
                    }

                    if (artistId == "") {
                        let artistQuery = await app.mk.api.search(item.attributes.artistName, {
                            limit: 1,
                            types: 'artists'
                        })
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
                        if (item.relationships.albums && item.relationships.albums.data.length > 0) {
                            if (item.relationships.albums.data[0].type === "album" || item.relationships.albums.data[0].type === "albums") {
                                albumId = item.relationships.albums.data[0].id
                            }
                        }
                    } catch (_) {
                    }

                    if (albumId == "") {
                        try {
                            let albumQuery = await app.mk.api.search(item.attributes.albumName + " " + (item.attributes.artistName ?? ""), {
                                limit: 1,
                                types: 'albums'
                            })
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
                            let labelQuery = await app.mk.api.search(item.attributes.recordLabel, {
                                limit: 1,
                                types: 'record-labels'
                            })
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
        pushNavigationEvent(item) {
            let self = this

        },
        exitMV() {
            MusicKit.getInstance().stop()
            document.getElementById("apple-music-video-container").style.display = "none";
        },
        getArtistInfo(id, isLibrary) {
            var query = {
                "omit[resource]": "autos",
                views: ["featured-release", "full-albums", "appears-on-albums", "featured-albums", "featured-on-albums", "singles", "compilation-albums", "live-albums", "latest-release", "top-music-videos", "similar-artists", "top-songs", "playlists", "more-to-hear", "more-to-see"],
                extend: ["artistBio", "bornOrFormed", "editorialArtwork", "editorialVideo", "isGroup", "origin", "hero"],
                "extend[playlists]": ["trackCount"],
                "omit[resource:songs]": "relationships",
                "fields[albums]": [...["fields[albums]"], "trackCount"],
                limit: {
                    "artists:top-songs": 20
                },
                "art[url]": "f"
            };
            this.getArtistFromID(id)
            //this.getTypeFromID("artist",id,isLibrary,query)
        },
        playMediaItem(item) {
            let kind = (item.attributes.playParams ? (item.attributes.playParams.kind ?? (item.type ?? '')) : (item.type ?? ''));
            let id = (item.attributes.playParams ? (item.attributes.playParams.id ?? (item.id ?? '')) : (item.id ?? ''));
            ;
            let isLibrary = item.attributes.playParams ? (item.attributes.playParams.isLibrary ?? false) : false;
            console.log(kind, id, isLibrary)
            if (kind.includes("artist")) {
                app.mk.setStationQueue({ artist: 'a-' + id }).then(() => {
                    app.mk.play()
                })
            } else {
                app.playMediaItemById((id), (kind), (isLibrary), item.attributes.url ?? '')
            }
        },
        async getTypeFromID(kind, id, isLibrary = false, params = {}) {
            var a;
            if (kind == "album" | kind == "albums") {
                params["include"] = "tracks,artists,record-labels";
            }
            try {
                a = await this.mkapi(kind.toString(), isLibrary, id.toString(), params);
            } catch (e) {
                console.log(e);
                try {
                    a = await this.mkapi(kind.toString(), !isLibrary, id.toString(), params);
                } catch (err) {
                    console.log(err);
                    a = []
                } finally {
                    this.showingPlaylist = a
                }
            } finally {
                this.showingPlaylist = a
            }
            ;
        },
        searchLibrarySongs() {
            let self = this

            function sortSongs() {
                // sort this.library.songs.displayListing by song.attributes[self.library.songs.sorting] in descending or ascending order based on alphabetical order and numeric order
                // check if song.attributes[self.library.songs.sorting] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
                self.library.songs.displayListing.sort((a, b) => {
                    let aa = null;
                    let bb = null;
                    if (self.library.songs.sorting == "genre") {
                        aa = a.attributes.genreNames[0]
                        bb = b.attributes.genreNames[0]
                    }
                    aa = a.attributes[self.library.songs.sorting]
                    bb = b.attributes[self.library.songs.sorting]
                    if (aa == null) {
                        aa = ""
                    }
                    if (bb == null) {
                        bb = ""
                    }
                    if (self.library.songs.sortOrder == "asc") {
                        if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                            return aa - bb
                        } else {
                            return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase())
                        }
                    } else if (self.library.songs.sortOrder == "desc") {
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
                let aa = null;
                let bb = null;
                self.library.albums.displayListing.sort((a, b) => {
                    if (self.library.albums.sorting[index] == "genre") {
                        aa = a.attributes.genreNames[0]
                        bb = b.attributes.genreNames[0]
                    }
                    if (self.library.albums.sorting[index] == "dateAdded") {
                        aa = new Date(a.attributes.dateAdded).getTime()
                        bb = new Date(b.attributes.dateAdded).getTime()
                    }
                    aa = a.attributes[self.library.albums.sorting[index]]
                    bb = b.attributes[self.library.albums.sorting[index]]
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
        getSidebarItemClass(page) {
            if (this.page == page) {
                return ["active"]
            } else {
                return []
            }
        },
        async mkapi(method, library = false, term, params = {}, params2 = {}, attempts = 0) {
            if (attempts > 3) {
                return
            }
            try {
                if (library) {
                    return await this.mk.api.library[method](term, params, params2)
                } else {
                    return await this.mk.api[method](term, params, params2)
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
            this.library.downloadNotification.show = true
            this.library.downloadNotification.message = "Updating library songs..."

            function downloadChunk() {
                const params = {
                    "include[library-songs]": "artists,albums",
                    "fields[artists]": "name,url,id",
                    "fields[albums]": "name,url,id",
                    platform: "web",
                    "fields[songs]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
                    limit: 100,
                }
                self.library.songs.downloadState = 1
                if (downloaded == null) {
                    app.mk.api.library.songs("", params, {includeResponseMeta: !0}).then((response) => {
                        processChunk(response)
                    })
                } else {
                    downloaded.next("", params, {includeResponseMeta: !0}).then((response) => {
                        processChunk(response)
                    })
                }
            }

            function processChunk(response) {
                downloaded = response
                library = library.concat(downloaded.data)
                self.library.downloadNotification.show = true
                self.library.downloadNotification.message = "Updating library songs..."
                self.library.downloadNotification.total = downloaded.meta.total
                self.library.downloadNotification.progress = library.length

                if (downloaded.meta.total == 0) {
                    self.library.songs.downloadState = 3
                    return
                }
                if (typeof downloaded.next == "undefined") {
                    console.log("downloaded.next is undefined")
                    self.library.songs.listing = library
                    self.library.songs.downloadState = 2
                    self.library.downloadNotification.show = false
                    self.searchLibrarySongs()
                    localStorage.setItem("librarySongs", JSON.stringify(library))
                }
                if (downloaded.meta.total > library.length || typeof downloaded.meta.next != "undefined") {
                    console.log(`downloading next chunk - ${library.length} songs so far`)
                    downloadChunk()
                } else {
                    self.library.songs.listing = library
                    self.library.songs.downloadState = 2
                    self.library.downloadNotification.show = false
                    self.searchLibrarySongs()
                    localStorage.setItem("librarySongs", JSON.stringify(library))
                    console.log(library)
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
            this.library.downloadNotification.show = true
            this.library.downloadNotification.message = "Updating library albums..."

            function downloadChunk() {
                self.library.albums.downloadState = 1
                if (downloaded == null) {
                    app.mk.api.library.albums("", {limit: 100}, {includeResponseMeta: !0}).then((response) => {
                        processChunk(response)
                    })
                } else {
                    downloaded.next("", {limit: 100}, {includeResponseMeta: !0}).then((response) => {
                        processChunk(response)
                    })
                }
            }

            function processChunk(response) {
                downloaded = response
                library = library.concat(downloaded.data)
                self.library.downloadNotification.show = true
                self.library.downloadNotification.message = "Updating library albums..."
                self.library.downloadNotification.total = downloaded.meta.total
                self.library.downloadNotification.progress = library.length
                if (downloaded.meta.total == 0) {
                    self.library.albums.downloadState = 3
                    return
                }
                if (typeof downloaded.next == "undefined") {
                    console.log("downloaded.next is undefined")
                    self.library.albums.listing = library
                    self.library.albums.downloadState = 2
                    self.library.downloadNotification.show = false
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
                    self.library.downloadNotification.show = false
                    localStorage.setItem("libraryAlbums", JSON.stringify(library))
                    self.searchLibraryAlbums(index)
                    console.log(library)
                }
            }

            downloadChunk()
        },
        getTotalTime() {
            try {
                if (app.showingPlaylist.relationships.tracks.data.length > 0) {
                    time = Math.round([].concat(...app.showingPlaylist.relationships.tracks.data).reduce((a, {attributes: {durationInMillis}}) => a + durationInMillis, 0) / 60000);
                    return app.showingPlaylist.relationships.tracks.data.length + " tracks, " + time + " mins.";
                } else return ""
            } catch (err) {
                return ""
            }
        },
        async getLibrarySongs() {
            var response = await this.mkapi("songs", true, "", {limit: 100}, {includeResponseMeta: !0})
            this.library.songs.listing = response.data
            this.library.songs.meta = response.meta
        },
        async getLibraryAlbums() {
            var response = await this.mkapi("albums", true, "", {limit: 100}, {includeResponseMeta: !0})
            this.library.albums.listing = response.data
            this.library.albums.meta = response.meta
        },
        async getListenNow(attempt = 0) {
            if (attempt > 3) {
                return
            }
            try {
                this.listennow = await this.mk.api.personalRecommendations("",
                    {
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
                        types: "artists,albums,editorial-items,library-albums,library-playlists,music-movies,music-videos,playlists,stations,uploaded-audios,uploaded-videos,activities,apple-curators,curators,tv-shows,social-profiles,social-upsells",
                        platform: "web"
                    },
                    {
                        includeResponseMeta: !0,
                        reload: !0
                    });
                console.log(this.listennow)
            } catch (e) {
                console.log(e)
                this.getListenNow(attempt + 1)
            }
        },
        async getBrowsePage(attempt = 0) {
            if (attempt > 3) {
                return
            }
            try {
                var browse = await this.mk.api.groupings("",
                    {
                        platform: "web",
                        name: "music",
                        "omit[resource:artists]": "relationships",
                        "include[albums]": "artists",
                        "include[songs]": "artists",
                        "include[music-videos]": "artists",
                        extend: "editorialArtwork,artistUrl",
                        "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
                        "art[url]": "f"
                    });
                this.browsepage = browse[0];
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
                this.radio.personal = await this.mkapi("recentRadioStations", false, "",
                    {
                        "platform": "web",
                        "art[url]": "f"
                    });
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
        unauthorize() {
            this.mk.unauthorize()
        },
        showSearch() {
            this.page = "search"
        },
        loadLyrics() {
            this.loadMXM();
        },
        loadAMLyrics() {
            const songID = (this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem["_songId"] ?? -1 : -1;
            // this.getMXM( trackName, artistName, 'en', duration);
            if (songID != -1) {
                MusicKit.getInstance().api.lyric(songID)
                    .then((response) => {
                        this.lyricsMediaItem = response.attributes["ttml"]
                        this.parseTTML()
                    })
            }
        },
        addToLibrary(id) {
            let self = this
            this.mk.addToLibrary(id).then((data) => {
                self.getLibrarySongsFull(true)
            })
        },
        loadMXM() {
            let attempt = 0;
            const track = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.title ?? '' : '');
            const artist = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.artistName ?? '' : '');
            const time = encodeURIComponent((this.mk.nowPlayingItem != null) ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1);
            var lrcfile = "";
            var richsync = [];
            const lang = "en" //  translation language
            function revisedRandId() {
                return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
            }

            /* get token */
            function getToken(mode, track, artist, songid, lang, time) {
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
                                    getMXMSubs(track, artist, app.mxmtoken, lang, time);
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

            function getMXMSubs(track, artist, token, lang, time) {
                var usertoken = encodeURIComponent(token);
                var timecustom = (!time || (time && time < 0)) ? '' : `&f_subtitle_length=${time}&q_duration=${time}&f_subtitle_length_max_deviation=40`;
                var url = "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&optional_calls=track.richsync&subtitle_format=lrc&q_artist=" + artist + "&q_track=" + track + "&usertoken=" + usertoken + timecustom + "&app_id=web-desktop-app-v1.0&t=" + revisedRandId();
                var req = new XMLHttpRequest();
                req.overrideMimeType("application/json");
                req.open('GET', url, true);
                req.setRequestHeader("authority", "apic-desktop.musixmatch.com");
                req.onload = function () {
                    var jsonResponse = JSON.parse(this.responseText);
                    console.log(jsonResponse);
                    var status1 = jsonResponse["message"]["header"]["status_code"];

                    if (status1 == 200) {
                        let id = '';
                        try {
                            if (jsonResponse["message"]["body"]["macro_calls"]["matcher.track.get"]["message"]["header"]["status_code"] == 200 && jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["header"]["status_code"] == 200) {
                                id = jsonResponse["message"]["body"]["macro_calls"]["matcher.track.get"]["message"]["body"]["track"]["track_id"] ?? '';
                                lrcfile = jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["body"]["subtitle_list"][0]["subtitle"]["subtitle_body"];
                                
                                try{
                                lrcrich = jsonResponse["message"]["body"]["macro_calls"]["track.richsync.get"]["message"]["body"]["richsync"]["richsync_body"];
                                richsync = JSON.parse(lrcrich);
                                app.richlyrics = richsync;
                                } catch(_){}
                            }

                            if (lrcfile == "") {
                                app.loadAMLyrics()
                            } else {
                                if (richsync == [] || richsync.length == 0 ){
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
                                   preLrc = richsync.map(function (item){ return { startTime: item.ts,
                                    endTime: item.te,
                                    line: item.x,
                                    translation: ''}})
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
                    getMXMSubs(track, artist, app.mxmtoken, lang, time)
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
            var xml = this.stringToXml(this.lyricsMediaItem)
            var json = xmlToJson(xml);
            this.lyrics = json
        },
        stringToXml(st) {
            // string to xml
            var xml = (new DOMParser()).parseFromString(st, "text/xml");
            return xml;

        },
        getCurrentTime() {
            return parseFloat(this.hmsToSecondsOnly(this.parseTime(this.mk.nowPlayingItem.attributes.durationInMillis - app.mk.currentPlaybackTimeRemaining * 1000)));
        },
        seekTo(time) {
            this.mk.seekToTime(time);
        },
        parseTime(value) {
            var minutes = Math.floor(value / 60000);
            var seconds = ((value % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        },
        parseTimeDecimal(value) {
            var minutes = Math.floor(value / 60000);
            var seconds = ((value % 60000) / 1000).toFixed(0);
            return minutes + "." + (seconds < 10 ? '0' : '') + seconds;
        },
        hmsToSecondsOnly(str) {
            var p = str.split(':'),
                s = 0,
                m = 1;

            while (p.length > 0) {
                s += m * parseInt(p.pop(), 10);
                m *= 60;
            }

            return s;
        },
        getLyricBGStyle(start, end) {
            var currentTime = this.getCurrentTime();
            var duration = this.mk.nowPlayingItem.attributes.durationInMillis
            var start2 = this.hmsToSecondsOnly(start)
            var end2 = this.hmsToSecondsOnly(end)
            var currentProgress = ((100 * (currentTime)) / (end2))
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
            var truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
            console.log(id, truekind, isLibrary)
            try {
                if (truekind.includes("artist")){
                    app.mk.setStationQueue({ artist: 'a-' + id }).then(() => {
                        app.mk.play()
                    })
                }
                else if (truekind == "radioStations") {
                    this.mk.setStationQueue({url: raurl}).then(function (queue) {
                        MusicKit.getInstance().play()
                    });
                } else {
                    this.mk.setQueue({[truekind]: [id]}).then(function (queue) {
                        MusicKit.getInstance().play()
                    })
                }
            } catch (err) {
                console.log(err)
                this.playMediaItemById(id, kind, isLibrary, raurl)
            }
        },
        queueParentandplayChild(parent,childIndex,item){
            var kind = parent.substring(0,parent.indexOf(":"))
            var id = parent.substring(parent.indexOf(":")+1 , parent.length)
            var truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
            console.log(truekind,id)

            try {
                if (app.library.songs.listing.length > childIndex && parent == "librarysongs"){
                    console.log(item)
                    if (item && ((app.library.songs.listing[childIndex].id != item.id))){
                       childIndex = app.library.songs.listing.indexOf(item)
                    } 

                    let query = app.library.songs.listing.map(item => new MusicKit.MediaItem(item));
                    try{app.mk.stop()}catch(e){}
                    this.mk.clearQueue().then(function (_) {
                        app.mk.queue.append(query)
                        app.mk.changeToMediaAtIndex(childIndex)
                    })
                } else {
                    try{app.mk.stop()}catch(e){}
                    this.mk.setQueue({[truekind]: [id]}).then(function (queue) {
                        app.mk.changeToMediaAtIndex(childIndex)
                    })
                }
            } catch (err) {
                console.log(err)
                try{app.mk.stop()}catch(e){}
                this.playMediaItemById(item.attributes.playParams.id ?? item.id, item.attributes.playParams.kind ?? item.type, item.attributes.playParams.isLibrary ?? false, item.attributes.url)
            }
         
        },
        friendlyTypes(type) {
            // use switch statement to return friendly name for media types "songs,artists,albums,playlists,music-videos,stations,apple-curators,curators"
            switch (type) {
                case "song":
                    return "Songs"
                    break;
                case "artist":
                    return "Artists"
                    break;
                case "album":
                    return "Albums"
                    break;
                case "playlist":
                    return "Playlists"
                    break;
                case "music_video":
                    return "Music Videos"
                    break;
                case "station":
                    return "Stations"
                    break;
                case "apple-curator":
                    return "Apple Curators"
                    break;
                case "radio_show":
                    return "Radio Shows"
                    break;
                case "record_label":
                    return "Record Labels"
                    break;
                case "radio_episode":
                    return "Episodes"
                    break;
                case "video_extra":
                    return "Video Extras"
                    break;
                case "curator":
                    return "Curators"
                    break;
                case "top":
                    return "Top"
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
            this.mk.api.search(this.search.term,
                {
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
                    limit: 25
                }).then(function (results) {
                self.search.results = results
            })
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
            var found = this.library.songs.listing.filter((item) => {
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
        getMediaItemArtwork(url, size = 64) {
            var newurl = `${url.replace('{w}', size).replace('{h}', size).replace('{f}', "webp").replace('{c}', "cc")}`;
            return newurl
        },
        getNowPlayingArtworkBG(size = 600) {
            if(typeof this.mk.nowPlayingItem === "undefined") return;
            let bginterval = setInterval(() => {
                if (!this.mkReady()) {
                    return ""
                }

                try {
                    if (this.mk.nowPlayingItem && this.mk.nowPlayingItem["id"] != this.currentTrackID && document.querySelector('.bg-artwork')) {
                        if (document.querySelector('.bg-artwork')) {
                            clearInterval(bginterval);
                        }
                        this.currentTrackID = this.mk.nowPlayingItem["id"];
                        document.querySelector('.bg-artwork').src = "";
                        if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
                            document.querySelector('.bg-artwork').src = this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"].replace('{w}', size).replace('{h}', size);
                            try { clearInterval(bginterval); } catch (err) { }
                        } else {
                            this.setLibraryArtBG()
                        }
                    } else if (this.mk.nowPlayingItem["id"] == this.currentTrackID){
                        try { clearInterval(bginterval); } catch (err) {  }
                    }
                } catch (e) {
                    if (this.mk.nowPlayingItem && this.mk.nowPlayingItem["id"] && document.querySelector('.bg-artwork')){
                    this.setLibraryArtBG()
                    try { clearInterval(bginterval); } catch (err) { }
                }
                }
            }, 200)
        },
        getNowPlayingArtwork(size = 600) {
            if(typeof this.mk.nowPlayingItem === "undefined") return;
            let interval = setInterval(() => {

                try {
                    if (this.mk.nowPlayingItem && this.mk.nowPlayingItem["id"] != this.currentTrackIDBG && document.querySelector('.app-playback-controls .artwork')) {
                        this.currentTrackIDBG = this.mk.nowPlayingItem["id"];
                        if (document.querySelector('.app-playback-controls .artwork') != null) {
                            clearInterval(interval);
                        }
                        document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', '');
                        if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
                            document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', `url("${decodeURI((this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"])).replace('{w}', size).replace('{h}', size)}")`);
                            try { clearInterval(interval); } catch (err) {}
                        } else {
                            this.setLibraryArt()
                        }
                    } else if (this.mk.nowPlayingItem["id"] == this.currentTrackID){
                        try { clearInterval(interval); } catch (err) {  }
                    }
                } catch (e) {
                    if (this.mk.nowPlayingItem && this.mk.nowPlayingItem["id"] && document.querySelector('.app-playback-controls .artwork')){
                    this.setLibraryArt()
                    try { clearInterval(interval); } catch (err) { }
                    
                }

                }
            }, 200)


        },
        async setLibraryArt() {
            if(typeof this.mk.nowPlayingItem === "undefined") return;
            const data = await this.mk.api.library.song(this.mk.nowPlayingItem["id"])
            try {
            const data = await this.mk.api.library.song(this.mk.nowPlayingItem.id)
            
                if (data != null && data !== "") {
                    document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', 'url("' + (data["attributes"]["artwork"]["url"]).toString() + '")');
                } else {
                    document.querySelector('.app-playback-controls .artwork').style.setProperty('--artwork', `url("")`);
                }
            } catch (e) {
            }
        },
        async setLibraryArtBG() {
            if(typeof this.mk.nowPlayingItem === "undefined") return;
            const data = await this.mk.api.library.song(this.mk.nowPlayingItem["id"])
            try {
            const data = await this.mk.api.library.song(this.mk.nowPlayingItem.id)
            
                if (data != null && data !== "") {
                    document.querySelector('.bg-artwork').src = (data["attributes"]["artwork"]["url"]).toString();
                }
            } catch (e) {
            }

        },
        quickPlay(query) {
            let self = this
            MusicKit.getInstance().api.search(query, {limit: 2, types: 'songs'}).then(function (data) {
                MusicKit.getInstance().setQueue({song: data["songs"]['data'][0]["id"]}).then(function (queue) {
                    MusicKit.getInstance().play()
                    setTimeout(() => {
                        self.$forceUpdate()
                    }, 1000)
                })
            })
        },
        apiCall(url, callback) {
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
            this.mk.api.playlist(id).then(res => {
                callback(res)
            })

            // tracks are found in relationship.data
        },
        windowFocus(val) {
            if (val) {
                document.querySelectorAll(".animated-artwork-video").forEach(el => {
                    el.play()
                })
            } else {
                document.querySelectorAll(".animated-artwork-video").forEach(el => {
                    el.pause()
                })
            }
        }
    }
})

// Key binds
document.addEventListener('keydown', function (e) {
    if (e.keyCode === 70 && e.ctrlKey) {
        app.$refs.searchInput.focus()
        app.$refs.searchInput.select()
    }
});

// Hang Timer
app.hangtimer = setTimeout(()=>{
    if(confirm("Cider is not responding. Reload the app?")) {
        window.location.reload()
    }
}, 10000)

// add event listener for when window.location.hash changes
window.addEventListener("hashchange", function () {
    app.appRoute(window.location.hash)
});

document.addEventListener('musickitloaded', function () {
    // MusicKit global is now defined
    function initMusicKit() {
        let parsedJson = JSON.parse(this.responseText)
        MusicKit.configure({
            developerToken: parsedJson.Key,
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
    request.addEventListener("load", initMusicKit);
    request.open("GET", "https://api.cider.sh/");
    request.send();
});

// if ('serviceWorker' in navigator) {
//     // Use the window load event to keep the page load performant
//     window.addEventListener('load', () => {
//       navigator.serviceWorker.register('sw.js?v=1');
//     });
//   }

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
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

refreshFocus();

function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
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
    const currentGPU = await navigator.gpu.requestAdapter()
    console.log("WebGPU enabled on", currentGPU.name,"with feature ID", currentGPU.features.size)
}
webGPU().then()

