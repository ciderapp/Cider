// Apple Music Listen Now Page
// URL : https://amp-api.music.apple.com/v1/me/recommendations?timezone=+00:00
        //  &with=friendsMix,library,social&art[social-profiles:url]=c
        //  &name=listen-now&art[url]=c,f&omit[resource]=autos
        //  &relate[editorial-items]=contents
        //  &extend=editorialCard,editorialVideo
        //  &extend[albums]=artistUrl
        //  &extend[library-albums]=artistUrl
        //  &extend[playlists]=artistNames,editorialArtwork
        //  &extend[library-playlists]=artistNames,editorialArtwork
        //  &extend[social-profiles]=topGenreNames&include[albums]=artists
        //  &include[songs]=artists&include[music-videos]=artists
        //  &fields[albums]=artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url
        //  &fields[artists]=name,url&extend[stations]=airDate,supportsAirTimeUpdates&meta[stations]=inflectionPoints
        //  &types=artists,albums,editorial-items,library-albums,library-playlists,music-movies,music-videos,playlists,stations,uploaded-audios,uploaded-videos,activities,apple-curators,curators,tv-shows,social-profiles,social-upsells
        //  &l=en-gb&platform=web

await app.mk.api.personalRecommendations("",
        {
            name: "listen-now",
            with: "friendsMix,library,social",
            "art[social-profiles:url]":"c",
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
            l:"en-gb",
            platform:"web"
        },
        {
            includeResponseMeta: !0,
            reload: !0
        });

// Browse page
await app.mk.api.groupings("",
       {
            platform: "web",
            name: "music",
            l: "en-gb",
            "omit[resource:artists]": "relationships",
            "include[albums]": "artists",
            "include[songs]": "artists",
            "include[music-videos]": "artists",
            extend: "editorialArtwork,artistUrl",
            "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
            "art[url]": "f"
       });

// Radio page
await app.mk.api.recentRadioStations("",
            {l: "en-gb",
                "platform": "web",
                "art[url]": "f"});

// Recently Added
await app.mk.api.library.recentlyAdded({
    "platform": "web",
    include: {
        "library-albums": ["artists"],
        "library-artists": ["catalog"]
    },
    fields: {
        artists: ["url"],
        albums: "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url"
    },
    includeOnly: ["catalog", "artists"],
    limit: 25
}, {
    reload: !0,
    includePagination: !0
})

// Songs 
await app.mk.api.library.songs({limit: 100}).then((data)=>{
    console.log(data)
})

// Artists 
await app.mk.api.library.artists({limit: 100}).then((data)=>{
    console.log(data)
})

// Artists 
await app.mk.api.library.albums({limit: 100}).then((data)=>{
    console.log(data)
})

// Albums
// does not like limit = 100 for some reason
await app.mk.api.library.albums({limit: 50}).then((data)=>{
    console.log(data)
})

// Made For You
app.mk.api.recommendations("",{extend: "editorialArtwork,artistUrl"})

// Library with library length
await app.mk.api.library.songs("", {limit: 100}, {includeResponseMeta: !0}).then((data)=>{
    console.log(data)
})

// Artist View Top Songs
app.mk.api.artistView("325096253", "top-songs", {}, {view: "top-songs", includeResponseMeta: !0})

// Artist Page Data
app.mkapi("artists", false, "412778295", {
	"views": "featured-release,full-albums,appears-on-albums,featured-albums,featured-on-albums,singles,compilation-albums,live-albums,latest-release,top-music-videos,similar-artists,top-songs,playlists,more-to-hear,more-to-see",
	"extend": "artistBio,bornOrFormed,editorialArtwork,editorialVideo,isGroup,origin,hero",
	"extend[playlists]": "trackCount",
	"omit[resource:songs]": "relationships",
	"fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url,trackCount",
	"limit[artists:top-songs]": 20,
	"art[url]": "f"
}, {includeResponseMeta: !0}).then((data)=>{
    console.log(data)
})

// download entire library
var library = []
var downloaded = null;
function downloadChunk () {
    if (downloaded == null) {
        app.mk.api.library.songs("", {limit: 100}, {includeResponseMeta: !0}).then((response)=>{
            processChunk(response)
        })
    } else {
        downloaded.next("", {limit: 100}, {includeResponseMeta: !0}).then((response)=>{
            processChunk(response)
        })
    }
}
function processChunk (response) {
    downloaded = response
    library = library.concat(downloaded.data)
    if (downloaded.meta.total > library.length) {
        console.log(`downloading next chunk - ${library.length} songs so far`)
        downloadChunk()
    } else {
        console.log(library)
    }
}

//Some Available Functions from MusicKit
// recentPlayed() -> recently played songs ?

// create Artist / Song/ Album stations:
app.mk.setStationQueue({artist:"1258279972"})
app.mk.setStationQueue({song:"1437308307"}) // yes the song id here can be the albumId, but just keep using the song:

// Sorting Playlists, send an array of tracks in the format below
// playlist must be fully recursively downloaded first before sorting

app.mk.api.library.putPlaylistTracklisting(app.showingPlaylist.attributes.playParams.id, [
    {
        "id": relationships.tracks.data[X].id,
        "type": relationships.tracks.data[X].type
    },
    {
        "id": relationships.tracks.data[X].id,
        "type": relationships.tracks.data[X].type
    },
    {
        "id": relationships.tracks.data[X].id,
        "type": relationships.tracks.data[X].type
    },
])