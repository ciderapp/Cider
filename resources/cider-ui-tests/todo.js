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
/** This will return 100 tracks in an array, however
 * the library total length is not returned but present in the network traffic response under
 * meta.total.  We need a way to get the full response from the network traffic.
 */
await app.mk.api.library.songs({limit: 100}).then((data)=>{
    console.log(data)
})
