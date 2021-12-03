// Made For You
app.mk.api.recommendations({extend: "editorialArtwork,artistUrl"})

// Library with library length
/** This will return 100 tracks in an array, however
 * the library total length is not returned but present in the network traffic response under
 * meta.total.  We need a way to get the full response from the network traffic.
 */
await app.mk.api.library.songs({limit: 100}).then((data)=>{
    console.log(data)
})
