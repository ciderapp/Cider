const wsapi = {
    cache: {playParams: {id: 0}, status: null, remainingTime: 0},
    playbackCache: {status: null, time: Date.now()},
    async v3(encoded = "") {
        let decoded = atob(encoded);
        let json = JSON.parse(decoded);
        console.log(json)
        let response = await (await MusicKit.getInstance().api.v3.music(json.route, json.body, json.options))
        let ret = response.data
        return JSON.stringify(ret)
    },
    search(term, limit) {
        MusicKit.getInstance().api.search(term, {limit: limit, types: 'songs,artists,albums,playlists'}).then((results)=>{
            ipcRenderer.send('wsapi-returnSearch', JSON.stringify(results))
        })
    },
    searchLibrary(term, limit) {
        MusicKit.getInstance().api.library.search(term, {limit: limit, types: 'library-songs,library-artists,library-albums,library-playlists'}).then((results)=>{
            ipcRenderer.send('wsapi-returnSearchLibrary', JSON.stringify(results))
        })
    },
    getAttributes: function () {
        const mk = MusicKit.getInstance();
        const nowPlayingItem = mk.nowPlayingItem;
        const isPlayingExport = mk.isPlaying;
        const remainingTimeExport = mk.currentPlaybackTimeRemaining;
        const attributes = (nowPlayingItem != null ? nowPlayingItem.attributes : {});

        attributes.status = isPlayingExport ? isPlayingExport : false;
        attributes.name = attributes.name ? attributes.name : 'No Title Found';
        attributes.artwork = attributes.artwork ? attributes.artwork : {url: ''};
        attributes.artwork.url = attributes.artwork.url ? attributes.artwork.url : '';
        attributes.playParams = attributes.playParams ? attributes.playParams : {id: 'no-id-found'};
        attributes.playParams.id = attributes.playParams.id ? attributes.playParams.id : 'no-id-found';
        attributes.albumName = attributes.albumName ? attributes.albumName : '';
        attributes.artistName = attributes.artistName ? attributes.artistName : '';
        attributes.genreNames = attributes.genreNames ? attributes.genreNames : [];
        attributes.remainingTime = remainingTimeExport ? (remainingTimeExport * 1000) : 0;
        attributes.durationInMillis = attributes.durationInMillis ? attributes.durationInMillis : 0;
        attributes.startTime = Date.now();
        attributes.endTime = attributes.endTime ? attributes.endTime : Date.now();
        attributes.volume = mk.volume;
        attributes.shuffleMode = mk.shuffleMode;
        attributes.repeatMode = mk.repeatMode;
        attributes.autoplayEnabled = mk.autoplayEnabled;
        return attributes
    },
    moveQueueItem(oldPosition, newPosition) {
        MusicKit.getInstance().queue._queueItems.splice(newPosition,0,MusicKit.getInstance().queue._queueItems.splice(oldPosition,1)[0])
        MusicKit.getInstance().queue._reindex()
    },
    setAutoplay(value) {
        MusicKit.getInstance().autoplayEnabled = value
    },
    returnDynamic(data, type) {
        ipcRenderer.send('wsapi-returnDynamic', JSON.stringify(data), type)
    },
    musickitApi(method, id, params, library = false) {
        if (library) {
            MusicKit.getInstance().api.library[method](id, params).then((results)=>{
                ipcRenderer.send('wsapi-returnMusicKitApi', JSON.stringify(results), method)
            })
        } else {
            MusicKit.getInstance().api[method](id, params).then((results)=>{
                ipcRenderer.send('wsapi-returnMusicKitApi', JSON.stringify(results), method)
            })
        }
    },
    getPlaybackState () {
        ipcRenderer.send('wsapi-updatePlaybackState', MusicKitInterop.getAttributes());
    },
    getLyrics() {
        ipcRenderer.send('wsapi-returnLyrics',JSON.stringify(app.lyrics));
    },
    getQueue() {
        ipcRenderer.send('wsapi-returnQueue', JSON.stringify(MusicKit.getInstance().queue))
    },
    playNext(type, id) {
        var request = {}
        request[type] = id
        MusicKit.getInstance().playNext(request)
    },
    playLater(type, id) {
        var request = {}
        request[type] = id
        MusicKit.getInstance().playLater(request)
    },
    love() {

    },
    playTrackById(id, kind = "song") {
        MusicKit.getInstance().setQueue({ [kind]: id , parameters : {l : app.mklang}}).then(function (queue) {
            MusicKit.getInstance().play()
        })
    },
    quickPlay(term) {
        // Quick play by song name
        MusicKit.getInstance().api.search(term, { limit: 2, types: 'songs' }).then(function (data) {
            MusicKit.getInstance().setQueue({ song: data["songs"][0]["id"],parameters : {l : app.mklang} }).then(function (queue) {
                MusicKit.getInstance().play()
            })
        })
    },
    toggleShuffle() {
        MusicKit.getInstance().shuffleMode = MusicKit.getInstance().shuffleMode === 0 ? 1 : 0
    },
    togglePlayPause() {
        app.mk.isPlaying ? app.mk.pause() : app.mk.play()
    },
    toggleRepeat() {
        if (MusicKit.getInstance().repeatMode == 0) {
            MusicKit.getInstance().repeatMode = 1
        } else if (MusicKit.getInstance().repeatMode == 1){
            MusicKit.getInstance().repeatMode = 2
        } else {
            MusicKit.getInstance().repeatMode = 0
        }
    },
    getmaxVolume() {
        ipcRenderer.send('wsapi-returnvolumeMax',JSON.stringify(app.cfg.audio.maxVolume));
    },
    getLibraryStatus(kind, id) {
        if (kind === undefined || id === "no-id-found") return;

        let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;
        app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/?ids[${truekind}]=${id}`, {
            relate: "library",
            fields: "inLibrary"
        }).then(data => {
            const res = data.data.data[0];
            const inLibrary = res && res.attributes && res.attributes.inLibrary;

            app.getRating({ type: truekind, id: id }).then(rating => {
                ipcRenderer.send('wsapi-libraryStatus', inLibrary, rating);
            })
        })
    },
    rate(kind, id, rating) {
        if (kind === undefined || id === "no-id-found") return;

        let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;

        if (rating === 0) {
            app.mk.api.v3.music(`/v1/me/ratings/${truekind}/${id}`, {}, {
                fetchOptions: {
                    method: "DELETE",
                }
            }).then(function () {
                ipcRenderer.send('wsapi-rate', kind, id, rating);
            })
        } else {
            app.mk.api.v3.music(`/v1/me/ratings/${truekind}/${id}`, {}, {
                fetchOptions: {
                    method: "PUT",
                    body: JSON.stringify({
                        "type": "rating",
                        "attributes": {
                            "value": rating
                        }
                    })
                }
            }).then(function () {
                ipcRenderer.send('wsapi-rate', kind, id, rating);
            })
        }
    },
    changeLibrary(kind, id, shouldAdd) {
        if (shouldAdd) {
            app.addToLibrary(id);
            ipcRenderer.send('wsapi-change-library', kind, id, shouldAdd);
        } else {
            let truekind = (!kind.endsWith("s")) ? (kind + "s") : kind;

            app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/?ids[${truekind}]=${id}`, {
                relate: "library",
                fields: "inLibrary"
            })
                .then(res => {
                    res = res.data.data[0]
                    if (res && res.relationships && res.relationships.library && res.relationships.library.data) {
                        const item = res.relationships.library.data[0];

                        if (item) {
                            app.removeFromLibrary(kind, item.id)
                        }

                        ipcRenderer.send('wsapi-change-library', kind, id, shouldAdd);
                    }
                });
        }
    }
}

export {wsapi}