const wsapi = {
    search(term, limit) {
        MusicKit.getInstance().api.search(term, {limit: limit, types: 'songs,artists,albums'}).then((results)=>{
            ipcRenderer.send('wsapi-returnSearch', JSON.stringify(results))
        })
    },
    searchLibrary(term, limit) {
        MusicKit.getInstance().api.library.search(term, {limit: limit, types: 'library-songs,library-artists,library-albums'}).then((results)=>{
            ipcRenderer.send('wsapi-returnSearchLibrary', JSON.stringify(results))
        })
    },
    moveQueueItem(oldPosition, newPosition) {
        MusicKit.getInstance().queue._queueItems.splice(newPosition,0,MusicKit.getInstance().queue._queueItems.splice(oldPosition,1)[0])
        MusicKit.getInstance().queue._reindex()
    },
    setAutoplay(value) {
        MusicKit.getInstance().autoplayEnabled = value
    },
    getPlaybackState () {
        ipcRenderer.send('wsapi-updatePlaybackState', MusicKitInterop.getAttributes());
    },
    getLyrics() {
        _lyrics.GetLyrics(1, false)
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
    playTrackById(id) {
        MusicKit.getInstance().setQueue({ song: id }).then(function (queue) {
            MusicKit.getInstance().play()
        })
    },
    quickPlay(term) {
        // Quick play by song name
        MusicKit.getInstance().api.search(term, { limit: 2, types: 'songs' }).then(function (data) {
			MusicKit.getInstance().setQueue({ song: data["songs"][0]["id"] }).then(function (queue) {
				MusicKit.getInstance().play()
			})
		})
    },
    toggleShuffle() {
        MusicKit.getInstance().shuffleMode = MusicKit.getInstance().shuffleMode === 0 ? 1 : 0
    },
    toggleRepeat() {
        if(MusicKit.getInstance().repeatMode == 0) {
            MusicKit.getInstance().repeatMode = 2
        }else if(MusicKit.getInstance().repeatMode == 2){
            MusicKit.getInstance().repeatMode = 1
        }else{
            MusicKit.getInstance().repeatMode = 0
        }
    }
}