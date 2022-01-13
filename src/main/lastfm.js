const {app, Notification} = require('electron'),
    fs = require('fs'),
    {resolve} = require('path'),
    sessionPath = resolve(app.getPath('userData'), 'session.json'),
    apiCredentials = require('../../resources/lfmApiCredentials.json'),
    LastfmAPI = require('lastfmapi');

const lfm = {
    authenticateFromFile: function () {
        let sessionData = require(sessionPath)
        console.log("[LastFM][authenticateFromFile] Logging in with Session Info.")
        app.lastfm.setSessionCredentials(sessionData.name, sessionData.key)
        console.log("[LastFM][authenticateFromFile] Logged in.")
    },

    authenticate: function () {
        if (app.cfg.get('lastfm.auth_token')) {
            app.cfg.set('lastfm.enabled', true);
        }

        if (!app.cfg.get('lastfm.enabled') || !app.cfg.get('lastfm.auth_token')) {
            app.cfg.set('lastfm.enabled', false);
            return
        }

        const lfmAPI = new LastfmAPI({
            'api_key': apiCredentials.key,
            'secret': apiCredentials.secret
        });

        app.lastfm = Object.assign(lfmAPI, {cachedAttributes: false, cachedNowPlayingAttributes: false});

        fs.stat(sessionPath, function (err) {
            if (err) {
                console.error("[LastFM][Session] Session file couldn't be opened or doesn't exist,", err)
                console.log("[LastFM][Auth] Beginning authentication from configuration")
                app.lastfm.authenticate(app.cfg.get('lastfm.auth_token'), function (err, session) {
                    if (err) {
                        throw err;
                    }
                    console.log("[LastFM] Successfully obtained LastFM session info,", session); // {"name": "LASTFM_USERNAME", "key": "THE_USER_SESSION_KEY"}
                    console.log("[LastFM] Saving session info to disk.")
                    let tempData = JSON.stringify(session)
                    fs.writeFile(sessionPath, tempData, (err) => {
                        if (err)
                            console.log("[LastFM][fs]", err)
                        else {
                            console.log("[LastFM][fs] File was written successfully.")
                            lfm.authenticateFromFile()
                            new Notification({
                                title: app.getName(),
                                body: "Successfully logged into LastFM using Authentication Key."
                            }).show()
                        }
                    })
                });
            } else {
                lfm.authenticateFromFile()
            }
        })
    },

    scrobbleSong: async function (attributes) {
        await new Promise(resolve => setTimeout(resolve, Math.round(attributes.durationInMillis * (app.cfg.get('lastfm.scrobble_after') / 100))));
        const currentAttributes = app.media;
        
        if (!app.lastfm || app.lastfm.cachedAttributes === attributes ) {
            return
        }

        if (app.lastfm.cachedAttributes) {
            if (app.lastfm.cachedAttributes.playParams.id === attributes.playParams.id) return;
        }

        if (currentAttributes.status && currentAttributes === attributes) {
            if (fs.existsSync(sessionPath)) {
                // Scrobble playing song.
                if (attributes.status === true) {
                    app.lastfm.track.scrobble({
                        'artist': lfm.filterArtistName(attributes.artistName),
                        'track': attributes.name,
                        'album': attributes.albumName,
                        'albumArtist': this.filterArtistName(attributes.artistName),
                        'timestamp': new Date().getTime() / 1000
                    }, function (err, scrobbled) {
                        if (err) {
                            return console.error('[LastFM] An error occurred while scrobbling', err);
                        }

                        console.log('[LastFM] Successfully scrobbled: ', scrobbled);
                    });
                    app.lastfm.cachedAttributes = attributes
                }
            } else {
                this.authenticate();
            }
        } else {
            return console.log('[LastFM] Did not add ', attributes.name , '-' , lfm.filterArtistName(attributes.artistName), 'because now playing a other song.');
        }
    },

    filterArtistName: function (artist) {
        if (!app.cfg.get('lastfm.enabledRemoveFeaturingArtists')) return artist;

        artist = artist.split(' ');
        if (artist.includes('&')) {
            artist.length = artist.indexOf('&');
        }
        if (artist.includes('and')) {
            artist.length = artist.indexOf('and');
        }
        artist = artist.join(' ');
        if (artist.includes(',')) {
            artist = artist.split(',')
            artist = artist[0]
        }
        return artist.charAt(0).toUpperCase() + artist.slice(1);
    },

    updateNowPlayingSong: function (attributes) {
        if (!app.lastfm ||app.lastfm.cachedNowPlayingAttributes === attributes  | !app.cfg.get('lastfm.NowPlaying')) {
            return
        }

        if (app.lastfm.cachedNowPlayingAttributes) {
            if (app.lastfm.cachedNowPlayingAttributes.playParams.id === attributes.playParams.id) return;
        }

        if (fs.existsSync(sessionPath)) {
            // update Now Playing
            if (attributes.status === true) {
                app.lastfm.track.updateNowPlaying({
                   'artist': lfm.filterArtistName(attributes.artistName),
                   'track': attributes.name,
                   'album': attributes.albumName,
                   'albumArtist': this.filterArtistName(attributes.artistName)
                }, function (err, nowPlaying) {
                    if (err) {
                        return console.error('[LastFM] An error occurred while updating nowPlayingSong', err);
                    }

                    console.log('[LastFM] Successfully updated nowPlayingSong', nowPlaying);                 
                });
                app.lastfm.cachedNowPlayingAttributes = attributes
            }
            
        } else {
            this.authenticate()
        }
    }
}

module.exports = lfm;