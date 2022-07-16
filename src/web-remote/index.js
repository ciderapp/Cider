
var socket;

Vue.component('footer-player', {
    template: '#footer-player'
});

// vue instance
var app = new Vue({
    el: '#app',
    data: {
        screen: "player",
        player: {
            currentMediaItem: {},
            songActions: false,
            maxVolume: 1,
            lyrics: {},
            lyricsMediaItem: {},
            lyricsDebug: {
                current: 0,
                start: 0,
                end: 0
            },
            lyricsScrollingBlocked: false,
            queue: {},
            lowerPanelState: "controls",
            userInteraction: false
        },
        queue: {
            temp: []
        },
        artistPage: {
            data: {},
            editorsNotes: false
        },
        albumPage: {
            data: {},
            editorsNotes: false
        },
        search: {
            query: "",
            results: [],
            state: 0,
            tab: "all",
            searchType: "applemusic",
            trackSelect: false,
            selected: {},
            queue: {},
            lastPage: "search",
            lastY: 0
        },
        lastPage: "player",
        connectedState: 0,
        url: window.location.hostname,
        mode: "default",
        // url: "localhost",
    },
    methods: {
        isElectron() {
            // Renderer process
            if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
                return true;
            }
            // Main process
            if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
                return true;
            }
            // Detect the user agent when the `nodeIntegration` option is set to true
            if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
                return true;
            }
            return false;
        },
        searchScroll(e) {
            this.search.lastY = e.target.scrollTop;
        },
        musicKitAPI(method, id, params, library = false) {
            socket.send(
                JSON.stringify({
                    action: "musickit-api",
                    method: method,
                    id: id,
                    params: params,
                    library : library 
                })
            )
        },
        resetPlayerUI() {
            this.player.lowerPanelState = "controls";
        },
        musicAppVariant() {
            if (navigator.userAgent.match(/Android/i)) {
                return "Cider";
            } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                return "Cider";
            } else {
                if (navigator.userAgent.indexOf('Mac') > 0) {
                    return 'Music';
                } else if (navigator.userAgent.indexOf('Win') > 0) {
                    return 'Cider';
                } else {
                    return 'Cider';
                }
            }
        },
        checkOrientation() {
            // check orientation of device
            if (window.innerHeight > window.innerWidth) {
                return 'portrait'
            } else {
                return 'landscape';
            }
        },
        checkPlatformMD() {
            // check if platfom is desktop or mobile
            if (navigator.userAgent.match(/Android/i)) {
                return "mobile";
            } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                return "mobile";
            } else {
                if (navigator.userAgent.indexOf('Mac') > 0) {
                    return 'desktop';
                } else if (navigator.userAgent.indexOf('Win') > 0) {
                    return 'desktop';
                } else {
                    return 'desktop';
                }
            }
        },
        checkPlatform() {
            if (navigator.userAgent.match(/Android/i)) {
                return "android";
            } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                return "ios";
            } else {
                if (navigator.userAgent.indexOf('Mac') > 0) {
                    return 'mac';
                } else if (navigator.userAgent.indexOf('Win') > 0) {
                    return 'win';
                } else {
                    return 'linux';
                }
            }
        },
        checkMode() {
            urlParams = new URLSearchParams(window.location.search);
            return urlParams.has('mode') ? urlParams.get('mode') : "default";
        },
        artworkPlaying() {
            if (this.player.currentMediaItem.status) {
                return
            } else {
                return ["paused"]
            }
        },
        setAutoplay(value) {
            socket.send(JSON.stringify({
                "action": "set-autoplay",
                "autoplay": value
            }));
            this.getCurrentMediaItem()
            if (value) {
                setTimeout(() => {
                    this.getQueue()
                }, 1000)
            } else {
                this.getQueue()
            }
        },
        seekTo(time, adjust = true) {
            if (adjust) {
                time = parseInt(time / 1000)
            }
            socket.send(JSON.stringify({
                action: "seek",
                time: time
            }));
        },
        setVolume(volume) {
            socket.send(JSON.stringify({
                action: "volume",
                volume: volume
            }));
        },
        getVolumeMax() {
            socket.send(JSON.stringify({
                action: "volumeMax",
            }));
        },
        getQueue() {
            socket.send(JSON.stringify({
                action: "get-queue"
            }))
        },
        play() {
            socket.send(JSON.stringify({
                action: "play"
            }))
        },
        pause() {
            socket.send(JSON.stringify({
                action: "pause"
            }))
        },
        next() {
            socket.send(JSON.stringify({
                action: "next"
            }))
        },
        previous() {
            socket.send(JSON.stringify({
                action: "previous"
            }))
        },
        searchArtist() {
            this.search.query = this.player.currentMediaItem.artistName;
            this.screen = "search";
            this.searchQuery();
        },
        trackSelect(song) {
            this.search.selected = song;
            this.search.trackSelect = true
        },
        clearSelectedTrack() {
            this.search.selected = {}
            this.search.trackSelect = false
        },
        getArtworkColor(hex) {
            return `#${hex}`
        },
        playMediaItemById(id, kind = "song") {
            socket.send(JSON.stringify({
                action: "play-mediaitem",
                id: id,
                kind: kind
            }))
            this.screen = "player";
        },
        playNext(type, id) {
            socket.send(JSON.stringify({
                action: "play-next",
                type: type,
                id: id
            }))
        },
        playLater(type, id) {
            socket.send(JSON.stringify({
                action: "play-later",
                type: type,
                id: id
            }))
        },
        searchQuery() {
            if (this.search.query.length == 0) {
                this.search.state = 0;
                return;
            }
            this.search.state = 1;
            var actionType = "search"
            if (this.search.searchType == "library") {
                actionType = "library-search"
            }
            socket.send(JSON.stringify({
                "action": actionType,
                "term": this.search.query,
                "limit": 20
            }))
        },
        quickSearch() {
            var search = prompt("Search for a song", "")
            if (search == null || search == "") {
                return
            }

            socket.send(JSON.stringify({
                action: "quick-play",
                term: search
            }))
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
        getCurrentTime() {
            return parseFloat(this.hmsToSecondsOnly(this.parseTime(this.player.currentMediaItem.durationInMillis - this.player.currentMediaItem.remainingTime)));
        },
        percentage(partial, full) {
            return (100 * partial) / full
        },
        getLyricBGStyle(start, end) {
            var currentTime = this.getCurrentTime();
            var duration = this.player.currentMediaItem.durationInMillis
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
        blockLyricsScrolling() {
            this.lyricsScrollingBlocked = true;
            setTimeout(() => {
                this.lyricsScrollingBlocked = false;
            }, 100);
        },
        getLyricClass(start, end) {
            var currentTime = this.getCurrentTime();
            // check if currenttime is between start and end
            if (currentTime >= start && currentTime <= end) {
                setTimeout(() => {
                    if (document.querySelector(".lyric-line.active") && !this.lyricsScrollingBlocked) {
                        document.querySelector(".lyric-line.active").scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        })
                    }
                }, 200)
                return "active"
            } else {
                return ""
            }
        },
        getAlbumArtUrl(size = 600) {
            if (this.player.currentMediaItem.artwork) {
                return `url("${this.player.currentMediaItem.artwork.url.replace('{w}', size).replace('{h}', size)}")`;
            } else {
                return "";
            }
        },
        getAlbumArtUrlList(url, size = 64) {
            return `url("${url.replace('{w}', size).replace('{h}', size)}")`;
        },
        searchTabClass(tab) {
            if (tab == this.search.tab) {
                return "active";
            }
        },
        searchTypeClass(type) {
            if (type == this.search.searchType) {
                return "active";
            }
        },
        getQueuePositionClass(position) {
            if (this.player.queue["_position"] == position) {
                return ["playing", "passed"]
            } else if (this.player.queue["_position"] > position) {
                return ["passed"]
            }
        },
        showSearch(reset = false) {
            if (reset) {
                this.search.lastPage = "search"
            }
            switch (this.search.lastPage) {
                case "search":
                    this.screen = "search"
                    break;
                case "album":
                    this.screen = "album-page"
                    break;
                case "artist":
                    this.screen = "artist-page"
                    break;
                case "playlist":
                    this.screen = "playlist-page"
                    break;
            }
        },
        showArtistByName(name) {
            this.musicKitAPI("search", name, { types: "artists" })
        },
        showAlbum(id,library = false) {
            this.search.lastPage = "album"
            this.screen = "album-page"
            this.musicKitAPI("album", id, {}, library)
        },
        showPlaylist(id, library = false) {
            this.search.lastPage = "album"
            this.screen = "album-page"
            this.musicKitAPI("playlist", id, {}, library)
        },
        showArtist(id, library = false) {
            this.search.lastPage = "artist"
            this.screen = "artist-page"
            this.musicKitAPI("artist", id, { include: "songs,playlists,albums" }, library)
        },
        showQueue() {
            this.queue.temp = this.player["queue"]["_queueItems"]
            this.screen = "queue"
            this.getQueue()
        },
        queueMove(evt) {
            console.log(evt)
            console.log(`new: ${evt.moved.newIndex} old: ${evt.moved.oldIndex}`)
            this.queue.temp.splice(evt.moved.newIndex, 0, this.queue.temp.splice(evt.moved.oldIndex, 1)[0])
            socket.send(JSON.stringify({
                action: "queue-move",
                from: evt.moved.oldIndex,
                to: evt.moved.newIndex
            }))
            this.getQueue()
            return true
        },
        repeat() {
            socket.send(JSON.stringify({
                action: "repeat"
            }))
            this.getCurrentMediaItem()
        },
        shuffle() {
            socket.send(JSON.stringify({
                action: "shuffle"
            }))
            this.getCurrentMediaItem()
        },
        setShuffle(val) {
            socket.send(JSON.stringify({
                action: "set-shuffle",
                shuffle: val
            }))
            this.getCurrentMediaItem()
        },
        getMediaPalette(data) {
            if (data != null && data['artwork'] != null){
            var palette = {
                '--bgColor': `#${data['artwork']['bgColor'] ?? '000000'}`,
                '--textColor1': `#${data['artwork']['textColor1'] ?? 'ffffff'}`,
                '--textColor2': `#${data['artwork']['textColor2'] ?? 'ffffff'}`,
                '--textColor3': `#${data['artwork']['textColor3'] ?? 'ffffff'}`,
                '--textColor4': `#${data['artwork']['textColor4'] ?? 'ffffff'}`
            }
            return palette } else {
              let u =  {
                    '--bgColor': `#${'000000'}`,
                    '--textColor1': `#${ 'ffffff'}`,
                    '--textColor2': `#${ 'ffffff'}`,
                    '--textColor3': `#${ 'ffffff'}`,
                    '--textColor4': `#${ 'ffffff'}`
                }
              return u  
            }
        },
        playAlbum(id, shuffle = false) {
            if (shuffle) {
                this.setShuffle(true)
            } else {
                this.setShuffle(false)
            }
            this.playMediaItemById(id, 'album');
        },
        playCustom(id, kind, shuffle = false) {
            if (shuffle) {
                this.setShuffle(true)
            } else {
                this.setShuffle(false)
            }
            this.playMediaItemById(id, kind);
        },
        getLyrics() {
            socket.send(JSON.stringify({
                action: "get-lyrics",
            }))
        },
        showLyrics() {
            this.getLyrics()
            this.screen = "lyrics"
        },
        showLyricsInline() {
            this.getLyrics()
            this.player.lowerPanelState = "lyrics"
        },
        parseLyrics() {
            var xml = this.stringToXml(this.player.lyricsMediaItem.ttml)
            var json = xmlToJson(xml);
            this.player.lyrics = json
        },
        stringToXml(st) {
            // string to xml
            var xml = (new DOMParser()).parseFromString(st, "text/xml");
            return xml;
        },
        canShowSearchTab(tab) {
            if (tab == this.search.tab || this.search.tab == "all") {
                return true;
            } else {
                return false;
            }
        },
        getCurrentMediaItem() {
            socket.send(JSON.stringify({
                action: "get-currentmediaitem"
            }))
        },
        setStreamerOverlay() {
            document.body.classList.add("streamer-overlay")
        },
        setMode(mode) {
            switch (mode) {
                default: this.screen = "player"
                break;
                case "miniplayer":
                        this.screen = "miniplayer"
                    break;
            }
        },
        connect() {
            let self = this;
            this.connectedState = 0;
            if (this.url === "") {
                this.url = prompt("Host IP", "localhost")
            }
            socket = new WebSocket(`ws://${this.url}:26369`);
            socket.onopen = (e) => {
                console.log(e);
                console.log('connected');
                app.connectedState = 1;
                if (getParameterByName("mode")) {
                    self.setMode(getParameterByName("mode"))
                } else {
                    self.setMode("default")
                }
                self.clearSelectedTrack()
            }

            socket.onclose = (e) => {
                console.log(e);
                console.log('disconnected');
                app.connectedState = 2;
            }

            socket.onerror = (e) => {
                console.log(e);
                console.log('error');
                app.connectedState = 2;
            }

            socket.onmessage = (e) => {
                console.log(e.data)
                const response = JSON.parse(e.data);
                switch (response.type) {
                    default: console.log(response);
                    break;
                    case "musickitapi.search":
                            self.showArtist(response.data["artists"][0]["id"]);
                        break;
                    case "musickitapi.playlist":    
                    case "musickitapi.album":
                            if (self.screen == "album-page") {
                                self.albumPage.data = response.data
                            }
                        break;
                    case "musickitapi.artist":
                            if (self.screen == "artist-page") {
                                self.artistPage.data = response.data
                            }
                        break;
                    case "queue":
                            self.player.queue = response.data;
                        self.queue.temp = response.data["_queueItems"];
                        self.$forceUpdate()
                        break;
                    case "lyrics":
                            self.player.lyrics = response.data;
                        self.$forceUpdate()
                        break;
                    case "searchResultsLibrary":
                            self.search.results = response.data;
                        self.search.state = 2;
                        break;
                    case "searchResults":
                            self.search.results = response.data;
                        self.search.state = 2;
                        break;
                    case "playbackStateUpdate":
                            if (!self.player.userInteraction) {
                                self.updatePlaybackState(response.data)
                            }
                        break;
                    case "maxVolume":
                        this.player.maxVolume = response.data;
                        break;
                }
                // console.log(e.data);
            }
        },
        updatePlaybackState(mediaitem) {
            var lyricsDisplayed = this.screen == "lyrics" || this.player.lowerPanelState == "lyrics"
            if (this.player.currentMediaItem["isrc"] != mediaitem["isrc"]) {
                if (lyricsDisplayed) {
                    this.getLyrics()
                }
                if (this.screen == "queue") {
                    this.getQueue()
                }
            }
            this.player.currentMediaItem = mediaitem
        },
        quit() {
            socket.send(JSON.stringify({
                action: "quit"
                }))
        }
    },
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

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
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};

window.onresize = function() {
    app.resetPlayerUI()
}

app.connect()