const {app, nativeImage, nativeTheme, Notification, dialog} = require("electron"),
    {existsSync, readFileSync, readdirSync, constants, access, writeFileSync, copyFileSync} = require("fs"),
    {readdir, mkdir} = require("fs/promises"),
    {join, resolve} = require("path"),
    {autoUpdater} = require("electron-updater"),
    os = require("os"),
    rimraf = require("rimraf"),
    chmod = require("chmodr"),
    clone = require("git-clone/promise"),
    trayIconDir = (nativeTheme.shouldUseDarkColors ? join(__dirname, `../icons/media/light/`) : join(__dirname, `../icons/media/dark/`)),
    ElectronSentry = require("@sentry/electron");

const Utils = {

    /* hexToRgb - Converts hex codes to rgb */
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /* matchRuleShort - Used for wildcards */
    matchRuleShort: (str, rule) => {
        var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
    },

    /* isVibrancySupported - Checks if the operating system support electron-acrylic-window (Windows 10 or greater) */
    isVibrancySupported: () => {
        return (process.platform === 'win32' && parseInt(os.release().split('.')[0]) >= 10)
    },

    /* isAcrylicSupported - Checks if the operating system supports the acrylic transparency affect (Windows RS3 (Redstone 3) 1709 or Greater) */
    isAcrylicSupported: () => {
        return (process.platform === 'win32' && parseInt(os.release().replace(/\./g, "").replace(',', '.')) >= 10016299)
    },

    /* fetchThemeMeta - Fetches the meta data associated to a theme */
    fetchThemeMeta: (fileName) => {
        const filePath = resolve(app.getPath("userData"), "themes", `${fileName}.css`);

        let fileMeta = {
            name: null,
            author: null,
            description: null,
            transparency: {dark: null, light: null},
            options: []
        };

        if (!existsSync(filePath)) return fileMeta;
        const file = readFileSync(filePath, "utf8");
        if (!file) return;

        file.split(/\r?\n/).forEach((line) => {
            if (line.includes("@name")) {
                fileMeta.name = line.split("@name ")[1].trim();
            }

            if (line.includes("@author")) {
                fileMeta.author = line.split("@author ")[1].trim();
            }

            if (line.includes("@description")) {
                fileMeta.description = line.split("@description ")[1]
            }

            if (line.includes("@option")) {
                var themeOption = line.split("@option ")[1].trim().split("|")
                fileMeta.options.push({
                    key: themeOption[0],
                    name: themeOption[1],
                    defaultValue: themeOption[2]
                })
            }

            if (line.includes("--lightTransparency")) {
                fileMeta.transparency.light = line.split("--lightTransparency: ")[1].trim().split(' ')[0];
            }

            if (line.includes("--darkTransparency")) {
                fileMeta.transparency.dark = line.split("--darkTransparency: ")[1].trim().split(' ')[0];
            }

            if (fileMeta.transparency.dark && fileMeta.transparency.light) {
                fileMeta.transparency = nativeTheme.shouldUseDarkColors ? fileMeta.transparency.dark : fileMeta.transparency.light
            }

            if (!fileMeta.transparency.dark || !fileMeta.transparency.light) {
                if (line.includes("--transparency")) {
                    fileMeta.transparency = line.split("--transparency: ")[1].split(' ')[0];
                }
            }
        });

        if (typeof fileMeta.transparency == "object") {
            if (!fileMeta.transparency.dark || !fileMeta.transparency.light) {
                fileMeta.transparency = false;
            }
        }

        console.verbose(`[fetchThemeMeta] Returning ${JSON.stringify(fileMeta)}`);
        return fileMeta
    },

    /* fetchTransparencyOptions - Fetches the transparency options */
    fetchTransparencyOptions: () => {
        if (process.platform === "darwin" && (!app.cfg.get('visual.transparencyEffect') || !Utils.isVibrancySupported())) {
            app.transparency = true;
            return "fullscreen-ui"
        } else if (!app.cfg.get('visual.transparencyEffect') || !Utils.isVibrancySupported()) {
            console.verbose(`[fetchTransparencyOptions] Vibrancy not created. Required options not met. (transparencyEffect: ${app.cfg.get('visual.transparencyEffect')} | isVibrancySupported: ${Utils.isVibrancySupported()})`);
            app.transparency = false;
            return false
        } else if (process.platform === "win32" && app.cfg.get('visual.transparencyEffect') === "mica") {
            return false
        }

        console.log('[fetchTransparencyOptions] Fetching Transparency Options')
        let transparencyOptions = {
            theme: null,
            effect: app.cfg.get('visual.transparencyEffect'),
            debug: app.cfg.get('advanced.verboseLogging'),
        }

        //------------------------------------------
        //  Disable on blur for acrylic
        //------------------------------------------
        if (app.cfg.get('visual.transparencyEffect') === 'acrylic') {
            transparencyOptions.disableOnBlur = app.cfg.get('visual.transparencyDisableBlur');
        }

        //------------------------------------------
        //  Set the transparency theme
        //------------------------------------------
        if (app.cfg.get('visual.transparencyTheme') === 'appearance-based') {
            if (app.cfg.get('visual.theme') && app.cfg.get('visual.theme') !== "default") {
                transparencyOptions.theme = Utils.fetchThemeMeta(app.cfg.get('visual.theme')).transparency; /* Fetch the Transparency from the Themes Folder */
            } else if ((!app.cfg.get('visual.theme') || app.cfg.get('visual.theme') === "default") && app.cfg.get('visual.transparencyEffect') === 'acrylic') {
                transparencyOptions.theme = (nativeTheme.shouldUseDarkColors ? '#3C3C4307' : '#EBEBF507') /* Default Theme when Using Acrylic */
            } else { // Fallback
                transparencyOptions.theme = (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
            }
        } else {
            transparencyOptions.theme = app.cfg.get('visual.transparencyTheme');
        }

        //------------------------------------------
        //  Set the refresh rate
        //------------------------------------------
        if (app.cfg.get('visual.transparencyMaximumRefreshRate')) {
            transparencyOptions.useCustomWindowRefreshMethod = true
            transparencyOptions.maximumRefreshRate = app.cfg.get('visual.transparencyMaximumRefreshRate')
        }

        app.transparency = true
        console.log(`[fetchTransparencyOptions] Returning: ${JSON.stringify(transparencyOptions)}`)
        return transparencyOptions
    },

    /* fetchThemesListing - Fetches the themes directory listing (Lists .css files) */
    fetchThemesListing: () => {
        if (!existsSync(resolve(app.getPath("userData"), "themes"))) return;

        let themesFileNames = [], themesListing = {};


        readdirSync(resolve(app.getPath("userData"), "themes")).forEach((value) => {
            if (value.split('.').pop() === 'css') {
                themesFileNames.push(value.split('.').shift())
            }
        });

        // Get the Info
        themesFileNames.forEach((themeFileName) => {
            const themeData = Utils.fetchThemeMeta(themeFileName);
            if (themeData && themeData.name && themeData.description && themeData.author) {
                themesListing[themeFileName] = themeData;
            }
        })

        return themesListing
    },

    /* fetchPluginsListing - Fetches the plugins directory listing (Lists .js files) */
    fetchPluginsListing: () => {
        if (!existsSync(resolve(app.getPath("userData"), "plugins"))) return;

        let pluginsFileNames = [], pluginsListing = {};


        readdirSync(resolve(app.getPath("userData"), "plugins")).forEach((value) => {
            if (value.split('.').pop() === 'js') {
                pluginsFileNames.push(value.split('.').shift())
            }
        });

        console.log(pluginsFileNames)

        return pluginsFileNames
    },

    /* fetchOperatingSystem - Fetches the operating system name */
    fetchOperatingSystem: () => {
        if (process.platform === "win32") {
            const release = parseInt(os.release().replaceAll('.', ''))
            if (release >= 10022000) {
                return 'Windows 11'
            } else if (release < 10022000 && release >= 10010240) {
                return 'Windows 10'
            }
        }
    },

    /* updateThemes - Purges the themes directory and clones a fresh copy of the themes */
    updateThemes: async () => {
        if (app.watcher) {
            app.watcher.close()
        }

        const tmpDir = join(os.tmpdir(), "ame-themes")
        const themesDir = join(app.getPath("userData"), "themes")

        if (existsSync(themesDir)) {
            if (existsSync(tmpDir)) {
                rimraf(tmpDir, [], async (err) => {
                    if (err) return err
                    await clone('https://github.com/Apple-Music-Electron/Apple-Music-Electron-Themes', tmpDir, [], (err) => console.log(err))
                })
            } else {
                await mkdir(tmpDir, {recursive: true})
                await clone('https://github.com/Apple-Music-Electron/Apple-Music-Electron-Themes', tmpDir, [], (err) => console.log(err))
            }

            // Base Line Directory Comparison
            const updateList = await readdir(tmpDir);
            const foundChanges = {};

            for (const file of updateList) {
                if (file.split('.').pop() === 'css' && file !== "Template.css") { // Reduces listing compare down to css files
                    console.verbose(`[compareDirectories] Comparing ${file}`)

                    if (!existsSync(join(themesDir, file))) {
                        copyFileSync(join(tmpDir, file), join(themesDir, file))
                        foundChanges[file] = 'added'
                    } else {
                        const updateFile = readFileSync(join(tmpDir, file));
                        const origFile = readFileSync(join(themesDir, file));

                        if (origFile.toString() !== updateFile.toString()) {
                            writeFileSync(join(themesDir, file), updateFile)
                            foundChanges[file] = 'updated'
                        }
                    }
                }
            }

            return foundChanges
        } else {
            await mkdir(tmpDir, {recursive: true})
            await clone('https://github.com/Apple-Music-Electron/Apple-Music-Electron-Themes', themesDir, [], (err) => console.log(err))
            return {'initial': true}
        }


    },

    /* permissionsCheck - Checks of the file can be read and written to, if it cannot be chmod -r is run on the directory */
    permissionsCheck: (folder, file) => {
        console.verbose(`[permissionsCheck] Running check on ${join(folder, file)}`)
        access(join(folder, file), constants.R_OK | constants.W_OK, (err) => {
            if (err) { // File cannot be read after cloning
                console.error(`[permissionsCheck][access] ${err}`)
                chmod(folder, 0o777, (err) => {
                    if (err) {
                        console.error(`[permissionsCheck][chmod] ${err} - Theme set to default to prevent application launch halt.`);
                    }
                });
            } else {
                console.verbose('[permissionsCheck] Check passed.')
            }
        })
    },

    /* initAnalytics - Sentry Analytics */
    initAnalytics: () => {
        if (app.cfg.get('general.analyticsEnabled') && app.isPackaged) {
            ElectronSentry.init({dsn: "https://20e1c34b19d54dfcb8231e3ef7975240@o954055.ingest.sentry.io/5903033"});
        }
    },

    /* checkForUpdates - Checks for update using electron-updater (Part of electron-builder) */
    checkForUpdates: (manual) => {
        if (!app.isPackaged || process.env.NODE_ENV !== 'production') return;

        autoUpdater.logger = require("electron-log");
        autoUpdater.logger.transports.file.resolvePath = (vars) => {
            return join(app.getPath('userData'), 'logs', vars.fileName);
        }
        autoUpdater.logger.transports.file.level = "info";

        if (app.cfg.get('advanced.autoUpdaterBetaBuilds')) {
            autoUpdater.allowPrerelease = true
            autoUpdater.allowDowngrade = false
        }

        autoUpdater.on('update-not-available', () => {
            if (manual === true) {
                let bodyVer = `You are on the latest version. (v${app.getVersion()})`
                new Notification({title: "Apple Music", body: bodyVer}).show()
            }
        })

        autoUpdater.on('download-progress', (progress) => {
            let convertedProgress = parseFloat(progress);
            app.win.setProgressBar(convertedProgress)
        })

        autoUpdater.on("error", function (error) {
            console.error(`[checkForUpdates] Error ${error}`)
        });

        autoUpdater.on('update-downloaded', (updateInfo) => {
            console.warn('[checkForUpdates] New version downloaded. Starting user prompt.');

            dialog.showMessageBox({
                type: 'info',
                title: 'Updates Available',
                message: `Update was found and downloaded, would you like to install the update now?`,
                details: updateInfo,
                buttons: ['Sure', 'No']
            }).then(({response}) => {
                if (response === 0) {
                    const isSilent = true;
                    const isForceRunAfter = true;
                    autoUpdater.quitAndInstall(isSilent, isForceRunAfter);
                } else {
                    updater.enabled = true
                    updater = null
                }
            })

        })

        autoUpdater.checkForUpdates()
            .then(r => {
                console.verbose(`[checkForUpdates] Check for updates completed. Response: ${r}`)
            })
            .catch(err => {
                console.error(`[checkUpdates] An error occurred while checking for updates: ${err}`)
            })
    },

    /* Media Controlling Functions (Pause/Play/Skip/Previous) */
    media: {
        pausePlay() {
            console.verbose('[AppleMusic] pausePlay run.')
            app.win.webContents.executeJavaScript("MusicKitInterop.pausePlay()").catch((err) => console.error(err))
        },

        nextTrack() {
            console.verbose('[AppleMusic] nextTrack run.')
            app.win.webContents.executeJavaScript("MusicKitInterop.nextTrack()").catch((err) => console.error(err))
        },

        previousTrack() {
            console.verbose('[AppleMusic] previousTrack run.')
            app.win.webContents.executeJavaScript("MusicKitInterop.previousTrack()").catch((err) => console.error(err))
        }
    },

    /* Media-associated Icons (Used for Thumbar and TouchBar) */
    icons: {
        pause: nativeImage.createFromPath(join(trayIconDir, 'pause.png')).resize({width: 32, height: 32}),
        play: nativeImage.createFromPath(join(trayIconDir, 'play.png')).resize({width: 32, height: 32}),
        nextTrack: nativeImage.createFromPath(join(trayIconDir, 'next.png')).resize({width: 32, height: 32}),
        previousTrack: nativeImage.createFromPath(join(trayIconDir, 'previous.png')).resize({width: 32, height: 32}),
        inactive: {
            play: nativeImage.createFromPath(join(trayIconDir, 'play-inactive.png')).resize({width: 32, height: 32}),
            nextTrack: nativeImage.createFromPath(join(trayIconDir, 'next-inactive.png')).resize({
                width: 32,
                height: 32
            }),
            previousTrack: nativeImage.createFromPath(join(trayIconDir, 'previous-inactive.png')).resize({
                width: 32,
                height: 32
            }),
        }
    }
}

Utils.initAnalytics()
module.exports = Utils;