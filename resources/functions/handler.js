const {
        app,
        Menu,
        ipcMain,
        shell,
        dialog,
        Notification,
        BrowserWindow,
        systemPreferences,
        nativeTheme,
        clipboard
    } = require('electron'),
    {join, resolve} = require('path'),
    {readFile, readFileSync, writeFile, existsSync, watch} = require('fs'),
    os = require('os'),
    mdns = require('mdns-js'),
    Client = require('node-ssdp').Client,
    express = require('express'),
    audioClient = require('castv2-client').Client,
    MediaRendererClient = require('upnp-mediarenderer-client'),
    DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver,
    getPort = require('get-port'),
    {Stream} = require('stream'),
    regedit = require('regedit'),
    WaveFile = require('wavefile').WaveFile,
    {initAnalytics} = require('./utils');
initAnalytics();

const handler = {

    LaunchHandler: () => {
        // Version Fetch
        if (app.commandLine.hasSwitch('version') || app.commandLine.hasSwitch('v')) {
            console.log(app.getVersion())
            app.exit()
        }

        // Verbose Check
        if (app.commandLine.hasSwitch('verbose')) {
            console.log("[Apple-Music-Electron] User has launched the application with --verbose");
        }

        // Log File Location
        if (app.commandLine.hasSwitch('log') || app.commandLine.hasSwitch('l')) {
            console.log(join(app.getPath('userData'), 'logs'))
            app.exit()
        }
    },

    InstanceHandler: () => {
        console.verbose('[InstanceHandler] Started.')

        app.on('second-instance', (_e, argv) => {
            console.warn(`[InstanceHandler][SecondInstanceHandler] Second Instance Started with args: [${argv.join(', ')}]`)

            // Checks if first instance is authorized and if second instance has protocol args
            argv.forEach((value) => {
                if (value.includes('ame://') || value.includes('itms://') || value.includes('itmss://') || value.includes('musics://') || value.includes('music://')) {
                    console.warn(`[InstanceHandler][SecondInstanceHandler] Found Protocol!`)
                    handler.LinkHandler(value);
                }
            })

            if (argv.includes("--force-quit")) {
                console.warn('[InstanceHandler][SecondInstanceHandler] Force Quit found. Quitting App.');
                app.isQuiting = true
                app.quit()
            } else if (app.win && !app.cfg.get('advanced.allowMultipleInstances')) { // If a Second Instance has Been Started
                console.warn('[InstanceHandler][SecondInstanceHandler] Showing window.');
                app.win.show()
                app.win.focus()
            }
        })

        if (!app.requestSingleInstanceLock() && !app.cfg.get('advanced.allowMultipleInstances')) {
            console.warn("[InstanceHandler] Existing Instance is Blocking Second Instance.");
            app.quit();
            app.isQuiting = true
        }
    },

    PlaybackStateHandler: () => {
        console.verbose('[playbackStateDidChange] Started.');

        ipcMain.on('playbackStateDidChange', (_event, a) => {
            console.verbose('[handler] playbackStateDidChange received.');
            app.media = a;

            app.ame.win.SetButtons()
            app.ame.win.SetTrayTooltip(a)
            app.ame.discord.updateActivity(a)
            app.ame.lastfm.scrobbleSong(a)
            app.ame.lastfm.updateNowPlayingSong(a)
            app.ame.mpris.updateState(a)
        });
    },

    MediaStateHandler: () => {
        console.verbose('[MediaStateHandler] Started.');

        ipcMain.on('nowPlayingItemDidChange', (_event, a) => {
            console.verbose('[handler] nowPlayingItemDidChange received.');
            app.media = a;

            app.ame.win.CreateNotification(a);
            app.ame.mpris.updateActivity(a);

            if (app.cfg.get('audio.seamlessAudioTransitions')) {
                app.ame.win.SetButtons()
                app.ame.win.SetTrayTooltip(a)
                app.ame.discord.updateActivity(a)
                app.ame.lastfm.scrobbleSong(a)
                app.ame.lastfm.updateNowPlayingSong(a)
                app.ame.mpris.updateState(a)
            }
        });
    },

    WindowStateHandler: () => {
        console.verbose('[WindowStateHandler] Started.');

        app.win.webContents.setWindowOpenHandler(({url}) => {
            shell.openExternal(url).then(() => console.log(`[WindowStateHandler] User has opened ${url} which has been redirected to browser.`));
            return {
                action: 'deny'
            }
        })

        let incognitoNotification;
        app.win.webContents.on('did-finish-load', () => {
            console.verbose('[did-finish-load] Completed.');
            app.ame.load.LoadOneTimeFiles();
            app.win.webContents.setZoomFactor(parseFloat(app.cfg.get("visual.scaling")))
            if (app.cfg.get('general.incognitoMode') && !incognitoNotification) {
                incognitoNotification = new Notification({
                    title: 'Incognito Mode Enabled',
                    body: `Listening activity is hidden.`,
                    icon: join(__dirname, '../icons/icon.png')
                })
                incognitoNotification.show()
            }
        });

        app.win.webContents.on('did-fail-load', (event, errCode, errDesc, url, mainFrame) => {
            console.error(`Error Code: ${errCode}\nLoading: ${url}\n${errDesc}`)
            if (mainFrame) {
                app.exit()
            }
        });

        // Windows specific: Handles window states
        // Needed because Aero Snap events do not send the same way as clicking the frame buttons.
        if (process.platform === "win32" && app.cfg.get('visual.frameType') !== 'mac' || app.cfg.get('visual.frameType') !== 'mac-right') {
            var WND_STATE = {
                MINIMIZED: 0,
                NORMAL: 1,
                MAXIMIZED: 2,
                FULL_SCREEN: 3
            }
            var wndState = WND_STATE.NORMAL

            app.win.on("resize", (_event) => {
                const isMaximized = app.win.isMaximized()
                const isMinimized = app.win.isMinimized()
                const isFullScreen = app.win.isFullScreen()
                const state = wndState;
                if (isMinimized && state !== WND_STATE.MINIMIZED) {
                    wndState = WND_STATE.MINIMIZED
                } else if (isFullScreen && state !== WND_STATE.FULL_SCREEN) {
                    wndState = WND_STATE.FULL_SCREEN
                } else if (isMaximized && state !== WND_STATE.MAXIMIZED) {
                    wndState = WND_STATE.MAXIMIZED
                    app.win.webContents.executeJavaScript(`document.querySelector("#maximize").classList.add("maxed")`)
                } else if (state !== WND_STATE.NORMAL) {
                    wndState = WND_STATE.NORMAL
                    app.win.webContents.executeJavaScript(`document.querySelector("#maximize").classList.remove("maxed")`)
                }
            })
        }

        app.win.on('unresponsive', () => {
            dialog.showMessageBox({
                message: `${app.getName()} has become unresponsive`,
                title: 'Do you want to try forcefully reloading the app?',
                buttons: ['Yes', 'Quit', 'No'],
                cancelId: 1
            }).then(({response}) => {
                if (response === 0) {
                    app.win.contents.forcefullyCrashRenderer()
                    app.win.contents.reload()
                } else if (response === 1) {
                    console.log("[WindowStateHandler] Application has become unresponsive and has been closed.")
                    app.exit();
                }
            })
        })

        app.win.on('page-title-updated', (event, title) => {
            console.verbose(`[page-title-updated] Title updated Running necessary files. ('${title}')`)
            app.ame.load.LoadFiles();
        })

        app.win.on('close', (event) => {
            if (app.isMiniplayerActive && !app.isQuiting) {
                ipcMain.emit("set-miniplayer", false);
                event.preventDefault()
            } else if ((app.cfg.get('window.closeButtonMinimize') || process.platform === "darwin") && !app.isQuiting) {
                app.win.hide()
                app.ame.win.SetContextMenu(false)
                event.preventDefault()
            } else {
                app.win.destroy()
                if (app.lyrics.mxmWin) {
                    app.lyrics.mxmWin.destroy();
                }
                if (app.lyrics.neteaseWin) {
                    app.lyrics.neteaseWin.destroy();
                }
                if (app.lyrics.ytWin) {
                    app.lyrics.ytWin.destroy();
                }
            }
        })

        app.win.on('maximize', (e) => {
            if (app.isMiniplayerActive) {
                e.preventDefault()
            }
        })

        app.win.on('show', () => {
            app.ame.win.SetContextMenu(true)
            app.ame.win.SetButtons()
            if (app.win.isVisible()) {
                app.win.focus()
            }
        });

        app.win.on('hide', () => {
            app.ame.win.SetContextMenu(false)
            if (app.pluginsEnabled) {
                app.win.webContents.executeJavaScript(`_plugins.execute('OnHide')`)
            }
        });
    },

    SettingsHandler: () => {
        console.verbose('[SettingsHandler] Started.');
        let DialogMessage = false,
            storedChanges = [],
            handledConfigs = [];

        systemPreferences.on('accent-color-changed', (event, color) => {
            if (color && app.cfg.get('visual.useOperatingSystemAccent') && (process.platform === "win32" || process.platform === "darwin")) {
                const accent = '#' + color.slice(0, -2)
                app.win.webContents.insertCSS(`
                :root {
                    --keyColor: ${accent} !important;
                    --systemAccentBG: ${accent} !important;
                    --systemAccentBG-pressed: rgba(${app.ame.utils.hexToRgb(accent).r}, ${app.ame.utils.hexToRgb(accent).g}, ${app.ame.utils.hexToRgb(accent).b}, 0.75) !important;
                    --keyColor-rgb: ${app.ame.utils.hexToRgb(accent).r} ${app.ame.utils.hexToRgb(accent).g} ${app.ame.utils.hexToRgb(accent).b} !important;
                }`).then((key) => {
                    app.injectedCSS['useOperatingSystemAccent'] = key
                })
            }
        })

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        *  Restart Required Configuration Handling
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        app.cfg.onDidAnyChange((newConfig, oldConfig) => {
            let currentChanges = [];

            for (const [categoryTitle, categoryContents] of Object.entries(newConfig)) {
                if (categoryContents !== oldConfig[categoryTitle]) { // This has gotten the changed category
                    for (const [settingTitle, settingValue] of Object.entries(newConfig[categoryTitle])) {
                        if (JSON.stringify(settingValue) !== JSON.stringify(oldConfig[categoryTitle][settingTitle])) {
                            currentChanges.push(`${categoryTitle}.${settingTitle}`)
                            if (!storedChanges.includes(`${categoryTitle}.${settingTitle}`)) {
                                storedChanges.push(`${categoryTitle}.${settingTitle}`)
                            }
                        }
                    }
                }
            }

            console.verbose(`[SettingsHandler] Found changes: ${currentChanges} | Total Changes: ${storedChanges}`);

            if (!DialogMessage && !handledConfigs.includes(currentChanges[0])) {
                DialogMessage = dialog.showMessageBox({
                    title: "Relaunch Required",
                    message: "A relaunch is required in order for the settings you have changed to apply.",
                    type: "warning",
                    buttons: ['Relaunch Now', 'Relaunch Later']
                }).then(({response}) => {
                    if (response === 0) {
                        app.relaunch()
                        app.quit()
                    }
                })
            }
        })

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        *  Individually Handled Configuration Options
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
        handledConfigs.push('advanced.devToolsOnStartup', 'general.storefront', 'tokens.lastfm', 'window.closeButtonMinimize') // Stuff for the restart to just ignore

        // Theme Changes
        handledConfigs.push('visual.theme');
        app.cfg.onDidChange('visual.theme', (newValue, _oldValue) => {
            app.win.webContents.executeJavaScript(`AMStyling.loadTheme("${(newValue === 'default' || !newValue) ? '' : newValue}");`).catch((e) => console.error(e));
            if (app.watcher) {
                app.watcher.close();
                console.verbose('[Watcher] Removed old watcher.')
            }

            if (existsSync(resolve(app.getPath('userData'), 'themes', `${newValue}.css`)) && newValue !== "default" && newValue) {
                app.watcher = watch(resolve(app.getPath('userData'), 'themes', `${newValue}.css`), (event, fileName) => {
                    if (event === "change" && fileName === `${newValue}.css`) {
                        app.win.webContents.executeJavaScript(`AMStyling.loadTheme("${newValue}", true);`).catch((err) => console.error(err));
                    }
                });
                console.verbose(`[Watcher] Watching for changes: 'themes/${newValue}.css'`)
            }

            const updatedVibrancy = app.ame.utils.fetchTransparencyOptions();
            if (app.transparency && updatedVibrancy && process.platform !== 'darwin') app.win.setVibrancy(updatedVibrancy);
        })

        // Transparency Changes
        handledConfigs.push('visual.transparencyEffect', 'visual.transparencyTheme', 'visual.transparencyDisableBlur', 'visual.transparencyMaximumRefreshRate');
        app.cfg.onDidChange('visual.transparencyEffect' || 'visual.transparencyTheme' || 'visual.transparencyDisableBlur' || 'visual.transparencyMaximumRefreshRate', (_newValue, _oldValue) => {
            const updatedVibrancy = app.ame.utils.fetchTransparencyOptions()
            if (app.cfg.get("visual.transparencyEffect") === "mica" && process.platform !== 'darwin') {
                app.win.webContents.executeJavaScript(`AMStyling.setMica(true);`).catch((e) => console.error(e));
                app.transparency = false;
                app.win.setVibrancy();
            } else {
                app.win.webContents.executeJavaScript(`AMStyling.setMica(false);`).catch((e) => console.error(e));
            }
            if (app.transparency && updatedVibrancy && process.platform !== 'darwin') {
                app.win.setVibrancy(updatedVibrancy);
                app.win.webContents.executeJavaScript(`AMStyling.setTransparency(true);`).catch((e) => console.error(e));
            } else {
                app.win.setVibrancy();
                app.win.webContents.executeJavaScript(`AMStyling.setTransparency(false);`).catch((e) => console.error(e));
            }
        })

        // Reload scripts
        handledConfigs.push('visual.removeUpsell', 'visual.removeAppleLogo', 'visual.removeFooter', 'visual.useOperatingSystemAccent');
        app.cfg.onDidChange('visual.removeUpsell', (newValue, _oldValue) => {
            app.ame.load.LoadFiles();
        })
        app.cfg.onDidChange('visual.removeAppleLogo', (newValue, _oldValue) => {
            app.ame.load.LoadFiles();
        })
        app.cfg.onDidChange('visual.removeFooter', (newValue, _oldValue) => {
            app.ame.load.LoadFiles();
        })
        app.cfg.onDidChange('visual.useOperatingSystemAccent', (newValue, _oldValue) => {
            if (!newValue) {
                app.ame.win.removeInsertedCSS('useOperatingSystemAccent')
            } else {
                app.ame.load.LoadFiles();
            }
        })

        // DiscordRPC
        handledConfigs.push('general.discordRPC', 'general.discordClearActivityOnPause');
        app.cfg.onDidChange('general.discordRPC', (newValue, _oldValue) => {
            if (newValue && !app.discord.isConnected) {
                app.ame.discord.connect();
            } else {
                app.ame.discord.disconnect();
            }
        })


        // IncognitoMode Changes
        handledConfigs.push('general.incognitoMode');
        app.cfg.onDidChange('general.incognitoMode', (newValue, _oldValue) => {
            if (newValue) {
                console.log("[Incognito] Incognito Mode enabled. DiscordRPC and LastFM updates are ignored.")
            }
        })

        // Scaling Changes
        handledConfigs.push('visual.scaling');
        app.cfg.onDidChange('visual.scaling', (newValue, _oldValue) => {
            app.win.webContents.setZoomFactor(parseFloat(newValue))
        });

        // Mode Changes
        handledConfigs.push('advanced.forceApplicationMode');
        app.cfg.onDidChange('advanced.forceApplicationMode', (newValue, _oldValue) => {
            nativeTheme.themeSource = newValue;
        });
    },

    RendererListenerHandlers: () => {

        // Showing the OOBE on first launch
        ipcMain.on('showOOBE', (event) => {
            event.returnValue = app.ame.showOOBE;
            app.ame.showOOBE = false
        })

        // Themes Listing Update
        ipcMain.handle('updateThemesListing', (_event) => {
            return app.ame.utils.fetchThemesListing();
        })

        // Plugins Listing Update
        ipcMain.handle('fetchPluginsListing', (_event) => {
            return app.ame.utils.fetchPluginsListing();
        })

        // Get OS
        ipcMain.handle('fetchOperatingSystem', () => {
            return process.platform
        })

        // Acrylic Check
        ipcMain.handle('isAcrylicSupported', (_event) => {
            return app.ame.utils.isAcrylicSupported();
        })

        // Electron-Store Renderer Handling for Getting Values
        ipcMain.handle('getStoreValue', (event, key, defaultValue) => {
            return (defaultValue ? app.cfg.get(key, true) : app.cfg.get(key));
        });

        // Electron-Store Renderer Handling for Setting Values
        ipcMain.handle('setStoreValue', (event, key, value) => {
            app.cfg.set(key, value);
        });

        ipcMain.handle('themeFileExists', (event, fileName) => {
            return existsSync(resolve(app.getPath('userData'), 'themes', `${fileName}.css`))
        });

        // Copy Log File
        ipcMain.on('copyLogFile', (event) => {
            const data = readFileSync(app.log.transports.file.getFile().path, {encoding: 'utf8', flag: 'r'});
            clipboard.writeText(data)
            event.returnValue = true
        });

        // Electron-Store Renderer Handling for Getting Configuration
        ipcMain.on('getStore', (event) => {
            event.returnValue = app.cfg.store
        })

        // Electron-Store Renderer Handling for Setting Configuration
        ipcMain.on('setStore', (event, store) => {
            app.cfg.store = store
        })

        // Update Themes
        ipcMain.handle('updateThemes', () => {
            return app.ame.utils.updateThemes()
        });

        // Authorization (This needs to be cleaned up a bit, an alternative to reload() would be good )
        ipcMain.on('authorizationStatusDidChange', (_event, authorized) => {
            console.log(`authorization updated. status: ${authorized}`)
            app.win.reload()
            app.ame.load.LoadFiles()
            app.isAuthorized = (authorized === 3)
        })

        // Window Navigation - Minimize
        ipcMain.on('minimize', () => { // listen for minimize event
            if (typeof app.win.minimize === 'function') {
                app.win.minimize()
            }
        });

        // Window Navigation - Maximize
        ipcMain.on('maximize', () => { // listen for maximize event and perform restore/maximize depending on window state

            if (app.win.isMaximized()) {
                app.win.unmaximize()
                if (process.platform !== "win32") {
                    app.win.webContents.executeJavaScript(`document.querySelector("#maximize").classList.remove("maxed")`)
                }
            } else {
                app.win.maximize()
                if (process.platform !== "win32") {
                    app.win.webContents.executeJavaScript(`document.querySelector("#maximize").classList.add("maxed")`)
                }
            }
        })

        // Window Navigation - Close
        ipcMain.on('close', () => { // listen for close event
            app.win.close();
        })

        // Window Navigation - Back
        ipcMain.on('back', () => { // listen for back event
            if (app.win.webContents.canGoBack()) {
                app.win.webContents.goBack()
            }
        })

        // Window Navigation - Resize
        ipcMain.on("resize-window", (event, width, height) => {
            app.win.setSize(width, height)
        })

        // miniPlayer
        const minSize = app.win.getMinimumSize()
        ipcMain.on("set-miniplayer", (event, val) => {
            if (val) {
                app.isMiniplayerActive = true;
                app.win.setSize(300, 300);
                app.win.setMinimumSize(300, 55);
                app.win.setMaximumSize(300, 300);
                app.win.maximizable = false;
                app.win.webContents.executeJavaScript("_miniPlayer.setMiniPlayer(true)").catch((e) => console.error(e));
                if (app.win.isMaximized) {
                    app.win.unmaximize();
                }
            } else {
                app.isMiniplayerActive = false;
                app.win.setMaximumSize(9999, 9999);
                app.win.setMinimumSize(minSize[0], minSize[1]);
                app.win.setSize(1024, 600);
                app.win.maximizable = true;
                app.win.webContents.executeJavaScript("_miniPlayer.setMiniPlayer(false)").catch((e) => console.error(e));
            }
        })

        ipcMain.on("show-miniplayer-menu", () => {
            const menuOptions = [{
                type: "checkbox",
                label: "Always On Top",
                click: () => {
                    if (app.win.isAlwaysOnTop()) {
                        app.win.setAlwaysOnTop(false, 'screen')
                    } else {
                        app.win.setAlwaysOnTop(true, 'screen')
                    }
                },
                checked: app.win.isAlwaysOnTop()
            }, {
                label: "Exit Mini Player",
                click: () => {
                    ipcMain.emit("set-miniplayer", false)
                }
            },

            ]
            const menu = Menu.buildFromTemplate(menuOptions)
            menu.popup(app.win)
        })

        ipcMain.on("alwaysOnTop", (event, val) => {
            if (val) {
                app.win.setAlwaysOnTop(true, 'screen')
            } else {
                app.win.setAlwaysOnTop(false, 'screen')
            }
        })

        ipcMain.on("load-plugin", (event, plugin) => {
            let path = join(app.userPluginsPath, plugin.toLowerCase() + ".js")
            readFile(path, "utf-8", (error, data) => {
                if (!error) {
                    try {
                        app.win.webContents.executeJavaScript(data).then(() => {
                            console.verbose(`[Plugins] Injected Plugin`)
                        })
                    } catch (err) {
                        console.error(`[Plugins] error injecting plugin: ${path} - Error: ${err}`)
                    }
                } else {
                    console.error(`[Plugins] error reading plugin: ${path} - Error: ${error}`)
                }
            })
        })

        // Get Wallpaper
        ipcMain.on("get-wallpaper", (event) => {
            function base64_encode(file) {
                const bitmap = readFileSync(file)
                return `data:image/png;base64,${Buffer.from(bitmap).toString('base64')}`
            }

            regedit.list(`HKCU\\Control Panel\\Desktop\\`, (err, result) => {
                var path = (result['HKCU\\Control Panel\\Desktop\\\\']['values']['WallPaper']['value'])
                event.returnValue = base64_encode(path)
            })
        })

        ipcMain.on("get-wallpaper-style", (event) => {
            regedit.list(`HKCU\\Control Panel\\Desktop\\`, (err, result) => {
                var value = (result['HKCU\\Control Panel\\Desktop\\\\']['values']['WallpaperStyle']['value'])
                event.returnValue = parseInt(value)
            })
        })

        // Set BrowserWindow zoom factor
        ipcMain.on("set-zoom-factor", (event, factor) => {
            app.win.webContents.setZoomFactor(factor)
        })

    },

    LinkHandler: (startArgs) => {
        if (!startArgs || !app.win || !app.isAuthorized) return;


        if (String(startArgs).includes('auth')) {
            let authURI = String(startArgs).split('/auth/')[1]
            if (authURI.startsWith('lastfm')) { // If we wanted more auth options
                const authKey = authURI.split('lastfm?token=')[1];
                app.cfg.set('general.lastfm', true);
                app.cfg.set('tokens.lastfm', authKey);
                app.win.webContents.send('LastfmAuthenticated', authKey);
                app.ame.lastfm.authenticate()
            }
        } else {
            if (!app.isAuthorized) return
            const formattedSongID = startArgs.replace('ame://', '').replace('/', '');
            console.warn(`[LinkHandler] Attempting to load song id: ${formattedSongID}`);

            // setQueue can be done with album, song, url, playlist id
            app.win.webContents.executeJavaScript(`
                MusicKit.getInstance().setQueue({ song: '${formattedSongID}'}).then(function(queue) {
                    MusicKit.getInstance().play();
                });
            `).catch((err) => console.error(err));
        }

    },

    LyricsHandler: () => {
        app.lyrics = {
            neteaseWin: null,
            mxmWin: null,
            ytWin: null,
            artworkURL: '',
            savedLyric: ''
        }

        app.lyrics.neteaseWin = new BrowserWindow({
            width: 1,
            height: 1,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        app.lyrics.mxmWin = new BrowserWindow({
            width: 1,
            height: 1,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,

            },
        });

        app.lyrics.ytWin = new BrowserWindow({
            width: 1,
            height: 1,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,

            },
        });


        ipcMain.on('YTTranslation', function (event, track, artist, lang) {
            try {
                if (app.lyrics.ytWin == null) {
                    app.lyrics.ytWin = new BrowserWindow({
                        width: 1,
                        height: 1,
                        show: false,
                        autoHideMenuBar: true,
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false,
                        }
                    });


                } else {
                    app.lyrics.ytWin.webContents.send('ytcors', track, artist, lang);
                }
                if (!app.lyrics.ytWin.webContents.getURL().includes('youtube.html')) {
                    app.lyrics.ytWin.loadFile(join(__dirname, '../lyrics/youtube.html'));
                    app.lyrics.ytWin.webContents.on('did-finish-load', () => {
                        app.lyrics.ytWin.webContents.send('ytcors', track, artist, lang);
                    });
                }

                app.lyrics.ytWin.on('closed', () => {
                    app.lyrics.ytWin = null
                });

            } catch (e) {
                console.error(e)
            }
        });

        ipcMain.on('MXMTranslation', function (event, track, artist, lang, time) {
            try {
                if (app.lyrics.mxmWin == null) {
                    app.lyrics.mxmWin = new BrowserWindow({
                        width: 1,
                        height: 1,
                        show: false,
                        autoHideMenuBar: true,
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false,

                        }
                    });


                } else {
                    app.lyrics.mxmWin.webContents.send('mxmcors', track, artist, lang, time);
                }
                // try{

                // const cookie = { url: 'https://apic-desktop.musixmatch.com/', name: 'x-mxm-user-id', value: '' }
                // app.lyrics.mxmWin.webContents.session.defaultSession.cookies.set(cookie);
                // } catch (e){}
                if (!app.lyrics.mxmWin.webContents.getURL().includes('musixmatch.html')) {
                    app.lyrics.mxmWin.loadFile(join(__dirname, '../lyrics/musixmatch.html'));
                    app.lyrics.mxmWin.webContents.on('did-finish-load', () => {
                        app.lyrics.mxmWin.webContents.send('mxmcors', track, artist, lang, time);
                    });
                }

                app.lyrics.mxmWin.on('closed', () => {
                    app.lyrics.mxmWin = null
                });

            } catch (e) {
                console.error(e)
            }
        });
        ipcMain.on('NetEaseLyricsHandler', function (event, data) {
            try {
                if (app.lyrics.neteaseWin == null) {
                    app.lyrics.neteaseWin = new BrowserWindow({
                        width: 100,
                        height: 100,
                        show: false,
                        autoHideMenuBar: true,
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false,

                        }
                    });
                    app.lyrics.neteaseWin.webContents.on('did-finish-load', () => {
                        app.lyrics.neteaseWin.webContents.send('neteasecors', data);
                    });
                } else {
                    app.lyrics.neteaseWin.webContents.on('did-finish-load', () => {
                        app.lyrics.neteaseWin.webContents.send('neteasecors', data);
                    });
                }
                app.lyrics.neteaseWin.loadFile(join(__dirname, '../lyrics/netease.html'));
                app.lyrics.neteaseWin.on('closed', () => {
                    app.lyrics.neteaseWin = null
                });

            } catch (e) {
                console.log(e);

                app.lyrics.savedLyric = '[00:00] Instrumental. / Lyrics not found.';
                app.win.send('truelyrics', '[00:00] Instrumental. / Lyrics not found.');
            }
        });

        ipcMain.on('LyricsHandler', function (event, data, artworkURL) {

            app.win.send('truelyrics', data);
            app.win.send('albumart', artworkURL);
            app.lyrics.savedLyric = data;
            app.lyrics.albumart = artworkURL;
        });

        ipcMain.on('updateMiniPlayerArt', function (event, artworkURL) {
            app.lyrics.albumart = artworkURL;


        })
        ipcMain.on('LyricsHandlerNE', function (event, data) {

            app.win.send('truelyrics', data);
            app.lyrics.savedLyric = data;
        });

        ipcMain.on('LyricsHandlerTranslation', function (event, data) {

            app.win.send('lyricstranslation', data);
        });

        ipcMain.on('LyricsTimeUpdate', function (event, data) {

            app.win.send('ProgressTimeUpdate', data);
        });

        ipcMain.on('LyricsUpdate', function (event, data, artworkURL) {

            app.win.send('truelyrics', data);
            app.win.send('albumart', artworkURL);
            app.lyrics.savedLyric = data;
            app.lyrics.albumart = artworkURL;
        });

        ipcMain.on('LyricsMXMFailed', function (_event, _data) {
            app.win.send('backuplyrics', '');
            console.log("mxm failed");
        });

        ipcMain.on('LyricsYTFailed', function (_event, _data) {
            app.win.send('backuplyricsMV', '');
        });

        ipcMain.on('ProgressTimeUpdateFromLyrics', function (event, data) {
            app.win.webContents.executeJavaScript(`MusicKit.getInstance().seekToTime('${data}')`).catch((e) => console.error(e));
        });


    },

    AudioHandler: () => {
        ipcMain.on('muteAudio', function (event, mute) {
            app.win.webContents.setAudioMuted(mute);
        });

        if (process.platform === "win32") {
            const EAstream = new Stream.PassThrough();
            let ao;
            const portAudio = require('naudiodon');

            console.log(portAudio.getDevices());

            ipcMain.on('getAudioDevices', function (_event) {
                for (let id = 0; id < portAudio.getDevices().length; id++) {
                    if (portAudio.getDevices()[id].maxOutputChannels > 0)
                        app.win.webContents.executeJavaScript(`console.log('id:','${id}','${portAudio.getDevices()[id].name}','outputChannels:','${portAudio.getDevices()[id].maxOutputChannels}','preferedSampleRate','${portAudio.getDevices()[id].defaultSampleRate}','nativeFormats','${portAudio.getDevices()[id].hostAPIName}')`);
                }
            })

            ipcMain.on('enableExclusiveAudio', function (event, id) {
                ao = new portAudio.AudioIO({
                    outOptions: {

                        channelCount: 2,
                        sampleFormat: portAudio.SampleFormat24Bit,
                        sampleRate: 48000,
                        maxQueue: 100,
                        deviceId: id,
                        highwaterMark: 1024, // Use -1 or omit the deviceId to select the default device
                        closeOnError: false // Close the stream if an audio error is detected, if set false then just log the error
                    }
                });
                // Create a stream to pipe into the AudioOutput
                // Note that this does not strip the WAV header so a click will be heard at the beginning
                EAstream.pipe(ao);
                EAstream.once('data', (_data) => {
                    ao.start();
                })

                // Start piping data and start streaming

            })

            ipcMain.on('disableExclusiveAudio', function (_event, _data) {
                if (ao) {
                    ao.quit();
                }
            })

            app.win.on('quit', () => {
                if (ao) {
                    ao.quit();
                }
            })

            // mix the channels
            function interleave(leftChannel, rightChannel) {
                var length = leftChannel.length + rightChannel.length;
                var result = new Float32Array(length);

                var inputIndex = 0;

                for (var index = 0; index < length;) {
                    result[index++] = leftChannel[inputIndex];
                    result[index++] = rightChannel[inputIndex];
                    inputIndex++;
                }
                return result;
            }

            ipcMain.on('changeAudioMode', function (_event, _mode) {
                console.log(portAudio.getHostAPIs());
            });

            console.log(portAudio.getHostAPIs());

            ipcMain.on('writePCM', function (event, buffer) {
                //     writeFile(join(app.getPath('userData'), 'buffertest5.raw'), Buffer.from(buffer,'binary').slice(44),{flag: 'a+'}, function (err) {
                //         if (err) throw err;
                //          console.log('It\'s saved!');
                //    });
                // do anything with stereo pcm here
                // buffer = Buffer.from(new Int8Array(interleave(Float32Array.from(leftpcm), Float32Array.from(rightpcm)).buffer));
                EAstream.write(Buffer.from(buffer).slice(44));

            });

            ipcMain.on('writeChunks', function (event, blob) {
                writeFile(join(app.getPath('userData'), 'buffertest.raw'), Buffer.from(blob, 'binary'), {flag: 'a+'}, function (err) {
                    if (err) throw err;
                    console.log('It\'s saved!');
                });
            })

        }
    },

    GoogleCastHandler: () => {
        const devices = [],
            castDevices = [];

        let GCRunning = false,
            GCBuffer,
            expectedConnections = 0,
            currentConnections = 0,
            activeConnections = [],
            requests = [],
            GCstream = new Stream.PassThrough(),
            connectedHosts = {},
            port = false,
            server = false,
            bufcount = 0,
            bufcount2 = 0,
            headerSent = false;

        const audioserver = express();
        audioserver.get('/', playData.bind(this));

        function playData(req, res) {
            try{if(app.cfg.get('audio.castingBitDepth') == "24")
            headerSent = false;} catch (e){}
            console.log("Device requested: /");
            req.connection.setTimeout(Number.MAX_SAFE_INTEGER);
            requests.push({req: req, res: res});
            const pos = requests.length - 1;
            req.on("close", () => {
                console.info("CLOSED", requests.length);
                requests.splice(pos, 1);
                console.info("CLOSED", requests.length);
                headerSent = false;
            });


            GCstream.on('data', (data) => {
                try {
                    res.write(data);
                } catch (ex) {
                    console.log("Dead", ex);
                }
            })

        }

        audioserver.get('/a.wav', playData2.bind(this));

        function playData2(req, res) {
            console.log("Device requested: /a.wav");
            req.connection.setTimeout(Number.MAX_SAFE_INTEGER);
            try{if(app.cfg.get('audio.castingBitDepth') == "24")
            headerSent = false;} catch (e){}
            res.setHeader('Accept-Ranges', 'bytes')
            res.setHeader('Connection', 'keep-alive')
            res.setHeader('Content-Type', 'audio/wav')
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 200;
            res.setHeader('transferMode.dlna.org', 'Streaming');
            res.setHeader(
                'contentFeatures.dlna.org',
                'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000'
            );
            requests.push({req: req, res: res});
            const pos = requests.length - 1;
            req.on("close", () => {
                console.info("CLOSED", requests.length);
                requests.splice(pos, 1);
                console.info("CLOSED", requests.length);
                headerSent = false;
            });


            GCstream.on('data', (data) => {
                try {
                    res.write(data);
                } catch (ex) {
                    console.log("Dead", ex);
                }
            })

        }

        ipcMain.on('writeOPUS', function (event, buffer) {

            const pcm = Buffer.from(buffer, 'binary').slice(44); //stereo, 48k, 16signed in 8bit buffer

            // Pipe it to something else  (i.e. stdout)


            //     writeFile(join(app.getPath('userData'), 'buffertest3.raw'), Encoder.,{flag: 'a+'}, function (err) {
            //         if (err) throw err;
            //          console.log('It\'s saved!');
            //    });   
            //     //GCstream.write(mp3Tmp);

        })

        ipcMain.on('writeWAV', function (event, pcm, extremeAudio) {
                let pcmData;
                if (extremeAudio === '24') {
                    pcmData = Buffer.from(pcm, 'binary').slice(44);
                    if (!headerSent) {
                        const header = Buffer.from(pcm, 'binary').slice(0, 44)
                        header.writeUInt32LE(2147483600, 4)
                        header.writeUInt32LE(2147483600 + 44 - 8, 40)
                        GCstream.write(Buffer.concat([header, pcmData]));
                        headerSent = true;
                        console.log('done');
                    } else {
                        GCstream.write(pcmData);
                    }

                } else {
                    //sample down to 16 (default)
                    let wav = new WaveFile(Buffer.from(pcm, 'binary'));
                    wav.toBitDepth("16");
                    var newpcm = wav.toBuffer();
                    pcmData = Buffer.from(newpcm, 'binary').slice(44);
                    if (!headerSent) {
                        const header = Buffer.from(newpcm, 'binary').slice(0, 44)
                        header.writeUInt32LE(2147483600, 4)
                        header.writeUInt32LE(2147483600 + 44 - 8, 40)
                        GCstream.write(Buffer.concat([header, pcmData]));
                        headerSent = true;
                        console.log('done');
                    } else {
                        GCstream.write(pcmData);
                    }
                }
            }
        );

        function getServiceDescription(url, address) {
            const request = require('request');
            request.get(url, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    parseServiceDescription(body, address, url);
                }
            });
        }

        function ondeviceup(host, name, location, type) {
            if (castDevices.findIndex((item) => item.host === host && item.name === name && item.location === location && item.type === type) === -1) {
                castDevices.push({
                    name: name,
                    host: host,
                    location: location,
                    type: type
                });
                if (devices.indexOf(host) === -1) {
                    devices.push(host);
                }
                if (name) {
                    app.win.webContents.executeJavaScript(`console.log('deviceFound','ip: ${host} name:${name}')`).catch(err => console.error(err));
                    console.log("deviceFound", host, name);
                }
            } else {
                app.win.webContents.executeJavaScript(`console.log('deviceFound (added)','ip: ${host} name:${name}')`).catch(err => console.error(err));
                console.log("deviceFound (added)", host, name);
            }
        }
        
        function broadcastRemote() {
        const myString = getIp();
        const encoded = new Buffer(myString).toString('base64');
        var x =  mdns.tcp('ame-lg-client');   
        let server2 = mdns.createAdvertisement(x, '3839', { name: encoded });
        server2.start();

        let ssdpRemoteServer = express();
        ssdpRemoteServer.listen(3840, () => {
        });
        ssdpRemoteServer.get('/', (req, res) => {
            res.header("Content-Type", "application/xml");
            data = `<?xml version="1.0"?>
                <root xmlns="urn:schemas-upnp-org:device-1-0">
                    <specVersion>
                        <major>1</major>
                        <minor>0</minor>
                    </specVersion>
                    <URLBase>${'http://' + getIp()}</URLBase>
                    <device>
                        <deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>
                        <!-- The friendlyName element is the best place to put 
                            the title to display in the Physical Web Browser -->
                        <friendlyName>AME Remote</friendlyName>
                        <manufacturer>${encoded}</manufacturer>
                        <manufacturerURL>http://applemusicelectron.com</manufacturerURL>
                        <modelDescription>AME</modelDescription>
                        <modelName>AME</modelName>
                        <modelNumber>3.0</modelNumber>
                        <modelURL>${'http://' + getIp()}</modelURL>
                        <serialNumber>manufacturer's serial number</serialNumber>
                        <UDN>uuid:75ebacfb-e890-4a21-a913-9a16858e9270</UDN>
                        <UPC>Universal Product Code</UPC>
                       <serviceList>
                       <service>
                       <serviceType>urn:schemas-upnp-org:service:AVTransport:1</serviceType>
                       <serviceId>urn:upnp-org:serviceId:AVTransport</serviceId>
                       <SCPDURL></SCPDURL>
                       <controlURL></controlURL>
                       <eventSubURL></eventSubURL>
                       
                       </service>
                       </serviceList>
                    </device>
                </root> 
            `
            res.status(200).send(data); 
        });

        let SSDP = require('node-ssdp').Server
        , server = new SSDP({
            location : 'http://' + getIp() + ':3840',
            allowWildcards : true,
            adInterval : 5000,

        })
      ;
      
    //  server.addUSN('upnp:rootdevice');
      server.addUSN('urn:schemas-upnp-org:device:MediaRenderer:1');
      server.addUSN('urn:schemas-upnp-org:service:AVTransport:1');

      server.start().catch(e => {
        console.log('Failed to start server:', e)
      })
      .then(() => {
        console.log('Server started.')
      })
      
  
      process.on('exit', function(){
        server.stop() // advertise shutting down and stop listening
      })
        }
        
        function searchForGCDevices() {
            try {

                let browser = mdns.createBrowser(mdns.tcp('googlecast'));
                browser.on('ready', browser.discover);

                browser.on('update', (service) => {
                    if (service.addresses && service.fullname) {
                        ondeviceup(service.addresses[0], service.fullname.substring(0, service.fullname.indexOf("._googlecast")) + " " + (service.type[0].description ?? ""), '', 'googlecast');
                    }
                });

                // also do a SSDP/UPnP search
                let ssdpBrowser = new Client();
                ssdpBrowser.on('response',  (headers, statusCode, rinfo) => {
                     var location = getLocation(headers);
                     if (location != null) {
                         getServiceDescription(location, rinfo.address);
                     }

                });

                function getLocation(headers) {
                    let location = null;
                    if (headers["LOCATION"] != null ){location = headers["LOCATION"]}
                    else if (headers["Location"] != null ){location = headers["Location"]}
                    return location;
                }

                ssdpBrowser.search('urn:dial-multiscreen-org:device:dial:1');

                // actual upnp devices  
                if (app.cfg.get("audio.enableDLNA")) {
                    let ssdpBrowser2 = new Client();
                    ssdpBrowser2.on('response',  (headers, statusCode, rinfo) => {
                         var location = getLocation(headers);
                         if (location != null) {
                             getServiceDescription(location, rinfo.address);
                         }

                    });
                    ssdpBrowser2.search('urn:schemas-upnp-org:device:MediaRenderer:1');

                }


            } catch (e) {
                console.log('Search GC err', e);
            }
        }

        function setupGCServer() {
            return new Promise((resolve, reject) => {
                getPort()
                    .then(port2 => {
                        port = port2;
                        server = audioserver.listen(port, () => {
                            console.info('Example app listening at http://%s:%s', getIp(), port);
                        });
                        GCRunning = true;
                        resolve()
                    })
                    .catch(reject);
            });
        }
        broadcastRemote();
        function parseServiceDescription(body, address, url) {
            const parseString = require('xml2js').parseString;
            parseString(body, (err, result) => {
                if (!err && result && result.root && result.root.device) {
                    const device = result.root.device[0];
                    console.log('device', device);
                    let devicetype = 'googlecast';
                    console.log()
                    if (device.deviceType && device.deviceType.toString() === 'urn:schemas-upnp-org:device:MediaRenderer:1') {
                        devicetype = 'upnp';
                    }
                    ondeviceup(address, device.friendlyName.toString(), url, devicetype);
                }
            });
        }

        function loadMedia(client, song, artist, album, albumart, cb) {
            const u = 'http://' + getIp() + ':' + server.address().port + '/';
            client.launch(DefaultMediaReceiver, (err, player) => {
                if (err) {
                    console.log(err);
                    return;
                }
                let media = {
                    // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                    contentId: u,
                    contentType: 'audio/wav',
                    streamType: 'LIVE', // or LIVE

                    // Title and cover displayed while buffering
                    metadata: {
                        type: 0,
                        metadataType: 3,
                        title: song ?? "",
                        albumName: album ?? "",
                        artist: artist ?? "",
                        images: [
                            {url: albumart ?? ""}]
                    }
                };
                // ipcMain.on('setupNewTrack', function (event, song, artist, album, albumart) {
                //     try {

                //         let newmedia = {
                //             // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                //             contentId: u,
                //             contentType: 'audio/wav',
                //             streamType: 'LIVE', // or LIVE

                //             // Title and cover displayed while buffering
                //             metadata: {
                //                 type: 0,
                //                 metadataType: 3,
                //                 title: song ?? "",
                //                 albumName: album ?? '',
                //                 artist: artist ?? '',
                //                 images: [
                //                     {url: albumart ?? ''}]
                //             }
                //         };
                //         headerSent = false;

                //         player.queueUpdate(newmedia, {
                //             autoplay: true
                //         }, (err, status) => {
                //             console.log('media loaded playerState=%s', status);
                //         });

                //     } catch (e) {
                //         console.log('GCerror', e)
                //     }
                // });


                player.on('status', status => {
                    console.log('status broadcast playerState=%s', status);
                });

                console.log('app "%s" launched, loading media %s ...', player, media);

                player.load(media, {
                    autoplay: true
                }, (err, status) => {
                    console.log('media loaded playerState=%s', status);
                });


                client.getStatus((x, status) => {
                    if (status && status.volume) {
                        client.volume = status.volume.level;
                        client.muted = status.volume.muted;
                        client.stepInterval = status.volume.stepInterval;
                    }
                })

            });
        }

        function getIp() {
            let ip = false;
            let alias = 0;
            let ifaces = os.networkInterfaces();
            for (var dev in ifaces) {
                ifaces[dev].forEach(details => {
                    if (details.family === 'IPv4') {
                        if (!/(loopback|vmware|internal|hamachi|vboxnet|virtualbox)/gi.test(dev + (alias ? ':' + alias : ''))) {
                            if (details.address.substring(0, 8) === '192.168.' ||
                                details.address.substring(0, 7) === '172.16.' ||
                                details.address.substring(0, 3) === '10.'
                            ) {
                                ip = details.address;
                                ++alias;
                            }
                        }
                    }
                });
            }
            return ip;
        }

        function stream(device, song, artist, album, albumart) {
            let castMode = 'googlecast';
            let UPNPDesc = '';
            castMode = device.type;
            UPNPDesc = device.location;

            let client;
            if (castMode === 'googlecast') {
                let client = new audioClient();
                client.volume = 100;
                client.stepInterval = 0.5;
                client.muted = false;

                client.connect(device.host, () => {
                    console.log('connected, launching app ...', 'http://' + getIp() + ':' + server.address().port + '/');
                    if (!connectedHosts[device.host]) {
                        connectedHosts[device.host] = client;
                        activeConnections.push(client);
                    }
                    loadMedia(client, song, artist, album, albumart);
                });

                client.on('close', () => {
                    console.info("Client Closed");
                    for (let i = activeConnections.length - 1; i >= 0; i--) {
                        if (activeConnections[i] === client) {
                            activeConnections.splice(i, 1);
                            return;
                        }
                    }
                });

                client.on('error', err => {
                    console.log('Error: %s', err.message);
                    client.close();
                    delete connectedHosts[device.host];
                });

            } else {
                // upnp devices
                try {
                    client = new MediaRendererClient(UPNPDesc);
                    const options = {
                        autoplay: true,
                        contentType: 'audio/x-wav',
                        dlnaFeatures: 'DLNA.ORG_PN=-;DLNA.ORG_OP=01;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                        metadata: {
                            title: 'Apple Music Electron',
                            creator: 'Streaming ...',
                            type: 'audio', // can be 'video', 'audio' or 'image'
                            //  url: 'http://' + getIp() + ':' + server.address().port + '/',
                            //  protocolInfo: 'DLNA.ORG_PN=MP3;DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000;
                        }
                    };

                    client.load('http://' + getIp() + ':' + server.address().port + '/a.wav', options, function (err, _result) {
                        if (err) throw err;
                        console.log('playing ...');
                    });

                } catch (e) {
                }
            }
        }

        ipcMain.on('getKnownCastDevices', function (event) {
            event.returnValue = castDevices
        });

        ipcMain.on('performGCCast', function (event, device, song, artist, album, albumart) {
            setupGCServer().then(function () {
                app.win.webContents.setAudioMuted(true);
                console.log(device);
                stream(device, song, artist, album, albumart);
            })
        });

        ipcMain.on('getChromeCastDevices', function (_event, _data) {
            searchForGCDevices();
        });

        ipcMain.on('stopGCast', function (_event) {
            app.win.webContents.setAudioMuted(false);
            GCRunning = false;
            expectedConnections = 0;
            currentConnections = 0;
            activeConnections = [];
            requests = [];
            GCstream = new Stream.PassThrough();
            connectedHosts = {};
            port = false;
            server = false;
            bufcount = 0;
            bufcount2 = 0;
            headerSent = false;
        })
    }
}

module.exports = handler
