
try {
    /* Add AM Lyrics Font JP, JR */
    var headID = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.setAttribute('name','fonts');
    headID.appendChild(link);
    link.href = "//www.apple.com/wss/fonts?families=SF+Pro,v3|SF+Pro+Icons,v3|SF+Pro+KR,v2|SF+Pro+JP,v1";
    function GetXPath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    var setInnerHTML = function (elm, html) {
        elm.innerHTML = html;
        Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    };

    function matchRuleShort(str, rule) {
        var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
    }

    if (typeof activeEventListeners == "undefined") {
        var activeEventListeners = {}
    }

    var preferences = ipcRenderer.sendSync('getStore');

    /* Variables that are utilised by the renderer */
    if (typeof AM == "undefined") {
        var AM = {
            acrylicSupported: false,
            themesListing: [],
        }
    }

    /* Create the miniPlayer Functions */
    if (typeof _miniPlayer == "undefined") {
        var _miniPlayer = {
            active: false,
            init() {
                const webChrome = document.querySelector(".web-chrome");
                const elements = {
                    artwork: document.createElement("div"),
                    webNavContainer: document.querySelector("#web-navigation-container"),
                    menuicon: document.querySelector(".menuicon")
                };
                elements.artwork.classList.add("miniPlayerArtwork");
                elements.artwork.style.display = "none";
                elements.artwork.addEventListener("contextmenu", () => {
                    ipcRenderer.send("show-miniplayer-menu");
                });
                elements.artwork.addEventListener("click", () => {
                    if (webChrome.style.display === "") {
                        webChrome.style.display = "flex";
                    } else {
                        webChrome.style.display = "";
                    }
                });
                document.querySelector("#web-main").appendChild(elements.artwork);
                if (window.innerWidth < 500) {
                    /* Resize if window was closed in Mini Player */
                    ipcRenderer.send("resize-window", 1024, 600);
                }
            },
            setMiniPlayer(val) {
                const webChrome = document.querySelector(".web-chrome");
                const artwork = document.querySelector(".miniPlayerArtwork");
                if (val) {
                    self.active = true;
                    document.body.setAttribute("data-miniplayer", 1);
                    artwork.style.display = "block";
                } else {
                    self.active = false;
                    webChrome.style.display = "";
                    document.body.removeAttribute("data-miniplayer");
                    artwork.style.display = "none";
                }
            }
        };
    }

    /* Lyrics Functions */
    if (typeof _lyrics == "undefined") {
        var _lyrics = {
            current: [],
            events: [],
            onchange (fn = ()=>{}) {
                this.events.push(fn)
            },
            setLyrics(lyrics) {
                this.current = lyrics;
                this.events.forEach((event)=>{
                   event(lyrics);
                });
            },
            CreateButton: () => {

                const mediaControlsElement = document.querySelector('.web-chrome-controls-container');

                /* Chromecast / Airplay Button */
                    if (!document.querySelector('#airplayButton') && mediaControlsElement) {
                        const lyricsButton = document.createElement("div");
                        lyricsButton.style.height = "22px";
                        lyricsButton.style.width = "30px";
                        lyricsButton.style.marginInlineEnd = "12px";
                        lyricsButton.style.zIndex = "9999";
                        lyricsButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width: "100%" height: "100%" viewBox: "0 0 30 22" version="1.1" style: "fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421"><path d="M16.811,12.75c0.245,-0.355 0.389,-0.786 0.389,-1.25c0,-1.215 -0.985,-2.2 -2.2,-2.2c-1.215,0 -2.2,0.985 -2.2,2.2c0,0.466 0.145,0.898 0.392,1.254l-0.83,1.047c-0.537,-0.616 -0.862,-1.42 -0.862,-2.301c0,-1.933 1.567,-3.5 3.5,-3.5c1.933,0 3.5,1.567 3.5,3.5c0,0.879 -0.324,1.683 -0.859,2.297l-0.83,-1.047Zm1.271,1.604c0.694,-0.749 1.118,-1.752 1.118,-2.854c0,-2.32 -1.88,-4.2 -4.2,-4.2c-2.32,0 -4.2,1.88 -4.2,4.2c0,1.103 0.425,2.107 1.121,2.857l-0.814,1.028c-0.993,-0.995 -1.607,-2.368 -1.607,-3.885c0,-3.038 2.462,-5.5 5.5,-5.5c3.038,0 5.5,2.462 5.5,5.5c0,1.515 -0.613,2.887 -1.604,3.882l-0.814,-1.028Zm1.252,1.58c1.151,-1.126 1.866,-2.697 1.866,-4.434c0,-3.424 -2.776,-6.2 -6.2,-6.2c-3.424,0 -6.2,2.776 -6.2,6.2c0,1.739 0.716,3.311 1.869,4.437l-0.811,1.023c-1.452,-1.368 -2.358,-3.308 -2.358,-5.46c0,-4.142 3.358,-7.5 7.5,-7.5c4.142,0 7.5,3.358 7.5,7.5c0,2.15 -0.905,4.089 -2.355,5.457l-0.811,-1.023Zm-0.227,2.066l-8.219,0c-0.355,0 -0.515,-0.434 -0.27,-0.717l4.058,-5.12c0.178,-0.217 0.474,-0.217 0.652,0l4.058,5.12c0.237,0.283 0.085,0.717 -0.279,0.717Z" style="fill-rule:nonzero"/></svg>`;
                        lyricsButton.id = "airplayButton";
                        lyricsButton.className = "web-chrome-playback-controls__platter-toggle-buttons web-chrome-playback-controls__meta-btn";
                        mediaControlsElement.insertBefore(lyricsButton, mediaControlsElement.childNodes[4]);
                }
                /* Create the Button */
                if (!document.querySelector('[aria-label="Lyrics"]') && mediaControlsElement) {
                    const lyricsButton = document.createElement("div");
                    lyricsButton.classList.add('web-chrome-playback-controls__platter-toggle-buttons', 'web-chrome-playback-control__lyrics-button');
                    lyricsButton.style.marginInlineEnd = "0";
                    lyricsButton.style.width = "auto";
                    lyricsButton.style.zIndex = "9999";
                    lyricsButton.innerHTML = `
                        <button id="lyricsButton" aria-haspopup="list" aria-expanded="false" class="button-reset web-chrome-playback-controls__meta-btn web-chrome-playback-controls__up-next-btn" aria-label="Lyrics" data-drop-area="" style="padding: 0;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 28 28">
                                <path id="path" d="M 14.4 12.2 C 14.4 11.1 15.2 10.3 16.4 10.3 C 17.7 10.3 18.5 11.3 18.5 12.7 C 18.5 14.7 16.8 15.9 15.8 15.9 C 15.5 15.9 15.3 15.7 15.3 15.5 C 15.3 15.3 15.4 15.1 15.7 15.1 C 16.5 14.9 17.1 14.4 17.4 13.7 L 17.2 13.7 C 17 14 16.6 14.1 16.1 14.1 C 15.1 14 14.4 13.2 14.4 12.2 Z M 9.5 12.2 C 9.5 11.1 10.3 10.3 11.5 10.3 C 12.8 10.3 13.6 11.3 13.6 12.7 C 13.6 14.7 11.9 15.9 10.9 15.9 C 10.6 15.9 10.4 15.7 10.4 15.5 C 10.4 15.3 10.5 15.1 10.8 15.1 C 11.6 14.9 12.3 14.4 12.5 13.7 L 12.3 13.7 C 12.1 14 11.7 14.1 11.2 14.1 C 10.2 14 9.5 13.2 9.5 12.2 Z M 10.4 21.4 L 13.2 18.7 C 13.8 18.1 14.1 18 14.8 18 L 19.4 18 C 20.7 18 21.5 17.2 21.5 15.9 L 21.5 9.4 C 21.5 8 20.7 7.3 19.4 7.3 L 8.5 7.3 C 7.2 7.3 6.4 8 6.4 9.4 L 6.4 15.9 C 6.4 17.2 7.2 18 8.5 18 L 9.5 18 C 10.1 18 10.4 18.3 10.4 18.9 L 10.4 21.4 Z M 9.9 24 C 9 24 8.4 23.4 8.4 22.4 L 8.4 20.4 L 7.9 20.4 C 5.4 20.3 4 19 4 16.5 L 4 9 C 4 6.5 5.5 5 8.1 5 L 19.9 5 C 22.5 5 24 6.4 24 9 L 24 16.6 C 24 19.1 22.5 20.4 19.9 20.4 L 14.8 20.4 L 11.7 23.1 C 11 23.7 10.5 24 9.9 24 Z" /></path>
                            </svg>
                        </button>
                    `;
                    mediaControlsElement.insertBefore(lyricsButton, mediaControlsElement.childNodes[5]);


               
                let clonedElement2;

                clonedElement2 = document.querySelector('#airplayButton').cloneNode(true);
                document.querySelector('#airplayButton').replaceWith(clonedElement2);

                document.getElementById("airplayButton").addEventListener('click', function () {
                    try{AudioOutputs.castUI();
                    }catch(e){}
                });
            
                
                /* Lyric View for MV */
                if (!document.querySelector('#MVLyricsBox')){
                const lyricsMV = document.createElement("div");
                lyricsMV.id = "MVLyricsBox";
                lyricsMV.style.zIndex = 9999999;
                lyricsMV.style.backgroundColor= "rgba(0,0,0,0.7)";
                lyricsMV.style.display = "none";
                lyricsMV.style.color = "yellow";
                try{
                document.body.appendChild(lyricsMV);}
                catch(e){}
                lyricsMV.innerHTML = `<div id="mvlyrics"></div><div id="mvlyricstrans"></div>`;

                }

                /* Lyrics Button Click Event Handling */

                const upNextSideBarToggle = mediaControlsElement.childNodes[6].getElementsByTagName('button')[0];
                let clonedElement;
                if (document.querySelector("#lyricsButton") && upNextSideBarToggle) {

                    function openLyrics() {
                        document.body.classList.add("web-chrome-drawer-open");
                        document.body.classList.remove("web-chrome-drawer-opening");
                        document.querySelector('.web-chrome-drawer').removeEventListener('animationend', openLyrics, true);
                        document.querySelector('#lyricsButton').style.fill = 'var(--playerPlatterButtonIconFill)';
                        document.querySelector('#lyricsButton').style.boxShadow = '0 1px 1px rgb(0 0 0 / 10%)';
                        document.querySelector('#lyricsButton').style.background = 'var(--playerPlatterButtonBGFill)';
                        if (MusicKit.getInstance().nowPlayingItem == null) {
                            try {
                                document.getElementById('lyrics_none').classList.remove('lyrics_none_hidden');
                            } catch (e) {
                            }
                        } else {
                            try {
                                document.getElementById('lyrics_none').classList.add('lyrics_none_hidden');
                            } catch (e) {
                            }
                        }
                        if (document.getElementById('lyricer').childNodes[0].childNodes.length == null || document.getElementById('lyricer').childNodes[0].childNodes.length <= 1) {
                            _lyrics.GetLyrics(1, false);
                        }
                    }
                    function closeLyrics() {
                        document.body.classList.remove("web-chrome-drawer-open");
                        document.body.classList.remove("web-chrome-drawer-closing");
                        document.querySelector('.web-chrome-drawer').removeEventListener('animationend', closeLyrics, true);
                        document.querySelector('#lyricsButton').style.fill = 'var(--systemSecondary)';
                        document.querySelector('#lyricsButton').style.boxShadow = 'none';
                        document.querySelector('#lyricsButton').style.background = '0 0';
                    }

                    clonedElement = document.querySelector('#lyricsButton').cloneNode(true);
                    document.querySelector('#lyricsButton').replaceWith(clonedElement);


                    if (!document.getElementById("lyricer")) {

                        const sidebar = document.querySelector('.web-chrome-drawer');
                        if (sidebar) {
                            sidebar.innerHTML = `<div id="lyrics_none">Play a song to see the lyrics here.</div><div id="lyricer"></div>`;
                        }

                        let text = "";
                        let lrc = new Lyricer();
                        ipcRenderer.on('truelyrics', function (event, lrcfile) {
                            if (lrcfile.startsWith("netease=")) {
                                ipcRenderer.send('NetEaseLyricsHandler', lrcfile);
                            } else {
                                if (lrcfile!= null && lrcfile.length > 0)

                                lrc.setLrc(lrcfile);
                                
                            }
                        });
    
                        ipcRenderer.on('lyricstranslation', function (event, data) {
                            lrc.setMXMTranslation(data);
                        });
    
                        ipcRenderer.on('backuplyrics', function (_event, _data) {
                            _lyrics.GetLyrics(1, true);
                        });

                        ipcRenderer.on('backuplyricsMV', function (_event, _data) {
                            _lyrics.GetLyrics(1, false);
                        });

                        ipcRenderer.on('ProgressTimeUpdate', function (event, data) {
                            if (data < 0) {
                                data = 0
                            }
                            lrc.move(data);
                        });


                        lrc.setLrc(text);
                        document.addEventListener("lyricerclick", function (e) {
                            ipcRenderer.send('ProgressTimeUpdateFromLyrics', e.detail.time);
                            document.body.setAttribute("background-color", `var(--systemToolbarTitlebarMaterialSover-inactive)`);
                        });

                        _lyrics.GetLyrics(2, false);
                    }

                    document.getElementById("lyricsButton").addEventListener('click', function () {
                        if (document.querySelector('.web-chrome-drawer').querySelector('.web-navigation__up-next.web-chrome-up-next.up-next') == null) {

                            if (document.getElementsByClassName("web-chrome-drawer-open").length === 0) {
                                document.querySelector('.web-chrome-drawer').addEventListener('animationend', openLyrics, true);
                                document.body.classList.add("web-chrome-drawer-opening");
                            } else {
                                document.querySelector('.web-chrome-drawer').addEventListener('animationend', closeLyrics, true);
                                document.body.classList.add("web-chrome-drawer-closing");
                            }
                        } else {
                            try {
                                /* Checks for clicks on the up next sidebar toggle button */
                                if (upNextSideBarToggle.classList.contains('active')) {
                                    upNextSideBarToggle.click();
                                    document.querySelector('.web-chrome-drawer').addEventListener('animationend', openLyrics, true);
                                    document.body.classList.add("web-chrome-drawer-opening");
                                } else {
                                    document.querySelector('.web-chrome-drawer').style.backgroundColor = "";
                                    document.querySelector('.web-chrome-drawer').removeEventListener('animationend', openLyrics, true);
                                    document.querySelector('.web-chrome-drawer').removeEventListener('animationend', closeLyrics, true);
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        }
                        if (!document.getElementById("lyricer")) {

                            const sidebar = document.querySelector('.web-chrome-drawer');
                            if (sidebar) {
                                sidebar.innerHTML = `<div id="lyrics_none">Play a song to see the lyrics here.</div><div id="lyricer"></div>`;
                            }

                            let text = "";
                            let lrc = new Lyricer();
                            ipcRenderer.on('truelyrics', function (event, lrcfile) {
                                if (lrcfile.startsWith("netease=")) {
                                    ipcRenderer.send('NetEaseLyricsHandler', lrcfile);
                                } else {
                                    if (lrcfile!= null && lrcfile.length > 0)
                                        lrc.setLrc(lrcfile);
                                }
                            });
        
                            ipcRenderer.on('lyricstranslation', function (event, data) {
                                lrc.setMXMTranslation(data);
                            });
        
                            ipcRenderer.on('backuplyrics', function (_event, _data) {
                                _lyrics.GetLyrics(1, true);
                            });

                            ipcRenderer.on('backuplyricsMV', function (_event, _data) {
                                _lyrics.GetLyrics(1, false);
                            });

                            ipcRenderer.on('ProgressTimeUpdate', function (event, data) {
                                if (data < 0) {
                                    data = 0
                                }
                                lrc.move(data);
                            });


                            lrc.setLrc(text);
                            document.addEventListener("lyricerclick", function (e) {
                                ipcRenderer.send('ProgressTimeUpdateFromLyrics', e.detail.time);
                                document.body.setAttribute("background-color", `var(--systemToolbarTitlebarMaterialSover-inactive)`);
                            });

                            _lyrics.GetLyrics(2, false);
                        }
                    }, false);


                    upNextSideBarToggle.addEventListener('click', function () {
                        if (document.querySelector('#lyricsButton').style.fill === "var(--playerPlatterButtonIconFill)") {
                            document.querySelector('#lyricsButton').style.fill = 'var(--systemSecondary)';
                            document.querySelector('#lyricsButton').style.boxShadow = 'none';
                            document.querySelector('#lyricsButton').style.background = '0 0';
                        }
                    }, false);
                }
            }},

            GetLyrics: (mode, mxmfail) => {
                const musicType = (MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem["type"] ?? '' : '';
                const trackName = encodeURIComponent((MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem.title ?? '' : '');
                const artistName = encodeURIComponent((MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem.artistName ?? '' : '');
                const songID = (MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem["_songId"] ?? -1 : -1;
                const duration = encodeURIComponent(Math.round(MusicKitInterop.getAttributes()["durationInMillis"] / 1000));
                if (trackName !== '' && !(trackName === "No Title Found" && artistName === '')) {
                     /* MusixMatch Lyrics*/
                    if(musicType === "musicVideo" && preferences.visual.yton){
                        ipcRenderer.send('YTTranslation', trackName, artistName, preferences.visual.mxmlanguage);
                    } else/* MusixMatch Lyrics*/
                    if (!mxmfail && preferences.visual.mxmon) {
                        ipcRenderer.send('MXMTranslation', trackName, artistName, preferences.visual.mxmlanguage, duration);
                    }
                    /* Apple Lyrics (from api lyric query) */
                    else if (songID !== -1) {
                        MusicKit.getInstance().api.lyric(songID)
                            .then((response) => {
                                let seconds,
                                    minutes,
                                    hours,
                                    rawTime,
                                    milliseconds,
                                    lrcTime;

                                try {
                                    const ttmlLyrics = response["ttml"];
                                    let lyrics = "";
                                    let synced = true;
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(ttmlLyrics, "text/xml");
                                    console.log('sdx',doc.getElementsByTagName('tt')[0].getAttribute("itunes:timing") === "None");
                                    if (doc.getElementsByTagName('tt')[0].getAttribute("itunes:timing") === "None"){
                                      synced = false;
                                    }
                                    const lyricsLines = doc.getElementsByTagName('p');
                                    const endTime = [0];
                                    if (synced) {
                                    try {
                                        for (let element of lyricsLines) {
                                            rawTime = element.getAttribute('begin').match(/(\d+:)?(\d+:)?(\d+)(\.\d+)?/);
                                            hours = (rawTime[2] != null) ? (rawTime[1].replace(":", "")) : "0";
                                            minutes = (rawTime[2] != null) ? (hours * 60 + rawTime[2].replace(":", "") * 1 + ":") : ((rawTime[1] != null) ? rawTime[1] : "00:");
                                            seconds = (rawTime[3] != null) ? (rawTime[3]) : "00";
                                            milliseconds = (rawTime[4] != null) ? (rawTime[4]) : ".000";
                                            lrcTime = minutes + seconds + milliseconds;
                                            const rawTime2 = element.getAttribute('end').match(/(\d+:)?(\d+:)?(\d+)(\.\d+)?/);
                                            const hours2 = (rawTime2[2] != null) ? (rawTime2[1].replace(":", "")) : "0";
                                            const minutes2 = (rawTime2[2] != null) ? (hours2 * 60 + rawTime2[2].replace(":", "") * 1 + ":") : ((rawTime2[1] != null) ? rawTime2[1] : "00:");
                                            const seconds2 = (rawTime2[3] != null) ? (rawTime2[3]) : "00";
                                            const milliseconds2 = (rawTime2[4] != null) ? (rawTime2[4]) : ".000";
                                            const lrcTime2 = minutes2 + seconds2 + milliseconds2;
                                            if (minutes.replace(":", "") * 60 + seconds * 1 - endTime[endTime.length - 1] > 10) {
                                                const time = endTime[endTime.length - 1];
                                                const minutes = Math.floor(time / 60);
                                                const secs = time - minutes * 60;
                                                lyrics = lyrics.concat(`[${minutes}:${secs}]lrcInstrumental` + "\r\n");
                                            }
                                            endTime.push(minutes2.replace(":", "") * 60 + seconds2 * 1);
                                            lyrics = lyrics.concat(`[${lrcTime}]${element.textContent}` + "\r\n");
                                        }
                                    } catch {
                                        lyrics = "";
                                        for (let element of lyricsLines) {
                                            rawTime = element.getAttribute('begin').match(/(\d+:)?(\d+:)?(\d+)(\.\d+)?/);
                                            hours = (rawTime[2] != null) ? (rawTime[1].replace(":", "")) : "0";
                                            minutes = (rawTime[2] != null) ? (hours * 60 + rawTime[2].replace(":", "") * 1 + ":") : ((rawTime[1] != null) ? rawTime[1] : "00:");
                                            seconds = (rawTime[3] != null) ? (rawTime[3]) : "00";
                                            milliseconds = (rawTime[4] != null) ? (rawTime[4]) : ".000";
                                            lrcTime = minutes + seconds + milliseconds;
                                            lyrics = lyrics.concat(`[${lrcTime}]${element.textContent}` + "\r\n");
                                        }
                                    }}
                                    else {
                                        try{
                                        var body = doc.getElementsByTagName('body')[0].innerHTML;
                                        if (document.getElementById("lyricer")) {
                                            var u = document.createElement('div');
                                            u.id = "unsynced";
                                            u.innerHTML = body;
                                            if (!document.getElementById("unsynced")){
                                            document.getElementById("lyricer").appendChild(u);} else {console.log('duped')}
                                        }
                                        } catch(e){}
                                        
                                    }
                                    let artworkURL = ((MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem.artworkURL : '').replace("{w}", 256).replace("{h}", 256);
                                    if (artworkURL == null) {
                                        artworkURL = "https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg";
                                    }
                                    if (mode === 1) {
                                        ipcRenderer.send('LyricsUpdate', lyrics, artworkURL);
                                    } else {
                                        ipcRenderer.send('LyricsHandler', lyrics, artworkURL);
                                    }
                                } catch (e) {
                                    console.error(e);
                                    if (mode === 1) {
                                        ipcRenderer.send('LyricsUpdate', "netease=" + trackName + " " + artistName, artworkURL);
                                    } else {
                                        ipcRenderer.send('LyricsHandler', "netease=" + trackName + " " + artistName, artworkURL);
                                    }
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                let artworkURL = (MusicKitInterop.getAttributes()["artwork"]["url"]).replace("{w}", 256).replace("{h}", 256);
                                if (artworkURL == null) {
                                    artworkURL = "https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg";
                                }
                                if (mode === 1) {
                                    ipcRenderer.send('LyricsUpdate', "netease=" + trackName + " " + artistName, artworkURL);
                                } else {
                                    ipcRenderer.send('LyricsHandler', "netease=" + trackName + " " + artistName, artworkURL);
                                }
                            });
                    }
                    /* Apple Lyrics (from api song query */
                    else {
                        try {
                            MusicKit.getInstance().api.library.song(MusicKit.getInstance().nowPlayingItem.id).then((data) => {
                                try {
                                    if (data != null && data !== "") {
                                        artworkURL = data["artwork"]["url"];
                                    } else {
                                        artworkURL = "https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg";
                                    }
                                } catch (e) {
                                    artworkURL = "https://beta.music.apple.com/assets/product/MissingArtworkMusic.svg";
                                }
                                if (mode === 1) {
                                    ipcRenderer.send('LyricsUpdate', "netease=" + trackName + " " + artistName, artworkURL);
                                } else {
                                    ipcRenderer.send('LyricsHandler', "netease=" + trackName + " " + artistName, artworkURL);
                                }
                            });
                        } catch (e) {
                            console.error(e);
                            if (mode === 1) {
                                ipcRenderer.send('LyricsUpdate', "netease=" + trackName + " " + artistName, '');
                            } else {
                                ipcRenderer.send('LyricsHandler', "netease=" + trackName + " " + artistName, '');
                            }
                        }
                    }
                }
            }
        }

    }

    /* Create the AMStyling Functions */
    if (typeof AMStyling == "undefined") {
        var AMStyling = {
            _styleSheets: {
                Transparency: new CSSStyleSheet(),
                Theme: new CSSStyleSheet(),
                Meta: new CSSStyleSheet(),
                Metrics: new CSSStyleSheet(),
                Scaling: new CSSStyleSheet()
            },
            wallpaper: "",
            lastTheme: "",
            micaActive: false,
            metrics: {
                lastScreenX: 0,
                lastScreenY: 0
            },
            showThemeOptions() {
                function throwNoTheme() {
                    new AMEModal({
                        content: `<div style="text-align:center;display:flex;justify-content: center;align-items: center;height:100%;">This theme has no available options.</div>`,
                        Style: {
                            width: "325px",
                            height: "200px"
                        }
                    });
                }

                if (this.lastTheme === "default" || this.lastTheme === "") {
                    throwNoTheme();
                    return;
                }
                if (AM.themesListing[AMStyling.lastTheme]["options"].length === 0) {
                    throwNoTheme();
                    return;
                }
                AMJavaScript.getRequest("ameres://html/theme-options.html", (content) => {
                    var vm = new Vue({
                        data: {
                            options: AM.themesListing[AMStyling.lastTheme]["options"],
                            userOptions: AMStyling.getThemeOptions(AMStyling.lastTheme),
                            theme: AM.themesListing[AMStyling.lastTheme]["name"]
                        },
                        methods: {
                            saveOptions() {
                                AMStyling.setThemeOptions(AMStyling.lastTheme, this.userOptions);
                            },
                            close() {
                                modal.close();
                            }
                        }
                    });
                    var modal = new AMEModal({
                        content: content,
                        CloseButton: false,
                        OnCreate() {
                            vm.$mount("#themeOptions-vue")
                        },
                        OnClose() {
                            _vues.destroy(vm)
                        },
                        Style: {
                            width: "50%",
                            height: "80%"
                        }
                    })
                });
            },
            getThemeOptions(theme) {
                if (!localStorage.getItem("ThemeOptions")) {
                    localStorage.setItem("ThemeOptions", "{}");
                }
                var userOptions = JSON.parse(localStorage.getItem("ThemeOptions"));
                if (!userOptions[theme]) {
                    userOptions[theme] = {};
                }

                function parseBool(val) {
                    return !(val === 0 || val === "false" || val === false);
                }

                AM.themesListing[theme]["options"].forEach((option) => {
                    if (typeof userOptions[theme][option.key] == "undefined" || userOptions[theme][option.key] == null) {
                        userOptions[theme][option.key] = parseBool(option.defaultValue);
                    }
                });
                localStorage.setItem("ThemeOptions", JSON.stringify(userOptions));
                return userOptions[theme];
            },
            setThemeOptions(theme, options = {}) {
                if (!localStorage.getItem("ThemeOptions")) {
                    localStorage.setItem("ThemeOptions", "{}");
                }
                let userOptions = JSON.parse(localStorage.getItem("ThemeOptions"));
                if (!userOptions[theme]) {
                    userOptions[theme] = {};
                }
                userOptions[theme] = options;
                localStorage.setItem("ThemeOptions", JSON.stringify(userOptions));
                this.refresh();
            },
            getWallpaper() {
                this.wallpaper = ipcRenderer.sendSync("get-wallpaper");
                this.updateMetrics()
            },
            updateMetrics() {
                this._styleSheets.Metrics.replaceSync(`
                    :root {
                        --user-wallpaper: url('${this.wallpaper}');
                        --screenX: ${window.screenX}px;
                        --screenY: ${window.screenY}px;
                        --screenHeight: ${screen.height}px;
                        --screenWidth: ${screen.width}px;
                    }
                    body::before {
                        display: none;
                    }
                `);
                this.refresh();
            },
            windowsWallpaperStyles: {
                fill: 10,
                fit: 6,
                stretch: 2,
                tile: 0,
                span: 22
            },
            updateMica() {
                if (!this.micaActive) {
                    return;
                }
                var micaElement = document.querySelector(".micaBackground");
                var style = ipcRenderer.sendSync("get-wallpaper-style");
                switch (style) {
                    default:
                    case 0:
                    case 2:
                    case 6:
                    case 10:
                        micaElement.style.backgroundSize = "repeat";
                        break;
                    case 22:
                        micaElement.style.backgroundSize = "cover";
                        break;
                }

            },
            setMica(val = false) {
                if (val) {
                    this.enableMica();
                } else {
                    this.disableMica();
                }
            },
            disableMica() {
                if (!this.micaActive) {
                    return;
                }
                this.micaActive = false;
                document.querySelector(".micaBackground").remove();
            },
            enableMica() {
                let self = this;
                if (this.micaActive) {
                    console.log("Mica is already active");
                    return;
                }
                if (this.lastTheme !== "winui") {
                    if (confirm("This feature currently requires the Eleven theme, enable now?")) {
                        this.loadTheme("winui");
                    }
                }
                this.micaActive = true;
                var micaDOM = document.createElement("div");
                micaDOM.classList.add("micaBackground");
                document.body.appendChild(micaDOM);
                this.getWallpaper();
                this.setTransparency(false);

                function onScreenMove(cb) {
                    let lastScreenX;
                    let lastScreenY;

                    function detectScreenMove() {
                        if (lastScreenY !== window.screenY || lastScreenX !== window.screenX) {
                            lastScreenY = window.screenY;
                            lastScreenX = window.screenX;
                            cb();
                        }
                        if (self.micaActive) {
                            requestAnimationFrame(detectScreenMove);
                        }
                    }

                    if (self.micaActive) {
                        requestAnimationFrame(detectScreenMove);
                    }
                }

                onScreenMove(function () {
                    micaDOM.style.backgroundPosition = `${window.screenX * -1}px ${window.screenY * -1}px`;
                    /**micaDOM.style.backgroundSize = `${screen.width}px ${screen.height}px`;**/
                    micaDOM.style.backgroundSize = `cover`;
                });
            },
            loadTheme(path = "", reload = false) {
                if (path === this.lastTheme && !reload) {
                    return;
                }
                this.lastTheme = path;
                let self = this;
                if (path === "" || path === " " || path === "default") {
                    self._styleSheets.Theme.replaceSync("");
                    self.refresh();
                    return;
                }

                ipcRenderer.invoke('themeFileExists', path).then((r) => {
                    if (r) {
                        const xhttp = new XMLHttpRequest();
                        xhttp.onload = function () {
                            self._styleSheets.Theme.replaceSync(this.responseText);
                            self.refresh();
                        };
                        xhttp.open("GET", `themes://${path}.css`, true);
                        xhttp.send();
                        console.warn("[Custom] Applied Theme");
                    } else {
                        console.error(`[Custom] ${path} does not exist.`)
                    }
                })


            },
            updateMeta() {

                if (MusicKit.getInstance().nowPlayingItem == null) {
                    try {
                        document.getElementById('lyrics_none').classList.remove('lyrics_none_hidden');
                    } catch (e) {
                    }
                } else {
                    try {
                        document.getElementById('lyrics_none').classList.add('lyrics_none_hidden');
                    } catch (e) {
                    }
                }

                console.warn("[Custom] Refreshed Meta CSS");
                /** Exposes artwork and other metadata to CSS for themes */
                let artwork = MusicKit.getInstance().nowPlayingItem["attributes"]["artwork"]["url"];
                /* Fix Itunes Match album arts not showing */
                if (artwork === '' || !artwork) {
                    try {
                        MusicKit.getInstance().api.library.song(MusicKit.getInstance().nowPlayingItem.id).then((data) => {
                            if (data !== "") {
                                artwork = data["artwork"]["url"];
                                document.querySelector('#ember13').getElementsByTagName('img')[0].src = artwork;
                                this._styleSheets.Meta.replaceSync(`
                                    :root {
                                        --musicKit-artwork-64: url("${artwork.replace("{w}", 64).replace("{h}", 64)}");
                                        --musicKit-artwork-256: url("${artwork.replace("{w}", 256).replace("{h}", 256)}");
                                        --musicKit-artwork-512: url("${artwork.replace("{w}", 512).replace("{h}", 512)}");
                                        --musicKit-artwork: url("${artwork.replace("{w}", 2000).replace("{h}", 2000)}");
                                    }
                                `);
                                
                                if (MusicKit.getInstance().nowPlayingItem.title != "" & !(MusicKit.getInstance().nowPlayingItem.title == "No Title Found" && MusicKit.getInstance().nowPlayingItem.artistName == "")){
                                    ipcRenderer.send('updateMiniPlayerArt',artwork.replace("{w}", 2000).replace("{h}", 2000));
                                    ipcRenderer.send('updateMiniPlayerMetaData',MusicKit.getInstance().nowPlayingItem.title,MusicKit.getInstance().nowPlayingItem.artistName,MusicKit.getInstance().nowPlayingItem.albumName);
                                    ipcRenderer.send('setupNewTrack',MusicKit.getInstance().nowPlayingItem.title,MusicKit.getInstance().nowPlayingItem.artistName,MusicKit.getInstance().nowPlayingItem.albumName,artwork.replace("{w}", 256).replace("{h}", 256));}

                        
                                this.refresh();
                            }
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
                
                this._styleSheets.Meta.replaceSync(`
                :root {
                    --musicKit-artwork-64: url("${artwork.replace("{w}", 64).replace("{h}", 64)}");
                    --musicKit-artwork-256: url("${artwork.replace("{w}", 256).replace("{h}", 256)}");
                    --musicKit-artwork-512: url("${artwork.replace("{w}", 512).replace("{h}", 512)}");
                    --musicKit-artwork: url("${artwork.replace("{w}", 2000).replace("{h}", 2000)}");
                }
            `);
            if ( (artwork === '' || !artwork) && MusicKit.getInstance().nowPlayingItem.title != "" & !(MusicKit.getInstance().nowPlayingItem.title == "No Title Found" && MusicKit.getInstance().nowPlayingItem.artistName == "")){
                ipcRenderer.send('updateMiniPlayerArt',artwork.replace("{w}", 2000).replace("{h}", 2000));
                ipcRenderer.send('updateMiniPlayerMetaData',MusicKit.getInstance().nowPlayingItem.title,MusicKit.getInstance().nowPlayingItem.artistName,MusicKit.getInstance().nowPlayingItem.albumName);
                ipcRenderer.send('setupNewTrack',MusicKit.getInstance().nowPlayingItem.title,MusicKit.getInstance().nowPlayingItem.artistName,MusicKit.getInstance().nowPlayingItem.albumName,artwork.replace("{w}", 256).replace("{h}", 256));}

                this.refresh();
            },
            setTransparency(val) {
                let self = this;
                if (val) {
                    const xhttp = new XMLHttpRequest();
                    xhttp.onload = function () {
                        self._styleSheets.Transparency.replaceSync(this.responseText);
                        self.refresh();
                    };
                    xhttp.open("GET", `ameres://css/transparency.css`, true);
                    xhttp.send();
                } else {
                    self._styleSheets.Transparency.replaceSync(`html body { background-color: var(--pageBG) !important; }`);
                }
            },
            refresh() {
                document.adoptedStyleSheets = Object.values(this._styleSheets);
                /** Theme Options **/
                if (AM.themesListing[this.lastTheme]) {
                    var themeOptions = (this.getThemeOptions(this.lastTheme));
                    Object.keys(themeOptions).forEach((option) => {
                        if (themeOptions[option]) {
                            document.body.setAttribute(`theme-${option}`, 1);
                        } else {
                            document.body.removeAttribute(`theme-${option}`);
                        }
                    })
                }
            },
            lerp: (start, end, l) => {
                return start + (end - start) * l;
            }
        };
    }

    /* Bulk AME JavaScript Functions */
    if (typeof AMJavaScript == "undefined") {
        var AMJavaScript = {
            getQuery(q) {
                return (window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [undefined, null])[1];
            },
            getRequest: (url, callback = () => {
            }) => {
                const xhttp = new XMLHttpRequest();
                xhttp.onload = function () {
                    callback(this.responseText);
                };
                xhttp.open("GET", url, true);
                xhttp.send();
            },
            LoadCustomStartup: async () => {
                const preferences = ipcRenderer.sendSync('getStore');

                /** Plugins */
                if (typeof _plugins != "undefined") {
                    await ipcRenderer.invoke("fetchPluginsListing").then((plugins) => {
                        console.log(plugins);
                        plugins.forEach((plugin) => {
                            _plugins.loadPlugin(plugin);
                        });
                    })
                }
                /** End Plugins */

                /** Expose platform to CSS */
                document.body.setAttribute("platform", navigator.platform);
                
                if (preferences.visual.frameType === "") {
                    document.body.setAttribute("frame-type", "disabled");
                } else {
                    document.body.setAttribute("frame-type", preferences.visual.frameType);
                }

                /* MiniPlayer Event Listener */
                MusicKit.getInstance().addEventListener(MusicKit.Events.mediaElementCreated, () => {
                    if (!document.querySelector('.media-artwork-v2__image').classList.contains('media-artwork-v2__image--fallback')) {
                        const artwork = document.querySelector('#ember13');
                        artwork.onclick = function () {
                            ipcRenderer.send("set-miniplayer", true);
                        };
                        /* Picture-in-picture icon should be overlayed over artwork when mouse over */
                    }
                });

                /* Audio Quality Selector */
                if (preferences.audio.audioQuality === 'extreme') {
                    console.warn("[Custom] Setting bitrate to 990.");
                    MusicKit.getInstance().bitrate = 990;
                } else if (preferences.audio.audioQuality === 'high') {
                    console.warn("[Custom] Setting bitrate to 256.");
                    MusicKit.getInstance().bitrate = 256;
                } else if (preferences.audio.audioQuality === 'standard') {
                    console.warn("[Custom] Setting bitrate to 64.");
                    MusicKit.getInstance().bitrate = 64;
                }

                /* Seamless (Apple dont know how to spell) Audio Playback */
                if (preferences.audio.seamlessAudioTransitions) {
                    console.warn("[Custom] Seamless Audio Transitions enabled.");
                    MusicKit.getInstance()._bag.features["seamless-audio-transitions"] = true;
                }

                /* Incognito Mode */
                if (preferences.general.incognitoMode) {
                    MusicKit.privateEnabled = true
                }

                /* Event Listener for Lyrics Update */
                MusicKit.getInstance().addEventListener(MusicKit.Events.playbackTimeDidChange, function () {
                    ipcRenderer.send('LyricsTimeUpdate', MusicKit.getInstance().currentPlaybackTime + 0.250);
                });
                MusicKit.getInstance().addEventListener(MusicKit.Events.nowPlayingItemDidChange, function () {
                    var EAtmpdisable = false;
                    var tempOutputID = -1;
                    try{
                        if (MusicKit.getInstance().nowPlayingItem["type"] === "musicVideo") {
                            try{
                            if(!GCOverride ){
                            MVsource = AMEx.context.createMediaElementSource(document.querySelector('apple-music-video-player').shadowRoot.querySelector('amp-video-player-internal').shadowRoot.querySelector('amp-video-player').shadowRoot.getElementById('apple-music-video-player'));  
                            MVsource.connect(windowAudioNode); 
                                                   }
                           
                        } catch(e){console.log(e);}
                        } else{
                            if (!GCOverride ) {   
                            try{
                                AMEx.result.source.connect(windowAudioNode);}
                                catch(e){}}
                        }
                    }catch(e){}
                    try{
                        if (MusicKit.getInstance().nowPlayingItem["type"] === "musicVideo") {
                            document.querySelector(`#MVLyricsBox`).style.display = 'block';
                        } else {
                            document.querySelector(`#MVLyricsBox`).style.display = 'none';
                        }
                        document.querySelector(`#MVLyricsBox`).childNodes[0].innerHTML= "";
                        document.querySelector(`#MVLyricsBox`).childNodes[1].innerHTML= "";
                    }
                    catch (e){}
                    try {
                        GetXPath("/html/body/div[4]/div[3]/div[3]/div/div[2]/div[1]/img").src = "https://music.apple.com/assets/product/MissingArtworkMusic.svg";
                    } catch (e) {
                    }
                    try {
                        let lrc = new Lyricer();
                        lrc.setLrc("");
                        lrc = null;
                    } catch (e) {
                    }

                    const sidebar = document.querySelector('.web-chrome-drawer');
                    if ((sidebar && document.body.classList.contains('web-chrome-drawer-open')) || (MusicKit.getInstance().nowPlayingItem != null && MusicKit.getInstance().nowPlayingItem["type"] == "musicVideo")) {
                        _lyrics.GetLyrics(1, false);
                    }


                });

                /* Mutation Observer to disable "seek error" alert */
                let observer = new MutationObserver(function (mutationList) {
                    for (const mutation of mutationList) {
                        for (const child of mutation.addedNodes) {
                            try {
                                if (document.getElementById("mk-dialog-title").textContent === "cancelled" || document.getElementById("mk-dialog-title").textContent.includes("The play") || document.getElementById("mk-dialog-title").textContent.includes("MEDIA_KEY")) {
                                    document.getElementById("musickit-dialog").remove();
                                    document.getElementById("musickit-dialog-scrim").remove();
                                    break;
                                }
                            } catch (e) {
                                break;
                            }
                        }
                    }

                });
                observer.observe(document.body, {childList: true});

                /* Load Themes and Transparency */
                AMStyling.loadTheme(preferences["visual"]["theme"]);
                if (preferences["visual"]["transparencyEffect"] !== "" && preferences["visual"]["transparencyEffect"] !== "mica") {
                    AMStyling.setTransparency(true);
                } else {
                    AMStyling.setTransparency(false);
                }

                if (preferences["visual"]["transparencyEffect"] === "mica") {
                    AMStyling.setMica(true);
                } else {
                    AMStyling.setMica(false);
                }

                AM.themesListing = await ipcRenderer.invoke('updateThemesListing');
                AM.acrylicSupported = await ipcRenderer.invoke('isAcrylicSupported');

                if (await ipcRenderer.invoke('getStoreValue', 'general.storefront') !== MusicKit.getInstance().storefrontId) {
                    await ipcRenderer.invoke('setStoreValue', 'general.storefront', MusicKit.getInstance().storefrontId);
                }

                /** Need a better way to find the user menu asap, this is embarrassing **/
                if(MusicKit.getInstance().authorizationStatus !== 0) {
                    var checkForUserMenu = setInterval(function () {
                        if (document.querySelectorAll(".web-chrome-controls-container>.web-navigation__auth").length) {
                            _tests.usermenuinit();
                            clearInterval(checkForUserMenu);
                        }
                    }, 100);
                }

            },
            LoadCustom: () => {
                const preferences = ipcRenderer.sendSync('getStore');

                /* Execute plugins OnNavigation */
                if (typeof _plugins != "undefined") {
                    _plugins.execute("OnNavigation");
                }

                /* Remove the Region Banner */
                while (document.getElementsByClassName('locale-switcher-banner').length > 0) {
                    document.getElementsByClassName('locale-switcher-banner')[0].remove()
                }

                /* Create the Custom Settings Context Menu */
                const buttonPath = (preferences.visual.frameType === 'mac-right' ? '//*[@id="web-main"]/div[4]/div/div[3]/div[3]/button' : '//*[@id="web-main"]/div[3]/div/div[3]/div[3]/button');
                if (GetXPath(buttonPath)) {
                    GetXPath(buttonPath).addEventListener('click', function () {
                        try {
                        if (document.querySelector('.context-menu__option--app-settings')) {
                            if (preferences.advanced.verboseLogging) console.log("[settingsInit] Preventing second button.");
                            return;
                        }

                        const ul = GetXPath("/html/body/div[6]/ul");

                        const amPreferences = GetXPath('/html/body/div[6]/ul/li[2]');
                        GetXPath('/html/body/div[6]/ul/li[2]/span/span').innerHTML = 'Preferences';
                        ul.insertBefore(amPreferences, ul.childNodes[9]);

                        const amSettings = document.createElement("li");
                        amSettings.innerHTML = `
                            <span class="context-menu__option-text" tabindex="0" role="menuitem">
                                <span class="context-menu__option-text-clamp">Account Settings</span>
                                <svg width="24" height="24" viewBox="0 0 24 24" stroke="#212b36" stroke-width="2" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" clip-rule="evenodd" xml:space="preserve" class="context-menu__option-icon">
                                    <circle cx="12" cy="8" r="5" />
                                    <path d="M3,21 h18 C 21,12 3,12 3,21"/>
                                </svg>
                            </span>
                        `;
                        amSettings.classList.add("context-menu__option--am-settings");
                        amSettings.classList.add("context-menu__option");
                        amSettings.onclick = function () {
                            window.open(`https://music.apple.com/account/settings`)
                        };
                        ul.insertBefore(amSettings, ul.childNodes[8]);

                        const amDiscord = document.createElement("li");
                        amDiscord.innerHTML = `
                            <span class="context-menu__option-text" tabindex="0" role="menuitem">
                                <span class="context-menu__option-text-clamp">Discord</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" clip-rule="evenodd" viewBox="0 0 28 20" xml:space="preserve" class="context-menu__option-icon">
                                    <path d="M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.819 0.934541 10.589 0.461744 10.3368 0.00546311C8.48074 0.324393 6.67795 0.885118 4.96746 1.68231C1.56727 6.77853 0.649666 11.7538 1.11108 16.652C3.10102 18.1418 5.3262 19.2743 7.69177 20C8.22338 19.2743 8.69519 18.4993 9.09812 17.691C8.32996 17.3997 7.58522 17.0424 6.87684 16.6135C7.06531 16.4762 7.24726 16.3387 7.42403 16.1847C11.5911 18.1749 16.408 18.1749 20.5763 16.1847C20.7531 16.3332 20.9351 16.4762 21.1171 16.6135C20.41 17.0369 19.6639 17.3997 18.897 17.691C19.3052 18.4993 19.7718 19.2689 20.3021 19.9945C22.6677 19.2689 24.8929 18.1364 26.8828 16.6466H26.8893C27.43 10.9731 25.9665 6.04728 23.0212 1.67671ZM9.68041 13.6383C8.39754 13.6383 7.34085 12.4453 7.34085 10.994C7.34085 9.54272 8.37155 8.34973 9.68041 8.34973C10.9893 8.34973 12.0395 9.54272 12.0187 10.994C12.0187 12.4453 10.9828 13.6383 9.68041 13.6383ZM18.3161 13.6383C17.0332 13.6383 15.9765 12.4453 15.9765 10.994C15.9765 9.54272 17.0124 8.34973 18.3161 8.34973C19.6184 8.34973 20.6751 9.54272 20.6543 10.994C20.6543 12.4453 19.6184 13.6383 18.3161 13.6383Z"</path>
                                </svg>
                            </span>
                        `;
                        amDiscord.classList.add("context-menu__option--am-discord");
                        amDiscord.classList.add("context-menu__option");
                        amDiscord.onclick = function () {
                            window.open(`https://discord.gg/CezHYdXHEM`)
                        };
                        ul.insertBefore(amDiscord, ul.childNodes[4]);

                        if (typeof _plugins != "undefined") {
                            /** Plugin menu items */
                            _plugins.menuitems.forEach((item) => {
                                var element = document.createElement("li");
                                var textSpan = document.createElement("span");
                                textSpan.classList.add("context-menu__option-text");
                                element.appendChild(textSpan);
                                textSpan.innerHTML = item.Text;
                                element.addEventListener("click", item.OnClick);
                                element.addEventListener("click", () => {
                                    document.querySelector(".context-menu-outside-click-area").dispatchEvent(new Event("click"));
                                });
                                element.classList.add("context-menu__option");
                                ul.appendChild(element);
                            });
                            /** End plugin menu items */
                        }
                    } catch (e) {}});
                }

                /* Scroll Volume */
                if (document.querySelector('.web-chrome-playback-lcd__volume') && typeof volumeChange === 'undefined' && document.querySelector('.web-chrome-playback-lcd__volume').getAttribute('listener') !== 'true' && !activeEventListeners['web-chrome-playback-lcd__volume']) {
                    function checkScrollDirectionIsUp(event) {
                        if (event.wheelDelta) {
                            return event.wheelDelta > 0;
                        }
                        return event.deltaY < 0;
                    }

                    function volumeChange(event) {
                        if (checkScrollDirectionIsUp(event)) {
                            if (MusicKit.getInstance().volume <= 1) {
                                if ((MusicKit.getInstance().volume + 0.05) > 1) {
                                    MusicKit.getInstance().volume = 1
                                } else {
                                    MusicKit.getInstance().volume += 0.05;
                                }
                            }
                        } else {
                            if (MusicKit.getInstance().volume >= 0) {
                                if ((MusicKit.getInstance().volume - 0.05) < 0) {
                                    MusicKit.getInstance().volume = 0;
                                } else {
                                    MusicKit.getInstance().volume -= 0.05;
                                }
                            }
                        }
                    }

                    document.getElementsByClassName('web-chrome-playback-lcd__volume')[0].addEventListener('wheel', volumeChange);
                    activeEventListeners['web-chrome-playback-lcd__volume'] = true
                }

                /* Context Menu Creation (From PR #221 by @SiverDX) */
                const SongContextMenu = {
                    simulateClick: (element, clientX, clientY) => {
                        let event = new MouseEvent('click', {
                            clientX: clientX,
                            clientY: clientY
                        });

                        element.dispatchEvent(event);
                    },

                    createListeners: () => {
                        /* Check if the user is on the library song list or on playlist/album */
                        const clickRegion = (document.getElementsByClassName("songs-list-row").length === 0 ? document.getElementsByClassName("library-track") : document.getElementsByClassName("songs-list-row"));

                        /* Loop through each row/song and add event listener */
                        for (let area of clickRegion) {
                            area.addEventListener('contextmenu', function (event) {
                                event.preventDefault();

                                let control = area.getElementsByClassName("context-menu__overflow ")[0];

                                if (control) {
                                    SongContextMenu.simulateClick(control, event.clientX, event.clientY);
                                }
                            });
                        }

                    }
                };
                SongContextMenu.createListeners();

                /* Remove Apple Logo */
                if (preferences['visual']['removeAppleLogo']) {
                    while (document.getElementsByClassName('web-navigation__header web-navigation__header--logo').length > 0) {
                        document.getElementsByClassName('web-navigation__header web-navigation__header--logo')[0].remove();
                    }
                }

                /* Remove Footer */
                if (!matchRuleShort(window.location.href, '*settings*') && document.getElementsByClassName('application-preferences').length === 0) {
                    if (preferences['visual']['removeFooter'] && document.querySelector('footer').style.display !== "none") {
                        document.querySelector('.dt-footer').style.display = "none";
                    } else if (!preferences['visual']['removeFooter'] && document.querySelector('footer').style.display === "none") {
                        document.querySelector('.dt-footer').style.display = "block";
                    }
                }


                /* Remove Upsell */
                if (preferences['visual']['removeUpsell']) {
                    while (document.getElementsByClassName('web-navigation__native-upsell').length > 0) {
                        document.getElementsByClassName('web-navigation__native-upsell')[0].remove();
                    }
                }

                /* Initialize the miniPlayer */
                _miniPlayer.init();

                /* Create the Lyrics Button */
                _lyrics.CreateButton();

                if(typeof wsapi !== "undefined") {
                    _lyrics.onchange((lyrics)=>{
                        ipcRenderer.send('wsapi-returnLyrics', JSON.stringify(lyrics));
                    });
                }else{
                    console.warn("WSAPI not found");
                }
            }
        };

        /* Load the Startup Files as This is the First Time its been Run */
        AMJavaScript.LoadCustomStartup().catch((e) => console.error(e));
    }

    /* Functions used in Settings Page */
    if (typeof AMSettings == "undefined") {
        var AMSettings = {
            revealCollapse: () => {
                const elem = document.querySelector('#advanced');
                if (elem.classList.contains('revealed')) {
                    /* Collapse Category */
                    elem.classList.remove('revealed');
                    document.querySelector('.header-nav-image').src = 'ameres://icons/webui/down.svg';
                } else {
                    /* Reveal the Category */
                    elem.classList.add('revealed');
                    document.querySelector('.header-nav-image').src = 'ameres://icons/webui/up.svg';
                }
            },

            lastfm: {
                LastFMDeauthorize: () => {
                    ipcRenderer.invoke('setStoreValue', 'general.lastfm', false).catch((e) => console.error(e));
                    ipcRenderer.invoke('setStoreValue', 'tokens.lastfm', '').catch((e) => console.error(e));
                    const element = document.getElementById('lfmConnect');
                    element.innerHTML = 'Connect';
                    element.onclick = AMSettings.lastfm.LastFMAuthenticate;
                },
                LastFMAuthenticate: () => {
                    const element = document.getElementById('lfmConnect');
                    window.open('https://www.last.fm/api/auth?api_key=174905d201451602407b428a86e8344d&cb=ame://auth/lastfm');
                    element.innerText = 'Connecting...';

                    /* Just a timeout for the button */
                    setTimeout(() => {
                        if (element.innerText === 'Connecting...') {
                            element.innerText = 'Connect';
                            console.warn('[LastFM] Attempted connection timed out.');
                        }
                    }, 20000);

                    ipcRenderer.on('LastfmAuthenticated', function (_event, lfmAuthKey) {
                        element.innerHTML = `Disconnect\n<p style="font-size: 8px"><i>(Authed: ${lfmAuthKey})</i></p>`;
                        element.onclick = AMSettings.lastfm.LastFMDeauthorize;
                    });
                }
            },

            createNotification: (changed) => {
                if (typeof changed !== 'object' || !changed || (Object.keys(changed).length === 0 && changed.constructor === Object)) {
                    return;
                }

                let changedHTML = ``,
                    changedFull = ``,
                    addedHTML = ``,
                    addedFull = ``;

                for (let [key, value] of Object.entries(changed)) {
                    key = key.split('.')[0];
                    key = key.charAt(0).toUpperCase() + key.slice(1);

                    if (value === 'updated') {
                        changedHTML += `<li style="color: var(--systemYellow);">${key}</li>`;
                    } else if (value === 'added') {
                        addedHTML += `<li style="color: var(--systemGreen);">${key}</li>`;
                    }
                }

                if (changedHTML !== '') {
                    changedFull = `
                        <h2 style="text-align: center; border-bottom: .5px solid var(--labelDivider); padding: 5px; margin-bottom: 12px;">The following themes have been updated:</h2>
                        <ul style="margin-bottom: 32px">
                            ${changedHTML}
                        </ul>
                    `
                }

                if (addedHTML !== '') {
                    addedFull = `
                        <h2 style="text-align: center; border-bottom: .5px solid var(--labelDivider); padding: 5px; margin-bottom: 12px;">The following themes have been added:</h2>
                        <ul style="margin-bottom: 32px">
                            ${addedHTML}
                        </ul>
                    `
                }

                new AMEModal({
                    content: `
                        <div style="height: 100%;">
                        ${changedFull}
                        ${addedFull}
                        </div>`,
                    Style: {
                        width: "auto",
                        minWidth: "386px",
                        maxWidth: "100%",
                        minHeight: "300px",
                        maxHeight: "100%",
                        height: "auto",
                        padding: "46px",
                    }
                });
            },

            themes: {
                updateThemesListing: (listing) => {
                    let themesListingHTML = `<option disabled>Select one</option>\n<option value='default'>Default</option>`;
                    for (const [fileName, theme] of Object.entries(listing)) {
                        themesListingHTML = themesListingHTML + `\n<option value="${fileName}">${theme.name}</option>`;
                    }
                    document.getElementById('theme').innerHTML = themesListingHTML;
                    console.warn('[Custom][updateThemes] Themes Listing Updated!');
                },
                updateThemes: () => {
                    document.getElementById('updateThemes').innerText = 'Updating...';
                    ipcRenderer.invoke('updateThemes').then(listing => {
                        setTimeout(async () => {
                            AM.themesListing = await ipcRenderer.invoke('updateThemesListing');
                            AMSettings.themes.updateThemesListing(AM.themesListing);
                            document.querySelector('#updateThemes').innerHTML = (AM.themesListing ? 'Themes Updated' : 'Error');
                            document.querySelector('#updateThemes').classList.add(AM.themesListing ? 'success' : 'failure');
                            AMSettings.createNotification(listing);
                        }, 2000)
                    })
                }
            },

            copyLogFile: () => {
                const returnValue = ipcRenderer.sendSync('copyLogFile');
                document.querySelector('#copyLogFile').innerHTML = (returnValue ? 'Copied to Clipboard' : 'Copy Failed');
                document.querySelector('#copyLogFile').classList.add(returnValue ? 'success' : 'failure');
            },

            hasParentClass: (child, classname) => {
                if (child.className.split(' ').indexOf(classname) >= 0) return true;
                try {
                    return child.parentNode && AMSettings.hasParentClass(child.parentNode, classname);
                } catch (TypeError) {
                    return false;
                }
            },

            HandleField: (element) => {
                const field = document.getElementById(element);
                if (!field) {
                    console.error('[HandleField] Element Not Found');
                    return;
                }

                let category;
                if (AMSettings.hasParentClass(field, 'general')) {
                    category = 'general';
                } else if (AMSettings.hasParentClass(field, 'visual')) {
                    category = 'visual';
                } else if (AMSettings.hasParentClass(field, 'audio')) {
                    category = 'audio';
                } else if (AMSettings.hasParentClass(field, 'window')) {
                    category = 'window';
                } else if (AMSettings.hasParentClass(field, 'advanced')) {
                    category = 'advanced';
                } else {
                    console.error('[HandleField] No Parent Category Found.');
                    return;
                }

                /* Toggles */
                if (AMSettings.hasParentClass(field, 'toggle-element')) {
                    field.checked = preferences[category][element];
                    field.addEventListener('change', (event) => {
                        ipcRenderer.invoke('setStoreValue', `${category}.${element}`, event.target.checked).catch((err) => console.error(err));
                    });
                    console.warn(`[HandleField] Event listener created for ${category}.${element}`)
                }
                /* Dropdowns */
                else if (field.classList.contains('form-dropdown-select')) {
                    field.value = preferences[category][element];
                    field.addEventListener('change', (event) => {
                        ipcRenderer.invoke('setStoreValue', `${category}.${element}`, event.target.value).catch((err) => console.error(err));
                    });
                    console.warn(`[HandleField] Event listener created for ${category}.${element}`)
                }
                /* LastFM Connect Button */
                else if (field.id === "lfmConnect") {
                    ipcRenderer.invoke('getStoreValue', 'tokens.lastfm').then((token) => {
                        if (token) {
                            field.innerHTML = `Disconnect\n<p style="font-size: 8px"><i>(Authed: ${token})</i></p>`;
                            field.onclick = AMSettings.lastfm.LastFMDeauthorize;
                        }
                    })
                }
            },

            CreateMenu: (parent) => {
                preferences = ipcRenderer.sendSync('getStore');

                AMJavaScript.getRequest("ameres://html/preferences-main.html", (content) => {
                    document.getElementsByClassName(parent)[0].innerHTML = content;

                    if (document.querySelector('footer')) {
                        document.querySelector('.dt-footer').style.display = "block";
                        document.querySelector('.dt-footer').classList.add('app-prefs-credits');
                        AMJavaScript.getRequest("ameres://html/preferences-footer.html", (content) => {
                            document.querySelector('.dt-footer').innerHTML = content;
                        })
                    }

                    AMSettings.themes.updateThemesListing(AM.themesListing);

                    /* Adjust Preferences Menu if Acrylic is not Supported */
                    if (AM.acrylicSupported) {
                        document.getElementById('transparencyEffect').innerHTML = document.getElementById('transparencyEffect').innerHTML + "\n<option value='acrylic'>Acrylic (W10 1809+)</option>";
                        document.getElementById('transparencyEffect').innerHTML = document.getElementById('transparencyEffect').innerHTML + "\n<option value='mica'>Mica (Experimental)</option>";
                    } else {
                        document.getElementById('transparencyDisableBlurToggleLI').remove();
                    }

                    /* Remove System Accent Toggle if its not win32/darwin */
                    ipcRenderer.invoke('fetchOperatingSystem').then((platform) => {
                        if (platform !== "win32" && platform !== "darwin") {
                            document.getElementById('useOperatingSystemAccentToggleLI').remove();
                        }
                    });

                    /* General Settings */
                    AMSettings.HandleField('incognitoMode');
                    AMSettings.HandleField('playbackNotifications');
                    AMSettings.HandleField('trayTooltipSongName');
                    AMSettings.HandleField('startupPage');
                    AMSettings.HandleField('analyticsEnabled');
                    AMSettings.HandleField('discordRPC');
                    AMSettings.HandleField('discordClearActivityOnPause');
                    AMSettings.HandleField('lfmConnect');
                    AMSettings.HandleField('lastfmRemoveFeaturingArtists');
                    AMSettings.HandleField('lastfmNowPlaying');
                    AMSettings.HandleField('lastfmScrobbleDelay');

                    /* Visual Settings */
                    AMSettings.HandleField('theme');
                    AMSettings.HandleField('frameType');
                    AMSettings.HandleField('transparencyEffect');
                    AMSettings.HandleField('transparencyTheme');
                    AMSettings.HandleField('transparencyDisableBlur');
                    AMSettings.HandleField('transparencyMaximumRefreshRate');
                    AMSettings.HandleField('yton');
                    AMSettings.HandleField('mxmon');
                    AMSettings.HandleField('mxmlanguage');
                    AMSettings.HandleField('streamerMode');
                    AMSettings.HandleField('removeUpsell');
                    AMSettings.HandleField('removeAppleLogo');
                    AMSettings.HandleField('removeFooter');
                    AMSettings.HandleField('removeScrollbars');
                    AMSettings.HandleField('useOperatingSystemAccent');
                    AMSettings.HandleField('scaling');

                    /* Audio Settings */
                    AMSettings.HandleField('audioQuality');
                    AMSettings.HandleField('seamlessAudioTransitions');
                    AMSettings.HandleField('castingBitDepth');
                    AMSettings.HandleField('enableDLNA');
                    AMSettings.HandleField('volume');


                    /* Window Settings */
                    AMSettings.HandleField('appStartupBehavior');
                    AMSettings.HandleField('closeButtonMinimize');

                    /* Advanced Settings */
                    AMSettings.HandleField('forceApplicationMode');
                    AMSettings.HandleField('hardwareAcceleration');
                    AMSettings.HandleField('verboseLogging');
                    AMSettings.HandleField('alwaysOnTop');
                    AMSettings.HandleField('autoUpdaterBetaBuilds');
                    AMSettings.HandleField('useBetaSite');
                    AMSettings.HandleField('preventMediaKeyHijacking');
                    AMSettings.HandleField('devToolsOnStartup');
                    AMSettings.HandleField('allowMultipleInstances');
                })
            }
        }
    }

} catch (e) {
    console.error("[JS] Error while trying to apply custom.js", e);
}