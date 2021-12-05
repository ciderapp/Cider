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

Vue.component('mediaitem-scroller-horizontal-sp', {
    template: '#mediaitem-scroller-horizontal-sp',
    props: ['items'],
    methods: {}
});

Vue.component('mediaitem-scroller-horizontal-large', {
    template: '#mediaitem-scroller-horizontal-large',
    props: ['items'],
    methods: {}
});

Vue.component('mediaitem-square', {
    template: '#mediaitem-square',
    props: ['item'],
    methods: {}
});
Vue.component('mediaitem-square-sp', {
    template: '#mediaitem-square-sp',
    props: ['item'],
    methods: {}
});

Vue.component('mediaitem-square-large', {
    template: '#mediaitem-square-large',
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

Vue.component('lyrics-view', {
    template: '#lyrics-view',
    props: ["time", "lyrics"],
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
                meta: {total: 0, progress: 0},
                search: "",
                displayListing: [],
                downloadState: 0 // 0 = not started, 1 = in progress, 2 = complete
            },
            albums: {
                listing: [],
                meta: {total: 0}
            },
        },
        playlists: {
            listing: [],
            details: {}
        },
        mxmtoken: "",
        lyricon: false,
        lyrics: [],
        lyriccurrenttime: 0,
        lyricsMediaItem: {},
        lyricsDebug: {
                current: 0,
                start: 0,
                end: 0
        },
        chrome: {
            hideUserInfo: false,
            artworkReady: false,
            userinfo: {},
            menuOpened: false,
            maximized: false
        },
        page: "browse"
    },
    methods: {
        async init() {
            let self = this
            this.mk = MusicKit.getInstance()
            this.mk.authorize()
            this.$forceUpdate()

            // Set profile name
            this.chrome.userinfo = await this.mkapi("personalSocialProfile", false, "")

            this.mk.addEventListener(MusicKit.Events.playbackTimeDidChange, (a) => {
                self.playerLCD.playbackDuration = (self.mk.currentPlaybackTime)
                self.lyriccurrenttime = app.mk.currentPlaybackTime;

                // animated dot like AM - bad perf
                if (self.lyricon && self.drawertest){
                    let currentLine = document.querySelector(`.lyric-line.active`)
                    if (currentLine && currentLine.getElementsByClassName('lyricWaiting').length > 0){
                        let duration = currentLine.getAttribute("end") - currentLine.getAttribute("start");
                        let u = ( self.lyriccurrenttime - currentLine.getAttribute("start") ) / duration;                  
                        if (u < 0.25 && !currentLine.classList.contains('mode1')){
                             try{
                             currentLine.classList.add('mode1');    
                             currentLine.classList.remove('mode3');
                             currentLine.classList.remove('mode2');
                             } catch(e){}
                             currentLine.getElementsByClassName('WaitingDot1')[0].style.animation = `dotOpacity ${0.25 * duration}s cubic-bezier(0.42, 0, 0.58, 1) forwards`;
                             currentLine.getElementsByClassName('WaitingDot2')[0].style.animation = ``;
                             currentLine.getElementsByClassName('WaitingDot3')[0].style.animation = ``;
                             currentLine.getElementsByClassName('WaitingDot2')[0].style.opacity = 0.25;
                             currentLine.getElementsByClassName('WaitingDot3')[0].style.opacity = 0.25; 
     
                         } else if (u >= 0.25 && u < 0.5 && !currentLine.classList.contains('mode2')){
                             try{
                             currentLine.classList.add('mode2');    
                             currentLine.classList.remove('mode1');
                             currentLine.classList.remove('mode3');
                             }
                             catch(e){}
                             currentLine.getElementsByClassName('WaitingDot2')[0].style.animation = `dotOpacity ${0.25 * duration}s cubic-bezier(0.42, 0, 0.58, 1) forwards`;
                             currentLine.getElementsByClassName('WaitingDot1')[0].style.animation = ``;
                             currentLine.getElementsByClassName('WaitingDot3')[0].style.animation = ``;
                             currentLine.getElementsByClassName('WaitingDot1')[0].style.opacity = 1;
                             currentLine.getElementsByClassName('WaitingDot3')[0].style.opacity = 0.25;
                        } else if (u >= 0.5 && u < 0.75 && !currentLine.classList.contains('mode3')){
                             try{
                             currentLine.classList.add('mode3');
                             currentLine.classList.remove('mode1');
                             currentLine.classList.remove('mode2');
                             } catch(e){}
                             currentLine.getElementsByClassName('WaitingDot3')[0].style.animation = `dotOpacity ${0.25 * duration}s cubic-bezier(0.42, 0, 0.58, 1) forwards`;
                             currentLine.getElementsByClassName('WaitingDot1')[0].style.animation = ``;
                             currentLine.getElementsByClassName('WaitingDot2')[0].style.animation = ``;
                             currentLine.getElementsByClassName('WaitingDot1')[0].style.opacity = 1;
                             currentLine.getElementsByClassName('WaitingDot2')[0].style.opacity = 1;
                        } else if (u >= 0.75 && currentLine.classList.contains('mode3')){
                            try{
                             currentLine.classList.remove('mode1');
                             currentLine.classList.remove('mode2');
                             currentLine.classList.remove('mode3');}
                             catch(e){}
                             currentLine.getElementsByClassName('WaitingDot1')[0].style.animation = ``;
                             currentLine.getElementsByClassName('WaitingDot2')[0].style.animation = ``;
                             currentLine.getElementsByClassName('WaitingDot1')[0].style.opacity = 1;
                             currentLine.getElementsByClassName('WaitingDot2')[0].style.opacity = 1;
                              
                        }
     
                }}
            })

            this.mk.addEventListener(MusicKit.Events.nowPlayingItemDidChange, (a) => {
                self.chrome.artworkReady = false
                self.lyrics = []
                app.loadLyrics()
            })

            this.apiCall('https://api.music.apple.com/v1/me/library/playlists', res => {
                self.playlists.listing = res.data
            })
            document.body.removeAttribute("loading")
        },
        searchLibrarySongs() {
            let self = this
            if (this.library.songs.search == "") {
                this.library.songs.displayListing = this.library.songs.listing
            } else {
                this.library.songs.displayListing = this.library.songs.listing.filter(item => {
                    if(item.attributes.name.toLowerCase().includes(this.library.songs.search.toLowerCase())) {
                        return item
                    }
                })
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
        async getLibrarySongsFull() {
            let self = this
            let library = []
            let downloaded = null;
            if (this.library.songs.downloadState == 2 || this.library.songs.downloadState == 1) {
                return
            }
            this.library.songs.downloadState = 1

            function downloadChunk() {
                if (downloaded == null) {
                    app.mk.api.library.songs("", {limit: 100}, {includeResponseMeta: !0}).then((response) => {
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
                self.library.songs.meta.total = downloaded.meta.total
                self.library.songs.meta.progress = library.length
                if(typeof downloaded.next == "undefined") {
                    console.log("downloaded.next is undefined")
                }
                if (downloaded.meta.total > library.length || typeof downloaded.meta.next != "undefined") {
                    console.log(`downloading next chunk - ${library.length} songs so far`)
                    downloadChunk()
                } else {
                    self.library.songs.listing = library
                    self.library.songs.downloadState = 2
                    self.searchLibrarySongs()
                    console.log(library)
                }
            }

            downloadChunk()
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
        loadLyrics() {
            this.loadMXM();
        }, 
        loadAMLyrics(){
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
        loadMXM(){
            let attempt = 0;
            const track = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.title ?? '' : '');
            const artist = encodeURIComponent((this.mk.nowPlayingItem != null) ? this.mk.nowPlayingItem.artistName ?? '' : '');
            const time = encodeURIComponent((this.mk.nowPlayingItem != null) ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1);
            var lrcfile = "";
            const lang = "en" //  translation language
            function revisedRandId() {
                return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
            }
            /* get token */
            function getToken(mode, track, artist, songid, lang, time) {
                if (attempt > 2){
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
                            console.log('200 token',mode);
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
                req.send();}
            }
            function getMXMSubs(track, artist, token, lang, time) {
                var usertoken = encodeURIComponent(token);
                var timecustom = ( !time || (time && time < 0)) ? '': `&f_subtitle_length=${time}&q_duration=${time}&f_subtitle_length_max_deviation=40`;
                var url = "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&subtitle_format=lrc&q_artist=" + artist + "&q_track=" + track + "&usertoken=" + usertoken + timecustom + "&app_id=web-desktop-app-v1.0&t=" + revisedRandId();
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
                            }

                            if (lrcfile == "") {
                                console.log('track not found');
                                app.loadAMLyrics()
                            } else {
                                 // process lrcfile to json here
                                 app.lyricsMediaItem = lrcfile
                                 let u = app.lyricsMediaItem.split(/[\r\n]/);
                                 let preLrc = []
                                 for (var i =  u.length -1; i >= 0; i--) {
                                    let xline = (/(\[[0-9.:\[\]]*\])+(.*)/).exec(u[i])
                                    let end = (preLrc.length > 0) ? ((preLrc[preLrc.length-1].startTime) ?? 99999) : 99999
                                    preLrc.push({ startTime: app.toMS(xline[1].substring(1,xline[1].length - 2)) ?? 0, endTime: end, line: xline[2] })
                                 }
                                 app.lyrics = preLrc.reverse();
                                if (lrcfile != null && lrcfile != '') {
                                    // load translation
                                   getMXMTrans(id, lang, token);
                                } else {
                                    app.loadAMLyrics()
                                }
                            }
                        } catch (e) {
                            console.log(e);
                            console.log('track not found ??');
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
                                let lyrics = jsonResponse2["message"]["body"]["translations_list"];
                                if (lyrics.length > 0) {
                                    // convert translations to suitable json
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

            if (track != "" & track != "No Title Found"){
                if ( app.mxmtoken != null && app.mxmtoken != '' ) {
                console.log("we good");
                getMXMSubs(track, artist, app.mxmtoken, lang, time)
                } else {
                console.log("get token");
                getToken(1,track, artist, '', lang, time);
                }
            }	
        },
        toMS(str) {
            let rawTime = str.match(/(\d+:)?(\d+:)?(\d+)(\.\d+)?/);
            let hours = (rawTime[2] != null) ? (rawTime[1].replace(":", "")) : 0;
            let minutes = (rawTime[2] != null) ? (hours * 60 + rawTime[2].replace(":", "") * 1 ) : ((rawTime[1] != null) ? rawTime[1].replace(":", "")  : 0);
            let seconds = (rawTime[3] != null) ? (rawTime[3]) : 0;
            let milliseconds = (rawTime[4] != null) ? (rawTime[4].replace(".", "") ) : 0
            return parseFloat(`${minutes * 60 + seconds * 1 }.${milliseconds * 1}`) ;
        },
        parseTTML(){
            this.lyrics = [];
            let preLrc = [];
            let xml = this.stringToXml(this.lyricsMediaItem);
            let lyricsLines = xml.getElementsByTagName('p');
            let synced = true;
            let endTimes = [];
            if (xml.getElementsByTagName('tt')[0].getAttribute("itunes:timing") === "None"){
                synced = false;
              }
            endTimes.push(0);
            if (synced) {
            for (element of lyricsLines){
                start = this.toMS(element.getAttribute('begin'))
                end = this.toMS(element.getAttribute('end'))
                if (start - endTimes[endTimes.length - 1] > 5 && endTimes[endTimes.length - 1] != 0 ){
                    preLrc.push({startTime: endTimes[endTimes.length - 1],endTime: start, line: "lrcInstrumental"});
                }
                preLrc.push({startTime: start ,endTime: end, line: element.textContent}); 
                endTimes.push(end);
            }
            // first line dot
            if (preLrc.length > 0)               
                preLrc.unshift({startTime: 0,endTime: preLrc[0].startTime, line: "lrcInstrumental"});
            } else {
                for (element of lyricsLines){
                    preLrc.push({startTime: 9999999 ,endTime: 9999999 , line: element.textContent}); 
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
            return parseFloat(this.hmsToSecondsOnly(this.parseTime(this.mk.nowPlayingItem.attributes.durationInMillis - app.mk.currentPlaybackTimeRemaining *1000)));
        },
        getLyricClass(start, end) {
            //this.lyriccurrenttime = app.getCurrentTime();
            if (this.lyriccurrenttime >= start && this.lyriccurrenttime <= end) {
                setTimeout(() => {
                    if (document.querySelector(".lyric-line.active")) {
                        document.querySelector(".lyric-line.active").scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        })
                    }
                }, 200)
                return true;
            } else {
                return false;
            }
        },
        seekTo(time){
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
            if (truekind == "radioStations") {
                this.mk.setStationQueue({url: raurl}).then(function (queue) {
                    MusicKit.getInstance().play()
                });
            } else {
                this.mk.setQueue({[truekind]: [id]}).then(function (queue) {
                    MusicKit.getInstance().play()
                })
            }
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
            if (!this.mkReady()) {
                return ""
            }
            try {
                if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
                    return `${this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"].replace('{w}', size).replace('{h}', size)}`;
                } else {
                    return "";
                }
            } catch (e) {
                return ""
                // Does not work
                // this.mk.api.library.song(this.mk.nowPlayingItem.id).then((data) => {
                //     try {
                //         if (data != null && data !== "") {
                //             //document.getElementsByClassName("bg-artwork")[0].setAttribute('src', `${data["attributes"]["artwork"]["url"]}`)
                //             return  `${data["attributes"]["artwork"]["url"]}`;
                //         } else {
                //             return "https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg";
                //         }
                //     } catch (e) {
                //         return "https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg";
                //     }

                // });
            }
        },
        getNowPlayingArtwork(size = 600) {
            try {
                if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
                    return `url(${this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"].replace('{w}', size).replace('{h}', size)})`;
                } else {
                    return "";
                }
            } catch (e) {
                return ""
                // Does not work
                // this.mk.api.library.song(this.mk.nowPlayingItem.id).then((data) => {
                //     try {
                //         if (data != null && data !== "") {
                //             return  `url(${data["attributes"]["artwork"]["url"]})`;
                //         } else {
                //             return "url(https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg)";
                //         }
                //     } catch (e) {
                //         return "url(https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg)";
                //     }

                // });
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
    console.log("Loading musickit")
    ipcRenderer.on('devkey', (event, key) => {
        console.log(key);
        MusicKit.configure({
            developerToken: key,
            app: {
                name: 'My Cool Web App',
                build: '1978.4.1'
            }
        });
        setTimeout(() => {
            app.init()
        }, 1000)
    })
});

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