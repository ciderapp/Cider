Vue.component('sidebar-library-item', {
    template: '#sidebar-library-item',
    props: ['name', 'page', 'cd-click'],
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

const app = new Vue({
    el: "#app",
    data: {
        drawertest: false,
        mk: {},
        quickPlayQuery: "",
        search: {
            term: "",
            results: {}
        },
        playerLCD: {
            playbackDuration: 0
        },
        radio: {
            personal: []
        },
        playlists: {
            listing: [],
            details: {}
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

            this.apiCall('https://api.music.apple.com/v1/me/library/playlists', res => {
                self.playlists.listing = res.data
            })
        },
        getSidebarItemClass(page) {
            if (this.page == page) {
                return ["active"]
            } else {
                return []
            }
        },
        async getRadioStations() {
            this.radio.personal = await this.mk.api.recentRadioStations("",
                {
                    "platform": "web",
                    "art[url]": "f"
                });
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
                    limit: 32
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
            return `url("${url.replace('{w}', size).replace('{h}', size)}")`;
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
            MusicKit.configure({
                developerToken: amwebCFG.MEDIA_API.token,
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