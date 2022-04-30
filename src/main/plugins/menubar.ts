import {app, Menu, shell} from "electron";
import {utils} from "../base/utils";

export default class Thumbar {

    private i18n: any = undefined;
    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'Menubar Plugin';
    public description: string = 'Creates the menubar';
    public version: string = '1.0.0';
    public author: string = 'Core';
    public contributors: string[] = ['Core', 'Qwack', 'Monochromish'];

    /**
     * Menubar Assets
     * @private
     */
    private isMac: boolean = process.platform === 'darwin';
    private _menuTemplate: any = [
        {
            label: app.getName(),
            submenu: [
                {
                    label: utils.getLocale('About', 'menubar.options.about'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('about')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Settings', 'menubar.options.settings'),
                    accelerator: utils.getStoreValue("general.keybindings.settings").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('settings')`)
                },
                {type: 'separator'},
                {role: 'services', label: utils.getLocale('services', 'menubar.options.services')},
                {type: 'separator'},
                {role: 'hide', label: utils.getLocale('hide', 'menubar.options.hide')},
                {role: 'hideOthers', label: utils.getLocale('hideOthers', 'menubar.options.hideothers')},
                {role: 'unhide', label: utils.getLocale('unhide', 'menubar.options.unhide')},
                {type: 'separator'},
                {role: 'quit', label: utils.getLocale('quit', 'menubar.options.quit')}
            ]
        },
        {
            label: utils.getLocale('View', 'menubar.options.view'),
            submenu: [
                {role: 'reload', label: utils.getLocale('reload', 'menubar.options.reloads')},
                {role: 'forceReload', label: utils.getLocale('forceReload', 'menubar.options.forcereload')},
                {role: 'toggleDevTools', label: utils.getLocale('toggleDevTools', 'menubar.options.toggledevtools')},
                {type: 'separator'},
                {role: 'resetZoom', label: utils.getLocale('resetZoom', 'menubar.options.resetzoom')},
                {role: 'zoomIn', label: utils.getLocale('zoomIn', 'menubar.options.zoomin')},
                {role: 'zoomOut', label: utils.getLocale('zoomOut', 'menubar.options.zoomout')},
                {type: 'separator'},
                {role: 'togglefullscreen', label: utils.getLocale('togglefullscreen', 'menubar.options.togglefullscreen')},
            ]
        },
        {
            label: utils.getLocale('Window', 'menubar.options.window'),
            submenu: [
                {role: 'minimize', label: utils.getLocale('minimize', 'menubar.options.minimize')},
                {
                    label: utils.getLocale('Show', 'menubar.options.show'),
                    click: () => utils.getWindow().show()
                },
                {role: 'zoom', label: utils.getLocale('zoom', 'menubar.options.zoom')},
                ...(this.isMac ? [
                    {type: 'separator'},
                    {role: 'front', label: utils.getLocale('front', 'menubar.options.front')},
                    {role: 'close', label: utils.getLocale('close', 'menubar.options.close')},
                ] : [
                    {role: 'close', label: utils.getLocale('close', 'menubar.options.close')},
                ]),

                {
                    label: utils.getLocale('Edit', 'menubar.options.edit'),
                    submenu: [
                        {role: 'undo', label: utils.getLocale('undo', 'menubar.options.undo')},
                        {role: 'redo', label: utils.getLocale('redo', 'menubar.options.redo')},
                        {type: 'separator'},
                        {role: 'cut', label: utils.getLocale('cut', 'menubar.options.cut')},
                        {role: 'copy', label: utils.getLocale('copy', 'menubar.options.copy')},
                        {role: 'paste', label: utils.getLocale('paste', 'menubar.options.paste')},
                    ]
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Toggle Private Session', 'menubar.options.toggleprivate'),
                    accelerator: utils.getStoreValue("general.keybindings.togglePrivateSession").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.cfg.general.privateEnabled = !app.cfg.general.privateEnabled`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Web Remote', 'menubar.options.webremote'),
                    accelerator: utils.getStoreValue("general.keybindings.webRemote").join('+'),
                    sublabel: 'Opens in external window',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('remote-pair')`)
                },
                {
                    label: utils.getLocale('Audio Settings', 'menubar.options.audio'),
                    accelerator: utils.getStoreValue("general.keybindings.audioSettings").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.audioSettings = true`)
                },
                {
                    label: utils.getLocale('Plug-in Menu', 'menubar.options.plugins'),
                    accelerator: utils.getStoreValue("general.keybindings.pluginMenu").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.pluginMenu = true`)
                }
            ]
        },
        {
            label: utils.getLocale('Controls', 'menubar.options.controls'),
            submenu: [
                {
                    label:  utils.getLocale('Pause / Play', 'menubar.options.playpause'),
                    accelerator: 'Space',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.SpacePause()`)
                },
                {
                    label: utils.getLocale('Next', 'menubar.options.next'),
                    accelerator: 'CommandOrControl+Right',
                    click: () => utils.getWindow().webContents.executeJavaScript(`MusicKitInterop.next()`)
                },
                {
                    label: utils.getLocale('Previous', 'menubar.options.previous'),
                    accelerator: 'CommandOrControl+Left',
                    click: () => utils.getWindow().webContents.executeJavaScript(`MusicKitInterop.previous()`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Volume Up', 'menubar.options.volumeup'),
                    accelerator: 'CommandOrControl+Up',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.volumeUp()`)
                },
                {
                    label: utils.getLocale('Volume Down', 'menubar.options.volumedown'),
                    accelerator: 'CommandOrControl+Down',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.volumeDown()`)
                },
                {
                    label: utils.getLocale('Browse', 'menubar.options.browse'),
                    accelerator: utils.getStoreValue("general.keybindings.browse").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('browse')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Artists', 'menubar.options.artists'),
                    accelerator: utils.getStoreValue("general.keybindings.artists").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-artists')`)
                },
                {
                    label: utils.getLocale('Search', 'menubar.options.search'),
                    accelerator: utils.getStoreValue("general.keybindings.search").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('search')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Album', 'menubar.options.albums'),
                    accelerator: utils.getStoreValue("general.keybindings.albums").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-albums')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Cast To Devices', 'menubar.options.cast'),
                    accelerator: utils.getStoreValue("general.keybindings.castToDevices").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.castMenu = true`)
                }
            ]
        },
        {
            label: utils.getLocale('Account', 'menubar.options.account'),
            submenu: [
                {
                    label: utils.getLocale('Account Settings', 'menubar.options.accountsettings'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('apple-account-settings')`)
                },
                {
                    label: utils.getLocale('Sign Out', 'menubar.options.signout'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.unauthorize()`)
                }
            ]
        },
        {
            label: utils.getLocale('Support', 'menubar.options.support'),
            role: utils.getLocale('help', 'menubar.options.help'),
            submenu: [
                {
                    label: utils.getLocale('Discord', 'menubar.options.discord'),
                    click: () => shell.openExternal("https://discord.gg/AppleMusic").catch(console.error)
                },
                {
                    label: utils.getLocale('GitHub Wiki', 'menubar.options.github'),
                    click: () => shell.openExternal("https://github.com/ciderapp/Cider/wiki/Troubleshooting").catch(console.error)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Report a...', 'menubar.options.report'),
                    submenu: [
                        {
                            label: utils.getLocale('Bug', 'menubar.options.bug'),
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/issues/new?assignees=&labels=bug%2Ctriage&template=bug_report.yaml&title=%5BBug%5D%3A+").catch(console.error)
                        },
                        {
                            label: utils.getLocale('Feature Request', 'menubar.options.feature'),
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/discussions/new?category=feature-request").catch(console.error)
                        },
                        {
                            label: utils.getLocale('Translation Report/Request', 'menubar.options.trans'),
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/issues/new?assignees=&labels=%F0%9F%8C%90+Translations&template=translation.yaml&title=%5BTranslation%5D%3A+").catch(console.error)
                        },
                    ]
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('View License', 'menubar.options.license'),
                    click: () => shell.openExternal("https://github.com/ciderapp/Cider/blob/main/LICENSE").catch(console.error)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale('Toggle Developer Tools', 'menubar.options.devtools'),
                    accelerator: utils.getStoreValue("general.keybindings.openDeveloperTools").join('+'),
                    click: () => utils.getWindow().webContents.openDevTools()
                },
                {
                    label: utils.getLocale('Open Configuration File in Editor', 'menubar.options.conf'),
                    click: () => utils.getStoreInstance().openInEditor()
                }
            ]
        }
    ];

    /*******************************************************************************************
     * Public Methods
     * ****************************************************************************************/

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(_utils: utils) {
        console.debug(`[Plugin][${this.name}] Loading Complete.`);
    }

    /**
     * Runs on app ready
     */
    onReady(_win: Electron.BrowserWindow): void {
        const menu = Menu.buildFromTemplate(this._menuTemplate);
        Menu.setApplicationMenu(menu)
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        console.debug(`[Plugin][${this.name}] Stopped.`);
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.status = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {

    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {

    }

}
