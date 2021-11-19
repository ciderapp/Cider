const {join, resolve} = require("path"),
    {app, ipcMain, systemPreferences} = require("electron"),
    {readFile, constants, chmodSync, existsSync, watch} = require("fs"),
    {initAnalytics} = require('./utils');
initAnalytics();

module.exports = {

    LoadCSS: function (path, theme, important) {
        const fileName = path
        if (theme) {
            path = join(app.userThemesPath, path.toLowerCase());
        } else {
            path = join(join(__dirname, '../css/'), path)
        }

        // Check that the file exists
        if (!existsSync(path)) {
            console.warn(`[LoadCSS] ${path} not found.`)
            return
        }

        // Remove previous inject (If there is one)
        if (app.injectedCSS[path]) {
            app.win.webContents.removeInsertedCSS(app.injectedCSS[fileName]).then(r => { if (r) console.error(r); });
        }

        // Get the CSS to inject
        readFile(path, "utf-8", function (error, data) {
            if (error) {
                console.error(`[LoadCSS] Error while injecting: '${path}' - ${error}`)
                try {
                    chmodSync(path, constants.S_IRUSR | constants.S_IWUSR);
                } catch (err) {
                    console.error(`[LoadCSS] ${err}`)
                }
            } else {
                let formattedData = data.replace(/\s{2,10}/g, ' ').trim();
                app.win.webContents.insertCSS(formattedData, {cssOrigin: (important ? 'user' : 'author')}).then((key) => {
                    console.verbose(`[${theme ? 'LoadTheme' : 'LoadCSS'}] '${fileName}' successfully injected.`)
                    app.injectedCSS[fileName] = key
                });
            }
        });
    },

    LoadJS: function (path, formatting = true) {
        const fileName = path;
        path = join(join(__dirname, '../js/'), path)

        readFile(path, "utf-8", function (error, data) {
            if (!error) {
                try {
                    let formattedData = data
                    if (formatting) {
                        formattedData = data.replace(/\s{2,10}/g, ' ').trim();
                    }
                    app.win.webContents.executeJavaScript(formattedData).then(() => {
                        console.verbose(`[LoadJSFile] '${fileName}' successfully injected.`)
                    });
                } catch (err) {
                    console.error(`[LoadJSFile] Error while injecting: '${fileName}' - Error: ${err}`)
                }
            } else {
                console.error(`[LoadJSFile] Error while reading: '${fileName}' - Error: ${error}`)
            }
        });
    },

    LoadWebsite: function (win) {
        if (!win) return;

        app.storefront = app.cfg.get('general.storefront');
        const urlBase = app.cfg.get('advanced.useBetaSite') ? 'https://beta.music.apple.com' : 'https://music.apple.com/' + app.cfg.get('general.storefront'),
            urlFallback = `https://music.apple.com/`;

        ipcMain.once('userAuthorized', (e, args) => {
            app.isAuthorized = true
            console.log(`[LoadWebsite] User Authenticated. Setting page to: ${args}`)
            win.webContents.clearHistory()
        })

        win.loadURL(urlBase).then(() => {
            app.ame.load.LoadJS('checkAuth.js')
        }).catch((err) => {
            win.loadURL(urlFallback).then(() => console.error(`[LoadWebsite] '${urlBase}' was unavailable, falling back to '${urlFallback}' | ${err}`))
        })
    },

    LoadFiles: function () {
        app.ame.load.LoadJS('settingsPage.js');
        if (app.cfg.get('visual.removeAppleLogo')) {
            app.win.webContents.insertCSS(`
            @media only screen and (max-width: 483px) {
                .web-navigation__nav-list {
                        margin-top: 50px;
                    }
                }
            }
            `).catch((e) => console.error(e));
        }

        if (app.cfg.get('visual.useOperatingSystemAccent') && (process.platform === "win32" || process.platform === "darwin")) {
            if (systemPreferences.getAccentColor()) {
                const accent = '#' + systemPreferences.getAccentColor().slice(0, -2)
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
        } else {
            app.ame.win.removeInsertedCSS('useOperatingSystemAccent')
        }

        /* Load Window Frame */
        if (app.cfg.get('visual.frameType') === 'mac') {
            app.ame.load.LoadJS('frame_macOS.js')
        } else if ((app.cfg.get('visual.frameType') === 'mac-right')) {
            app.ame.load.LoadJS('frame_Windows.js')
        } else if (process.platform === 'darwin' && !app.cfg.get('visual.frameType')) {
            app.ame.load.LoadJS('frame_macOS.js')
        } else if (process.platform === 'win32' && !app.cfg.get('visual.frameType')) {
            app.ame.load.LoadJS('frame_Windows.js')
            if (app.win.isMaximized()) {
                app.win.webContents.executeJavaScript(`if (document.querySelector("#maximize")) { document.querySelector("#maximize").classList.add("maxed"); }`).catch((e) => console.error(e));
            }
        }

        const BackButtonChecks = (url) => {
            if (!app.win.webContents.canGoBack()) return false
            const backButtonBlacklist = [`*music.apple.com/*/listen-now*`, `*music.apple.com/*/browse*`, `*music.apple.com/*/radio*`, `*music.apple.com/*/search*`, `*music.apple.com/library/recently-added?l=*`, `*music.apple.com/library/albums?l=*`, `*music.apple.com/library/songs?l=*`, `*music.apple.com/library/made-for-you?l=*`, `*music.apple.com/library/recently-added`, `*music.apple.com/library/albums`, `*music.apple.com/library/made-for-you`, `*music.apple.com/library/songs*`, `*music.apple.com/library/artists/*`, `*music.apple.com/library/playlist/*`];
            let blacklistPassed = true
            backButtonBlacklist.forEach((item) => {
                if (!blacklistPassed) return;
                if (app.ame.utils.matchRuleShort(url, item) || url === item) {
                    blacklistPassed = false
                }
            });
            return blacklistPassed
        }

        /* Load Back Button */
        if (BackButtonChecks(app.win.webContents.getURL())) {
            app.ame.load.LoadJS('backButton.js')
            app.win.webContents.executeJavaScript(`document.body.setAttribute('back-button', 1)`)
        } else { /* Removes the button if the check failed. */
            app.win.webContents.executeJavaScript(`if (document.querySelector('#backButtonBar')) { document.getElementById('backButtonBar').remove() };`).catch((e) => console.error(e));
            app.win.webContents.executeJavaScript(`document.body.removeAttribute('back-button')`)
        }

        /* Load the Startup JavaScript Function */
        app.win.webContents.executeJavaScript('if (AMJavaScript) { AMJavaScript.LoadCustom(); }').catch((e) => console.error(e));
    },

    LoadOneTimeFiles: function () {
        // Inject the custom stylesheet
        app.ame.load.LoadCSS('custom-stylesheet.css')       
        app.ame.load.LoadCSS('ameframework.css')

        // Inject Plugin Interaction
        if (app.pluginsEnabled) {
            app.ame.load.LoadJS('pluginSystem.js', false)
        }
        // Load this first so it doesn't stuck
        app.ame.load.LoadJS('OpusMediaRecorder.umd.js')
        app.ame.load.LoadJS('encoderWorker.umd.js')
        

        // Lyrics
        app.ame.load.LoadJS('lyrics.js')

        // Vue Test
        app.ame.load.LoadJS('vue.js')
        app.ame.load.LoadJS('utils.js', false)
        app.ame.load.LoadJS('tests.js', false)
        // wsapi
        app.ame.load.LoadJS('WSAPI_Interop.js', false)
        // wsapi
        
        // Bulk JavaScript Functions
        app.ame.load.LoadJS('custom.js')

        // Audio Manuipulation Stuff

        app.ame.load.LoadJS('eq.js')


        // Window Frames
        if (app.cfg.get('visual.frameType') === 'mac') {
            app.ame.load.LoadCSS('frame_macOS_emulation.css')
        } else if (app.cfg.get('visual.frameType') === 'mac-right') {
            app.ame.load.LoadCSS('frame_macOS_emulation_right.css')
        } else if (process.platform === 'win32' && !app.cfg.get('visual.frameType')) {
            app.ame.load.LoadCSS('frame_Windows.css')
        }

        // Set the settings variables if needed
        if (app.cfg.get('visual.frameType') === 'mac' || app.cfg.get('visual.frameType') === 'mac-right') {
            app.cfg.set('visual.removeUpsell', true);
            app.cfg.set('visual.removeAppleLogo', true);
        }

        // Streamer Mode
        if (app.cfg.get('visual.streamerMode')) {
            app.ame.load.LoadCSS('streamerMode.css')
        }

        /* Remove the Scrollbar */
        if (app.cfg.get('visual.removeScrollbars')) {
            app.win.webContents.insertCSS('::-webkit-scrollbar { display: none; }').then()
        } else {
            app.ame.load.LoadCSS('macosScrollbar.css')
        }

        /* Inject the MusicKitInterop file */
        app.win.webContents.executeJavaScript('MusicKitInterop.init()').catch((e) => console.error(e));

        /* Watches for changes to a theme */
        if (app.watcher) {
            app.watcher.close();
            console.verbose('[Watcher] Removed old watcher.')
        }

        if (existsSync(resolve(app.getPath('userData'), 'themes', `${app.cfg.get('visual.theme')}.css`)) && app.cfg.get('visual.theme') !== "default" && app.cfg.get('visual.theme')) {
            app.watcher = watch(resolve(app.getPath('userData'), 'themes', `${app.cfg.get('visual.theme')}.css`), (event, fileName) => {
                if (event === "change" && fileName === `${app.cfg.get('visual.theme')}.css`) {
                    app.win.webContents.executeJavaScript(`AMStyling.loadTheme("${app.cfg.get('visual.theme')}", true);`).catch((err) => console.error(err));
                }
            });
            console.verbose(`[Watcher] Watching for changes: 'themes/${app.cfg.get('visual.theme')}.css'`)
        }
    }
}