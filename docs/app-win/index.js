const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('auth')) {
    let auth = urlParams.get('auth')
    //delete search param
}

var app = new Vue({
    el: "#app",
    data: {
        drawertest: false,
        mk: {},
        quickPlayQuery: ""
    },
    methods: {
        init() {
            this.mk = MusicKit.getInstance()
            this.$forceUpdate()
        },
        mkReady() {
            if(this.mk["nowPlayingItem"]) {
                return true
            }else{
                return false
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
    MusicKit.configure({
        developerToken: `${auth || ''}`,
        app: {
            name: 'My Cool Web App',
            build: '1978.4.1'
        }
    });
});