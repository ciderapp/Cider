Vue.component('mediaitem-square', {
    template: '#mediaitem-square',
    props: ['item'],
    methods: {
    }
});

Vue.component('mediaitem-hrect', {
    template: '#mediaitem-hrect',
    props: ['item'],
    methods: {
    }
});

Vue.component('mediaitem-list-item', {
    template: '#mediaitem-list-item',
    props: ['item'],
    methods: {
    }
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
        page: "browse"
    },
    methods: {
        init() {
            let self = this
            this.mk = MusicKit.getInstance()
            this.mk.authorize()
            this.$forceUpdate()
            this.mk.addEventListener(MusicKit.Events.playbackTimeDidChange, (a)=>{
                self.playerLCD.playbackDuration = (self.mk.currentPlaybackTime)
            })
        },
        showSearch() {
            this.page = "search"
        },
        playMediaItemById(id, kind) {
            this.mk.setQueue({ [kind]: [id] }).then(function (queue) {
                MusicKit.getInstance().play()
            })
        },
        searchQuery() {
            let self = this
            this.mk.api.search(this.search.term,
                {
                    types: "songs,artists,albums,playlists",
                    limit: 32
                }).then(function(results) {
                self.search.results = results
            })
        },
        mkReady() {
            if(this.mk["nowPlayingItem"]) {
                return true
            }else{
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
            MusicKit.getInstance().api.search(query, { limit: 2, types: 'songs' }).then(function (data) {
                MusicKit.getInstance().setQueue({ song: data["songs"]['data'][0]["id"] }).then(function (queue) {
                    MusicKit.getInstance().play()
                    setTimeout(()=>{
                        self.$forceUpdate()
                    }, 1000)
                })
            })
        }
    }
})

document.addEventListener('musickitloaded', function() {
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
        setTimeout(()=>{
            app.init()
        }, 1000)
    });
    
});