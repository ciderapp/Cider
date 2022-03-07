const MusicKitTools = {
    async v3Continuous (href, options = {}, reqOptions = {}) {
        let returnData = []
        async function sendReq(href, options) {
            const response = await app.mk.api.v3.music(href, options)
            
            returnData = returnData.concat(response.data.data)
            if(response.data.next) {
                await sendReq(response.data.next, options)
            }
        }
        
        await sendReq(href, options)
        
        return returnData
    },
    getHeader() {
        return new Headers({
            Authorization: 'Bearer ' + MusicKit.getInstance().developerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Music-User-Token': '' + MusicKit.getInstance().musicUserToken
        });
    }
}

export { MusicKitTools }