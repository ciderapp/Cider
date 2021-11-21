const {app, nativeTheme, nativeImage, Tray} = require("electron"),
    {join, resolve} = require("path"),
    os = require("os"),
    {existsSync, readdirSync} = require("fs"),
    regedit = require("regedit"),
    {initAnalytics} = require('./utils');
initAnalytics();

const init = {

    BaseInit: () => {
        const censoredConfig = app.cfg.store;
        censoredConfig.tokens = {};

        console.log('---------------------------------------------------------------------')
        console.log(`${app.getName()} has started.`);
        console.log(`Version: ${app.getVersion()} | Electron Version: ${process.versions.electron}`)
        console.log(`Type: ${os.type} | Release: ${os.release()} ${app.ame.utils.fetchOperatingSystem() ? `(${app.ame.utils.fetchOperatingSystem()})` : ""} | Platform: ${os.platform()}`)
        console.log(`User Data Path: '${app.getPath('userData')}'`)
        console.log(`Current Configuration: ${JSON.stringify(censoredConfig)}`)
        console.log("---------------------------------------------------------------------")
        if (app.cfg.get('general.analyticsEnabled') && app.isPackaged) console.log('[Sentry] Sentry logging is enabled, any errors you receive will be presented to the development team to fix for the next release.')
        console.verbose('[InitializeBase] Started.');

        // Disable CORS
        app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')
        app.commandLine.appendSwitch('high-dpi-support', 'true')
        if (process.platform === "win32") {
            app.commandLine.appendSwitch('force-device-scale-factor', '1')
        }

        if (app.cfg.get('advanced.verboseLogging')) {
            app.commandLine.appendSwitch('--enable-logging');
            app.commandLine.appendSwitch('--log-file', join(app.getPath('userData'), 'logs', 'renderer.log'));
            console.verbose(`[InitializeBase] Renderer logging setup at ${join(app.getPath('userData'), 'logs', 'renderer.log')}`);
        }

        // Media Key Hijacking
        if (app.cfg.get('advanced.preventMediaKeyHijacking')) {
            console.log("[Apple-Music-Electron] Hardware Media Key Handling disabled.")
            app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');
        }

        // GPU Hardware Acceleration
        if (!app.cfg.get('advanced.hardwareAcceleration')) {
            app.commandLine.appendSwitch('disable-gpu')
        }

        // Registry
        if (process.platform === "win32") {
            regedit.setExternalVBSLocation("resources/regedit/vbs")
        }

        // Sets the ModelId (For windows notifications)
        if (process.platform === "win32") app.setAppUserModelId(app.getName());

        // Disable the Media Session to allow MPRIS to be the primary service
        if (process.platform === "linux") app.commandLine.appendSwitch('disable-features', 'MediaSessionService');

        // Assign Default Variables
        app.isQuiting = (app.isQuiting ? app.isQuiting : false);
        app.win = '';
        app.ipc = {
            existingNotification: false
        };

        if (app.cfg.get('general.incognitoMode')) {
            console.log("[Incognito] Incognito Mode enabled. DiscordRPC and LastFM updates are ignored.")
        }

        /* Protocols for Link Handling */
        if (process.defaultApp) {
            if (process.argv.length >= 2) {
                app.setAsDefaultProtocolClient('ame', process.execPath, [resolve(process.argv[1])])
                app.setAsDefaultProtocolClient('itms', process.execPath, [resolve(process.argv[1])])
                app.setAsDefaultProtocolClient('itmss', process.execPath, [resolve(process.argv[1])])
                app.setAsDefaultProtocolClient('musics', process.execPath, [resolve(process.argv[1])])
                app.setAsDefaultProtocolClient('music', process.execPath, [resolve(process.argv[1])])
            }
        } else {
            app.setAsDefaultProtocolClient('ame') // Custom AME Protocol
            app.setAsDefaultProtocolClient('itms') // iTunes HTTP Protocol
            app.setAsDefaultProtocolClient('itmss') // iTunes HTTPS Protocol
            app.setAsDefaultProtocolClient('musics') // macOS Client Protocol
            app.setAsDefaultProtocolClient('music') // macOS Client Protocol
        }

        app.on('open-url', (event, url) => {
            event.preventDefault()
            if (url.includes('ame://') || url.includes('itms://') || url.includes('itmss://') || url.includes('musics://') || url.includes('music://')) {
                app.ame.handler.LinkHandler(url)
            }
        })

        // Running the Application on Login
        if (app.cfg.get('window.appStartupBehavior')) {
            app.setLoginItemSettings({
                openAtLogin: true,
                args: [
                    '--process-start-args', `${app.cfg.get('window.appStartupBehavior') === 'hidden' ? "--hidden" : (app.cfg.get('window.appStartupBehavior') === 'minimized' ? "--minimized" : "")}`
                ]
            })
        }

        // Set Max Listener
        require('events').EventEmitter.defaultMaxListeners = Infinity;
    },

    LoggingInit: () => {
        app.log = require("electron-log");

        if (app.commandLine.hasSwitch('verbose')) {
            app.verboseLaunched = true
        }

        app.log.transports.file.resolvePath = (vars) => {
            return join(app.getPath('userData'), 'logs', vars.fileName);
        }

        Object.assign(console, app.log.functions);

        console.verbose = () => {
        };

        if (app.cfg.get('advanced.verboseLogging') || app.verboseLaunched) {
            console.verbose = app.log.debug
        } else {
            console.verbose = function (_data) {
                return false
            };
        }
    },

    ThemeInstallation: () => {
        const themesPath = join(app.getPath('userData'), "themes");

        // Check if the themes folder exists and check permissions
        if (existsSync(join(themesPath, 'README.md'))) {
            console.verbose('[ThemeInstallation] Themes Directory Exists. Running Permission Check.')
            app.ame.utils.permissionsCheck(themesPath, 'README.md')
        } else {
            app.ame.utils.updateThemes().catch(err => console.error(err))
        }

        // Save all the file names to array and log it
        if (existsSync(themesPath)) {
            console.log(`[InitializeTheme] Files found in Themes Directory: [${readdirSync(themesPath).join(', ')}]`)
        }

        // Set the default theme
        if (app.cfg.get('advanced.forceApplicationMode')) {
            nativeTheme.themeSource = app.cfg.get('advanced.forceApplicationMode')
        }
    },

    PluginInstallation: () => {
        if (!existsSync(resolve(app.getPath("userData"), "plugins"))) {
            return;
        }

        // Check if the plugins folder exists and check permissions
        app.pluginsEnabled = true;
        console.log("[PluginInstallation][existsSync] Plugins folder exists!");
        app.ame.utils.permissionsCheck(app.userPluginsPath, '/');
        app.ame.utils.fetchPluginsListing();

        // Save all the file names to array and log it
        console.log(`[PluginInstallation] Files found in Plugins Directory: [${readdirSync(resolve(app.getPath("userData"), "plugins")).join(', ')}]`);
    },

    AppReady: () => {
        console.verbose('[ApplicationReady] Started.');
        app.pluginsEnabled = false;

        // Run the Functions
        init.ThemeInstallation()
        init.PluginInstallation()
        init.TrayInit()

        app.ame.mpris.connect(); // M.P.R.I.S
        app.ame.lastfm.authenticate(); // LastFM
        app.ame.discord.connect(app.cfg.get('general.discordRPC') === 'ame-title' ? '911790844204437504' : '886578863147192350'); // Discord

        app.isAuthorized = false;
        app.isMiniplayerActive = false;
        app.injectedCSS = {}
        app.media = {status: false, playParams: {id: 'no-id-found'}};
        
        /** wsapi */
        // app.ame.wsapi.inAppUI()
        /** wsapi */
    },

    TrayInit: () => {
        console.verbose('[InitializeTray] Started.');

        const winTray = nativeImage.createFromPath(join(__dirname, `../icons/icon.ico`)).resize({
            width: 32,
            height: 32
        })
        const macTray = nativeImage.createFromPath(join(__dirname, `../icons/icon.png`)).resize({
            width: 20,
            height: 20
        })
        const linuxTray = nativeImage.createFromPath(join(__dirname, `../icons/icon.png`)).resize({
            width: 32,
            height: 32
        })
        let trayIcon;
        if (process.platform === "win32") {
            trayIcon = winTray
        } else if (process.platform === "linux") {
            trayIcon = linuxTray
        } else if (process.platform === "darwin") {
            trayIcon = macTray
        }

        app.tray = new Tray(trayIcon)
        app.tray.setToolTip(app.getName());
        app.ame.win.SetContextMenu(true);

        app.tray.on('double-click', () => {
            if (typeof app.win.show === 'function') {
                if (app.win.isVisible()) {
                    app.win.focus()
                } else {
                    app.win.show()
                }
            }
        })
    }
}

module.exports = init