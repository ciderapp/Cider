import {app, Menu, shell} from "electron";
import {utils} from "../base/utils";

export default class Thumbar {


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
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.about'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('about')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.settings'),
                    accelerator: utils.getStoreValue("general.keybindings.settings").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('settings')`)
                },
                {type: 'separator'},
                {role: 'services', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.services')},
                {type: 'separator'},
                {role: 'hide', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.hide')},
                {role: 'hideOthers', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.hideothers')},
                {role: 'unhide', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.unhide')},
                {type: 'separator'},
                {role: 'quit', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.quit')}
            ]
        },
        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.view'),
            submenu: [
                {role: 'reload', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.reloads')},
                {role: 'forceReload', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.forcereload')},
                {role: 'toggleDevTools', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.toggledevtools')},
                {type: 'separator'},
                {role: 'resetZoom', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.resetzoom')},
                {role: 'zoomIn', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.zoomin')},
                {role: 'zoomOut', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.zoomout')},
                {type: 'separator'},
                {role: 'togglefullscreen', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.togglefullscreen')},
            ]
        },
        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.window'),
            submenu: [
                {role: 'minimize', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.minimize')},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.show'),
                    click: () => utils.getWindow().show()
                },
                {role: 'zoom', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.zoom')},
                ...(this.isMac ? [
                    {type: 'separator'},
                    {role: 'front', label: utils.getLocale('front', 'menubar.options.front')},
                    {role: 'close', label: utils.getLocale('close', 'menubar.options.close')},
                ] : [
                    {role: 'close', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.close')},
                ]),

                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.edit'),
                    submenu: [
                        {role: 'undo', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.undo')},
                        {role: 'redo', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.redo')},
                        {type: 'separator'},
                        {role: 'cut', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.cut')},
                        {role: 'copy', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.copy')},
                        {role: 'paste', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.paste')},
                    ]
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.toggleprivate'),
                    accelerator: utils.getStoreValue("general.keybindings.togglePrivateSession").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.cfg.general.privateEnabled = !app.cfg.general.privateEnabled`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.webremote'),
                    accelerator: utils.getStoreValue("general.keybindings.webRemote").join('+'),
                    sublabel: 'Opens in external window',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('remote-pair')`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.audio'),
                    accelerator: utils.getStoreValue("general.keybindings.audioSettings").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.audioSettings = true`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.plugins'),
                    accelerator: utils.getStoreValue("general.keybindings.pluginMenu").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.pluginMenu = true`)
                }
            ]
        },
        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.controls'),
            submenu: [
                {
                    label:  utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.playpause'),
                    accelerator: 'Space',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.SpacePause()`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.next'),
                    accelerator: 'CommandOrControl+Right',
                    click: () => utils.getWindow().webContents.executeJavaScript(`MusicKitInterop.next()`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.previous'),
                    accelerator: 'CommandOrControl+Left',
                    click: () => utils.getWindow().webContents.executeJavaScript(`MusicKitInterop.previous()`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.volumeup'),
                    accelerator: 'CommandOrControl+Up',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.volumeUp()`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.volumedown'),
                    accelerator: 'CommandOrControl+Down',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.volumeDown()`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.browse'),
                    accelerator: utils.getStoreValue("general.keybindings.browse").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('browse')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.artists'),
                    accelerator: utils.getStoreValue("general.keybindings.artists").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-artists')`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.search'),
                    accelerator: utils.getStoreValue("general.keybindings.search").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('search')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.albums'),
                    accelerator: utils.getStoreValue("general.keybindings.albums").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-albums')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.cast'),
                    accelerator: utils.getStoreValue("general.keybindings.castToDevices").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.castMenu = true`)
                }
            ]
        },
        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.account'),
            submenu: [
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.accountsettings'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('apple-account-settings')`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.signout'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.unauthorize()`)
                }
            ]
        },
        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.support'),
            role: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.help'),
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
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.report'),
                    submenu: [
                        {
                            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.bug'),
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/issues/new?assignees=&labels=bug%2Ctriage&template=bug_report.yaml&title=%5BBug%5D%3A+").catch(console.error)
                        },
                        {
                            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.feature'),
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/discussions/new?category=feature-request").catch(console.error)
                        },
                        {
                            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.trans'),
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/issues/new?assignees=&labels=%F0%9F%8C%90+Translations&template=translation.yaml&title=%5BTranslation%5D%3A+").catch(console.error)
                        },
                    ]
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.license'),
                    click: () => shell.openExternal("https://github.com/ciderapp/Cider/blob/main/LICENSE").catch(console.error)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.toggledevtools'),
                    accelerator: utils.getStoreValue("general.keybindings.openDeveloperTools").join('+'),
                    click: () => utils.getWindow().webContents.openDevTools()
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.conf'),
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
