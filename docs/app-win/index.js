Vue.component('sidebar-library-item', {
    template: '#sidebar-library-item',
    props: ['name', 'page', 'cd-click'],
    methods: {}
});

Vue.component('mediaitem-scroller-horizontal', {
    template: '#mediaitem-scroller-horizontal',
    props: ['items'],
    methods: {}
});

Vue.component('mediaitem-square', {
    template: '#mediaitem-square',
    props: ['item'],
    methods: {}
});

Vue.component('mediaitem-hrect', {
    template: '#mediaitem-hrect',
    props: ['item'],
    methods: {}
});

Vue.component('mediaitem-list-item', {
    template: '#mediaitem-list-item',
    props: ['item'],
    methods: {}
});

Vue.component('cider-search', {
    template: "#cider-search",
    props: ['search'],
    methods: {
        getTopResult() {
            if (this.search.results["meta"]) {
                return this.search.results[this.search.results.meta.results.order[0]]["data"][0]
            } else {
                return false;
            }
        }
    }
})

Vue.component('cider-listen-now', {
    template: "#cider-listen-now",
    props: ["data"]
})

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

const app = new Vue({
    el: "#app",
    data: {
        drawertest: false,
        mk: {},
        quickPlayQuery: "",
        search: {
            term: "",
            results: {},
            limit: 10
        },
        playerLCD: {
            playbackDuration: 0
        },
        listennow: [],
        radio: {
            personal: []
        },
        library: {
            songs: {
                listing: [],
                meta: {total: 0}
            }
        },
        playlists: {
            listing: [],
            details: {}
        },
        chrome: {
            artworkReady: false
        },
        page: "browse"
    },
    methods: {
        init() {
            let self = this
            this.mk = MusicKit.getInstance()
            this.mk.authorize()
            this.$forceUpdate()

            this.mk.addEventListener(MusicKit.Events.playbackTimeDidChange, (a) => {
                self.playerLCD.playbackDuration = (self.mk.currentPlaybackTime)
            })

            this.mk.addEventListener(MusicKit.Events.nowPlayingItemDidChange, (a) => {
                self.chrome.artworkReady = false
            })

            this.apiCall('https://api.music.apple.com/v1/me/library/playlists', res => {
                self.playlists.listing = res.data
            })
            document.body.removeAttribute("loading")
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
        async getLibrarySongs() {
            var response = await this.mkapi("songs", true, "", {limit: 100}, {includeResponseMeta: !0})
            this.library.songs.listing = response.data
            this.library.songs.meta = response.meta
        },
        async getListenNow(attempt = 0) {
            if (attempt > 3) {
                return
            }
            try {
                    this.listennow =  await this.mk.api.personalRecommendations("",
                    {
                        name: "listen-now",
                        with: "friendsMix,library,social",
                        "art[social-profiles:url]": "c",
                        "art[url]": "c,f",
                        "omit[resource]": "autos",
                        "relate[editorial-items]": "contents",
                        extend: ["editorialCard", "editorialVideo"],
                        "extend[albums]": ["artistUrl"],
                        "extend[library-albums]": ["artistUrl"],
                        "extend[playlists]": ["artistNames", "editorialArtwork"],
                        "extend[library-playlists]": ["artistNames", "editorialArtwork"],
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
        unauthorize() {
            this.mk.unauthorize()
        },
        showSearch() {
            this.page = "search"
        },
        playMediaItemById(id, kind) {
            this.mk.setQueue({[kind]: [id]}).then(function (queue) {
                MusicKit.getInstance().play()
            })
        },
        searchQuery() {
            let self = this
            this.mk.api.search(this.search.term,
                {
                    types: "songs,artists,albums,playlists",
                    limit: self.search.limit
                }).then(function (results) {
                self.search.results = results
            })
        },
        mkReady() {
            if (this.mk["nowPlayingItem"]) {
                return true
            } else {
                return false
            }
        },
        getMediaItemArtwork(url, size = 64) {
            return `url("${url.replace('{w}', size).replace('{h}', size).replace('{f}', "webp").replace('{c}', "cc")}")`;
        },
        getNowPlayingArtworkBG(size = 600) {
            if(!this.mkReady()) {
                return ""
            }
            if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
                return `${this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"].replace('{w}', size).replace('{h}', size)}`;
            } else {
                return "";
            }
        },
        getNowPlayingArtwork(size = 600) {
            if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
                return `url("${this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"].replace('{w}', size).replace('{h}', size)}")`;
            } else {
                return "";
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
                    console.log('SUCCESS', xmlHttp.responseText);
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
        }
    }
})

document.addEventListener('musickitloaded', function () {
    // MusicKit global is now defined
    fetch("https://beta.music.apple.com/")
        .then(response => response.text())
        .then(data => {
            var el = document.createElement("html");
            el.innerHTML = data;
            var u = el.querySelector(`[name="desktop-music-app/config/environment"]`)
            var amwebCFG = JSON.parse(decodeURIComponent(u.getAttribute("content")));
            console.log(amwebCFG.MEDIA_API.token)
            // eh fuck it lets just expose the token
            MusicKit.configure({
                developerToken: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNjM2NTYwMjc1LCJleHAiOjE2NTIxMTIyNzV9.is4KeAN_M9FWTfuw9zMV2lgHSSdPqEV2SX-XfCuEYY4qtmjbo-NjebHCageS28z0P0erksqql9rtsoizE4hsJg",
                app: {
                    name: 'My Cool Web App',
                    build: '1978.4.1'
                }
            });
            setTimeout(() => {
                app.init()
            }, 1000)
        });

});