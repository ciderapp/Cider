var _tests = {
    remoteUI() {
        AMJavaScript.getRequest("ameres://html/itunes_remote.html", (content)=>{
            var vm = new Vue({
                data: {
                    passcode: {
                        0: "",
                        1: "",
                        2: "",
                        3: ""
                    },
                    state: "pin"
                },
                methods: {
                    close() {
                        modal.close()
                    },
                    jumpToNum(num) {
                        document.querySelector(`#passcode-num-${num}`).focus()
                        document.querySelector(`#passcode-num-${num}`).select()
                    },
                    retry() {
                        this.passcode = {0:"",1:"",2:"",3:""}
                        this.state = "pin"
                    },
                    connect() {
                        let self = this
                        this.state = "connecting"
                        setTimeout(()=>{
                            self.state = "success"
                        }, 2000)
                    }
                }

            })
            var modal = new AMEModal({
                content: content,
                CloseButton: false,
                Dismissible: false,
                Style: {
                    maxWidth: "700px",
                    maxHeight: "400px"
                },
                OnCreate() {
                    vm.$mount("#itunes-remote-vue")
                    vm.jumpToNum(0)
                },
                OnClose() {
                    _vues.destroy(vm)
                }
            })
        })
    },
    usermenuinit() {
        // MOVE ME ONCE IMPLEMENTED!

        // Clone the user menu
        var umClone = document.querySelector(".web-chrome-controls-container>.web-navigation__auth").cloneNode(true)
        // Hide the existing menu
        document.querySelector(".web-chrome-controls-container>.web-navigation__auth").style.display = "none"
        // Append cloned menu
        document.querySelector(".web-chrome-controls-container").append(umClone)
        // Set cloned menu events

        umClone.addEventListener("click", (e)=>{
            _tests.usermenu(e)
        })
    },
    usermenu(e) {

        // MOVE ME ONCE IMPLEMENTED!
        AMJavaScript.getRequest("ameres://html/usermenu.html", (content) => {
            var vm = new Vue({
                data: {
                    menuitems: [
                        {
                            label: "Help",
                            visible: true,
                            icon: "",
                            svg: `<svg class="context-menu__option-icon" viewBox="0 0 64 64"><path d="M32.32 61.417c16.075 0 29.08-13.032 29.08-29.164 0-16.103-13.005-29.135-29.08-29.135C16.215 3.117 3.238 16.15 3.238 32.253c0 16.132 12.977 29.164 29.082 29.164zm0-5.672c-13.033 0-23.243-10.515-23.243-23.492 0-12.95 10.21-23.463 23.243-23.463 13.032 0 23.213 10.515 23.213 23.463 0 12.977-10.183 23.492-23.213 23.492zm-.665-17.985c1.522 0 2.517-.885 2.6-2.02v-.333c.083-1.437 1.08-2.379 2.878-3.54 2.74-1.8 4.484-3.377 4.484-6.585 0-4.594-4.15-7.222-9.077-7.222-4.758 0-7.967 2.13-8.827 4.732-.166.496-.276.966-.276 1.466 0 1.327 1.051 2.185 2.325 2.185 1.605 0 1.991-.83 2.821-1.8.887-1.355 2.075-2.156 3.709-2.156 2.185 0 3.596 1.245 3.596 3.071 0 1.715-1.161 2.6-3.486 4.234-1.964 1.355-3.404 2.793-3.404 5.256v.305c0 1.577.942 2.407 2.657 2.407zm-.027 8.495c1.77 0 3.237-1.3 3.237-3.043 0-1.772-1.438-3.045-3.237-3.045-1.826 0-3.266 1.3-3.266 3.045 0 1.715 1.466 3.043 3.266 3.043z"></path></svg>`,

                            onclick: () => {
                                window.open(`https://support.apple.com/guide/music-web`)
                            }

                        },
                        {
                            label: "Discord",
                            visible: true,
                            icon: "",
                            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" clip-rule="evenodd" viewBox="0 0 28 20" xml:space="preserve" class="context-menu__option-icon">
                                    <path d="M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.819 0.934541 10.589 0.461744 10.3368 0.00546311C8.48074 0.324393 6.67795 0.885118 4.96746 1.68231C1.56727 6.77853 0.649666 11.7538 1.11108 16.652C3.10102 18.1418 5.3262 19.2743 7.69177 20C8.22338 19.2743 8.69519 18.4993 9.09812 17.691C8.32996 17.3997 7.58522 17.0424 6.87684 16.6135C7.06531 16.4762 7.24726 16.3387 7.42403 16.1847C11.5911 18.1749 16.408 18.1749 20.5763 16.1847C20.7531 16.3332 20.9351 16.4762 21.1171 16.6135C20.41 17.0369 19.6639 17.3997 18.897 17.691C19.3052 18.4993 19.7718 19.2689 20.3021 19.9945C22.6677 19.2689 24.8929 18.1364 26.8828 16.6466H26.8893C27.43 10.9731 25.9665 6.04728 23.0212 1.67671ZM9.68041 13.6383C8.39754 13.6383 7.34085 12.4453 7.34085 10.994C7.34085 9.54272 8.37155 8.34973 9.68041 8.34973C10.9893 8.34973 12.0395 9.54272 12.0187 10.994C12.0187 12.4453 10.9828 13.6383 9.68041 13.6383ZM18.3161 13.6383C17.0332 13.6383 15.9765 12.4453 15.9765 10.994C15.9765 9.54272 17.0124 8.34973 18.3161 8.34973C19.6184 8.34973 20.6751 9.54272 20.6543 10.994C20.6543 12.4453 19.6184 13.6383 18.3161 13.6383Z"</path>
                                </svg>`,

                            onclick: () => {
                                window.open(`https://discord.gg/CezHYdXHEM`)
                            }

                        },
                        {
                            label: "Account Settings",
                            visible: true,
                            icon: "",
                            svg: `<svg width="24" height="24" viewBox="0 0 24 24" stroke="#212b36" stroke-width="2" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" clip-rule="evenodd" xml:space="preserve" class="context-menu__option-icon">
                                    <circle cx="12" cy="8" r="5" />
                                    <path d="M3,21 h18 C 21,12 3,12 3,21"/>
                                </svg>`,

                            onclick: () => {

                                history.pushState("settings", "Settings", "/account/settings/")
                                window.location.href = "#"
                            }
                        },
                        {
                            label: "Preferences",
                            visible: true,
                            icon: "",
                            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" clip-rule="evenodd" version="1.1" viewBox="0 0 16 16" xml:space="preserve" class="context-menu__option-icon"><path fill-rule="nonzero" d="M31.475,57.622C32.114,57.622 32.702,57.571 33.34,57.52L34.77,60.228C35.077,60.891 35.766,61.249 36.558,61.12C37.298,60.994 37.809,60.43 37.912,59.665L38.346,56.651C39.546,56.32 40.696,55.885 41.845,55.4L44.066,57.392C44.629,57.928 45.369,58.031 46.085,57.648C46.749,57.263 47.005,56.575 46.877,55.809L46.238,52.82C47.26,52.115 48.218,51.321 49.098,50.445L51.883,51.62C52.597,51.928 53.313,51.748 53.849,51.11C54.334,50.548 54.411,49.806 53.977,49.143L52.367,46.537C53.079,45.524 53.695,44.446 54.207,43.318L57.247,43.472C58.012,43.498 58.677,43.089 58.907,42.349C59.163,41.658 58.933,40.876 58.345,40.432L55.945,38.543C56.249,37.393 56.505,36.143 56.606,34.866L59.468,33.946C60.234,33.716 60.694,33.128 60.694,32.362C60.694,31.571 60.234,31.008 59.468,30.752L56.606,29.834C56.505,28.557 56.249,27.357 55.945,26.157L58.318,24.265C58.932,23.806 59.162,23.091 58.906,22.375C58.676,21.66 58.012,21.226 57.245,21.252L54.206,21.38C53.645,20.23 53.083,19.183 52.368,18.135L53.977,15.555C54.387,14.965 54.334,14.17 53.849,13.64C53.312,12.977 52.597,12.825 51.883,13.105L49.098,14.254C48.198,13.4 47.242,12.606 46.237,11.878L46.877,8.915C47.005,8.149 46.723,7.434 46.085,7.077C45.369,6.692 44.629,6.769 44.066,7.332L41.846,9.298C40.702,8.821 39.535,8.404 38.348,8.048L37.914,5.058C37.834,4.32 37.267,3.722 36.534,3.603C35.768,3.5 35.078,3.833 34.772,4.471L33.342,7.178C32.703,7.154 32.115,7.102 31.477,7.102C30.838,7.102 30.251,7.154 29.612,7.178L28.182,4.471C27.849,3.832 27.186,3.501 26.394,3.603C25.654,3.731 25.144,4.293 25.04,5.058L24.606,8.048C23.406,8.405 22.231,8.814 21.108,9.298L18.885,7.332C18.298,6.769 17.583,6.694 16.842,7.077C16.203,7.434 15.949,8.149 16.075,8.942L16.714,11.878C15.709,12.606 14.753,13.4 13.852,14.254L11.069,13.104C10.329,12.824 9.639,12.977 9.077,13.64C8.618,14.179 8.566,14.96 8.949,15.555L10.559,18.135C9.875,19.17 9.269,20.255 8.746,21.38L5.68,21.252C4.941,21.219 4.264,21.677 4.02,22.375C3.79,23.091 3.995,23.806 4.608,24.266L6.982,26.154C6.7,27.354 6.445,28.554 6.343,29.831L3.457,30.751C2.717,30.981 2.282,31.569 2.282,32.36C2.282,33.126 2.717,33.714 3.457,33.945L6.343,34.889C6.445,36.14 6.675,37.392 6.982,38.542L4.606,40.43C4.022,40.877 3.785,41.65 4.018,42.347C4.253,43.052 4.938,43.515 5.68,43.47L8.745,43.316C9.28,44.466 9.868,45.539 10.557,46.534L8.947,49.141C8.551,49.751 8.604,50.554 9.077,51.107C9.64,51.745 10.329,51.924 11.069,51.617L13.828,50.442C14.722,51.312 15.688,52.107 16.714,52.817L16.075,55.807C15.948,56.573 16.203,57.262 16.868,57.645C17.583,58.028 18.298,57.925 18.86,57.415L21.106,55.397C22.231,55.882 23.406,56.317 24.606,56.648L25.04,59.664C25.143,60.428 25.654,60.991 26.394,61.144C27.186,61.247 27.849,60.888 28.182,60.225L29.612,57.517C30.251,57.568 30.838,57.619 31.477,57.619L31.475,57.621L31.475,57.622ZM38.168,30.345C36.891,27.049 34.337,25.262 31.322,25.262C30.762,25.261 30.205,25.33 29.662,25.466L22.766,13.64C25.492,12.368 28.466,11.714 31.474,11.724C42.254,11.724 50.732,19.822 51.729,30.344L38.168,30.344L38.168,30.345ZM11.145,32.362C11.145,25.543 14.286,19.515 19.242,15.762L26.188,27.637C24.834,29.145 24.222,30.752 24.222,32.438C24.222,34.074 24.809,35.58 26.188,37.138L19.063,48.835C14.209,45.055 11.145,39.105 11.145,32.362ZM28.283,32.412C28.283,30.702 29.738,29.374 31.373,29.374C33.085,29.374 34.489,30.702 34.489,32.412C34.481,34.114 33.076,35.509 31.374,35.505C29.738,35.505 28.282,34.125 28.282,32.412L28.283,32.412ZM31.475,53.025C28.257,53.025 25.218,52.285 22.562,50.982L29.637,39.386C30.377,39.565 30.887,39.616 31.322,39.616C34.362,39.616 36.915,37.776 38.168,34.405L51.729,34.405C50.732,44.903 42.252,53.025 31.475,53.025Z" transform="matrix(.27119 0 0 .27119 -.54 -.78)"></path></svg>`,

                            onclick: () => {

                                history.pushState("settings", "Settings", "/account/settings/?amesettings=1")
                                window.location.href = "#"
                            }
                        },
                        {
                            label: "Equalizer",

                            visible: AudioOutputs.eqReady,

                            svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="context-menu__option-icon" width="100%" height="100%" viewBox="0 0 16 16" version="1.1">
<g>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 12.050781 0 L 14.214844 0 L 14.214844 4.808594 L 12.050781 4.808594 Z M 12.050781 0 "/>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 12.050781 7.421875 L 14.214844 7.421875 L 14.214844 15.988281 L 12.050781 15.988281 Z M 12.050781 7.421875 "/>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 6.914062 0 L 9.078125 0 L 9.078125 8.910156 L 6.914062 8.910156 Z M 6.914062 0 "/>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 6.914062 11.527344 L 9.078125 11.527344 L 9.078125 15.988281 L 6.914062 15.988281 Z M 6.914062 11.527344 "/>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 1.773438 0 L 3.9375 0 L 3.9375 1.472656 L 1.773438 1.472656 Z M 1.773438 0 "/>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 1.773438 4.085938 L 3.9375 4.085938 L 3.9375 15.988281 L 1.773438 15.988281 Z M 1.773438 4.085938 "/>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 0.871094 1.921875 L 0.871094 3.636719 L 4.839844 3.636719 L 4.839844 1.921875 Z M 0.871094 1.921875 "/>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 6.011719 9.363281 L 6.011719 11.074219 L 9.976562 11.074219 L 9.976562 9.363281 Z M 6.011719 9.363281 "/>
<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 12.050781 5.257812 L 11.152344 5.257812 L 11.152344 6.972656 L 15.117188 6.972656 L 15.117188 5.257812 Z M 12.050781 5.257812 "/>
</g>
</svg>`,

                            onclick: () => {

                                _tests.eq()
                            }
                        },
                        {
                            label: "Sign Out",
                            visible: true,
                            icon: "",
                            style: {
                                color: "var(--systemRed)"
                            },

                            onclick: () => {
                                MusicKit.getInstance().unauthorize()
                            }

                        }
                    ]
                },
                methods: {
                    close() {
                        modal.close()
                    }
                }
            })
            var calc = {
                width: 185,
                left: e.clientX - (185 / 2)
            }

            // calculate the position of the menu based on the mouse position and the width of the menu itself
            if (calc.left + calc.width > window.innerWidth) {
                calc.left = (window.innerWidth - calc.width)
            }
            if (calc.left < 0) {
                calc.left = 0
            }

            var modal = new AMEModal({
                content: content,
                CloseButton: false,
                ModalClasses: ["ameUserMenu"],
                BackdropStyle: {
                    background: "transparent"
                },
                Style: {
                    height: "auto",

                    width: `${calc["width"]}px`,
                    position: "absolute",
                    // top: "46px",
                    // right: "142px"
                    top: `46px`,
                    left: `${calc.left}px`
                },
                OnCreate() {
                    vm.$mount("#usermenu-vue")
                    if(typeof _plugins != "undefined") {
                        _plugins.menuitems.forEach((menuitem)=>{
                            vm.menuitems.unshift({
                                label: menuitem["Text"],
                                onclick: menuitem["OnClick"],
                                icon: "",
                                visible: true
                            })
                        })
                    }

                },
                OnClose() {
                    _vues.destroy(vm)
                }
            })
        })
    },
    eq() {
        AMJavaScript.getRequest("ameres://html/eq.html", (content) => {
            var vm = new Vue({
                data: {
                    manualEntry: false,
                    bass: bassFilter.gain.value.toFixed(2),
                    treble: trebleFilter.gain.value.toFixed(2),
                    gain: AMEx.result.gain.gain.value.toFixed(2)
                },
                methods: {
                    reset() {
                        this.bass = 0
                        bassFilter.gain.value = 0
                        this.treble = 0
                        trebleFilter.gain.value = 0
                        this.gain = 0
                        AMEx.result.gain.gain.value = 0
                    },
                    close() {
                        modal.close()
                    }
                }
            })
            var modal = new AMEModal({
                content: content,
                CloseButton: false,
                ModalClasses: ["ameUserMenu"],
                BackdropStyle: {
                    background: "transparent"
                },

                Style: {

                    animation: "ameEQIn .10s var(--appleEase)",
                    width: "306px",
                    height: "254px",
                    position: "absolute",
                    top: "46px",
                    right: "42px"
                },
                OnCreate() {
                    vm.$mount("#eq-vm")
                }
            })
        })
    },
    zoo() {
        AMJavaScript.getRequest("ameres://html/zoo.html", (content) => {
            var modal = new AMEModal({
                content: content
            })
        })
    },
    outputDevice() {
        AMJavaScript.getRequest("ameres://html/outputdevice.html", (content) => {
            var vm = new Vue({
                data: {
                    selected: "",
                    audio: document.querySelector("#apple-music-player"),
                    devices: []
                },
                methods: {
                    setOutputDevice(id) {
                        if (this.audio) {
                            selected = id
                            sessionStorage.setItem("outputDevice", id)
                            this.audio.setSinkId(id)
                        }
                    }
                }
            })
            var modal = new AMEModal({
                content: content,
                Style: {
                    width: "30%",
                    minWidth: "500px"
                },
                OnCreate() {
                    vm.$mount("#outputdevices-vue")
                    if (vm.audio) {
                        vm.selected = audio.sinkId
                    } else {
                        vm.selected = "default"
                    }
                    navigator.mediaDevices.enumerateDevices()
                        .then(function (devices) {
                            vm.devices = devices.filter((device) => {
                                if (device.kind == "audiooutput") {
                                    return device
                                }
                            })
                        })
                        .catch(function (err) {
                            console.log(err.name + ": " + err.message)
                        })
                },
                OnClose() {
                    _vues.destroy(vm)
                }
            })
        })
    },
    stats() {
        var container = document.createElement("div")
        var frameRate = document.createElement("div")
        var listeners = document.createElement("div")
        Object.assign(container.style,
            {
                textAlign: "center",
                position: "absolute",
                fontSize: "18px",
                bottom: "16px",
                right: "16px",
                pointerEvents: "none",
                zIndex: 99991,
                color: "white",
                webkitTextStroke: "0.2px black"
            })
        document.body.appendChild(container)
        container.appendChild(frameRate)
        container.appendChild(listeners)

        const times = [];
        let fps;

        function refreshLoop() {
            window.requestAnimationFrame(() => {
                const now = performance.now();
                while (times.length > 0 && times[0] <= now - 1000) {
                    times.shift();
                }
                times.push(now);
                fps = times.length;
                frameRate.innerText = `${fps} FPS`
                refreshLoop();
            });
        }

        refreshLoop();
    },
    oobe(skipIntro = false, closeBtn = false) {
        // MOVE ME ONCE IMPLEMENTED!

        AMJavaScript.getRequest("ameres://html/oobe.html", (content) => {
            var vm = new Vue({
                data: {
                    prefs: {
                        general: {
                            storefront: "us",
                            discordRPC: "",
                            analyticsEnabled: true
                        },
                        visual: {
                            theme: "",
                            transparencyEffect: "",
                            useOperatingSystemAccent: false,
                            scaling: 1,
                            mxmon: false,
                            yton: false,
                            mxmlanguage: "en",
                            removeScrollbars: true
                        },
                        audio: {
                            audioQuality: "auto",
                            seamlessAudioTransitions: true,
                            castingBitDepth: '16',
                            enableDLNA: false,
                        },
                        window: {
                            closeButtonMinimize: true
                        }
                    },
                    page: "intro",
                },
                methods: {
                    btn() {
                        console.info("Button clicked")
                    },
                    getPrefs() {
                        let self = this
                        ipcRenderer.invoke("getStoreValue", "audio.audioQuality").then((result) => {
                            self.prefs.audio.audioQuality = result
                        })

                        ipcRenderer.invoke("getStoreValue", "audio.seamlessAudioTransitions").then((result) => {
                            self.prefs.audio.seamlessAudioTransitions = result
                        })
                        
                        ipcRenderer.invoke("getStoreValue", "audio.castingBitDepth").then((result) => {
                            self.prefs.audio.castingBitDepth = result
                        })

                        ipcRenderer.invoke("getStoreValue", "audio.enableDLNA").then((result) => {
                            self.prefs.audio.enableDLNA = result
                        })

                        ipcRenderer.invoke("getStoreValue", "general.storefront").then((result) => {
                            self.prefs.general.storefront = result
                        })

                        ipcRenderer.invoke("getStoreValue", "general.discordRPC").then((result) => {
                            self.prefs.general.discordRPC = result
                        })

                        ipcRenderer.invoke("getStoreValue", "general.analyticsEnabled").then((result) => {
                            self.prefs.general.analyticsEnabled = result
                        })

                        ipcRenderer.invoke("getStoreValue", "window.closeButtonMinimize").then((result) => {
                            self.prefs.window.closeButtonMinimize = result
                        })

                        ipcRenderer.invoke("getStoreValue", "visual.theme").then((result) => {
                            self.prefs.visual.theme = result
                        })

                        ipcRenderer.invoke("getStoreValue", "visual.transparencyEffect").then((result) => {
                            self.prefs.visual.transparencyEffect = result
                        })

                        ipcRenderer.invoke("getStoreValue", "visual.useOperatingSystemAccent").then((result) => {
                            self.prefs.visual.useOperatingSystemAccent = result
                        })

                        ipcRenderer.invoke("getStoreValue", "visual.mxmon").then((result) => {
                            self.prefs.visual.mxmon = result
                        })


                        ipcRenderer.invoke("getStoreValue", "visual.yton").then((result) => {
                            self.prefs.visual.yton = result
                        })

                        ipcRenderer.invoke("getStoreValue", "visual.mxmlanguage").then((result) => {
                            self.prefs.visual.mxmlanguage = result
                        })

                        ipcRenderer.invoke("getStoreValue", "visual.removeScrollbars").then((result) => {
                            self.prefs.visual.removeScrollbars = result
                        })
                    },
                    setPrefs() {
                        let self = this
                        ipcRenderer.invoke("setStoreValue", "audio.audioQuality", self.prefs.audio.audioQuality)
                        ipcRenderer.invoke("setStoreValue", "audio.seamlessAudioTransitions", self.prefs.audio.seamlessAudioTransitions)
                        ipcRenderer.invoke("setStoreValue", "audio.castingBitDepth", self.prefs.audio.castingBitDepth)
                        ipcRenderer.invoke("setStoreValue", "audio.enableDLNA", self.prefs.audio.enableDLNA)
                        ipcRenderer.invoke("setStoreValue", "general.storefront", self.prefs.general.storefront)
                        ipcRenderer.invoke("setStoreValue", "general.discordRPC", self.prefs.general.discordRPC)
                        ipcRenderer.invoke("setStoreValue", "general.analyticsEnabled", self.prefs.general.analyticsEnabled)
                        ipcRenderer.invoke("setStoreValue", "window.closeButtonMinimize", self.prefs.window.closeButtonMinimize)
                        ipcRenderer.invoke("setStoreValue", "visual.theme", self.prefs.visual.theme)
                        ipcRenderer.invoke("setStoreValue", "visual.transparencyEffect", self.prefs.visual.transparencyEffect)
                        ipcRenderer.invoke("setStoreValue", "visual.useOperatingSystemAccent", self.prefs.visual.useOperatingSystemAccent)
                        ipcRenderer.invoke("setStoreValue", "visual.mxmon", self.prefs.visual.mxmon)

                        ipcRenderer.invoke("setStoreValue", "visual.yton", self.prefs.visual.yton)

                        ipcRenderer.invoke("setStoreValue", "visual.mxmlanguage", self.prefs.visual.mxmlanguage)
                        ipcRenderer.invoke("setStoreValue", "visual.removeScrollbars", self.prefs.visual.removeScrollbars)
                    },
                    promptRelaunch() {
                        var relaunch = confirm(
                            "Relaunch Required\nA relaunch is required in order for the settings you have changed to apply."
                        )
                        if (relaunch) {
                            ipcRenderer.send("relaunchApp")
                        }
                    },
                    close() {
                        this.setPrefs()
                        // this.promptRelaunch()
                        modal.close()
                    },
                    init() {
                        let self = this
                        document.getElementById('introVideo').addEventListener('ended', () => {
                            self.page = "welcome"
                        }, false);
                        this.getPrefs()
                    },
                    enableBlur() {
                        modal.setStyle("backdrop", {
                            backdropFilter: "blur(16px) saturate(180%)"
                        })
                    },
                    disableBlur() {
                        modal.setStyle("backdrop", {
                            backdropFilter: "blur(0px)"
                        })
                    }
                }
            })
            var modal = new AMEModal({
                content: content,
                CloseButton: closeBtn,
                Dismissible: closeBtn,
                OnCreate() {
                    vm.$mount("#oobe-vue")
                    if (skipIntro) {
                        vm.page = "welcome"
                    } else {
                        vm.init()
                    }
                },
                OnClose() {
                    _vues.destroy(vm);
                    if (!MusicKit.getInstance().isAuthorized) {
                        MusicKit.getInstance().authorize();
                    }
                }
            })
        })
    }
};

if (ipcRenderer.sendSync('showOOBE')) {
    setTimeout(() => {
        _tests.oobe();
    }, 200)
}
