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

    private isNotMac: boolean = process.platform !== 'darwin';
    private isMac: boolean = process.platform === 'darwin';    
    private _menuTemplate: any = [
        {
            label: app.getName(),
            submenu: [
                {
                    label: `${utils.getLocale(utils.getStoreValue('general.language'), 'term.about')} ${app.getName()}`,
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('about')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.toggleprivate'),
                    accelerator: utils.getStoreValue("general.keybindings.togglePrivateSession").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.cfg.general.privateEnabled = !app.cfg.general.privateEnabled`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.settings'),
                    accelerator: utils.getStoreValue("general.keybindings.settings").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.openSettingsPage()`)
                },
                ...(this.isMac ? [
                    {type: 'separator'},
                    {role: 'services'},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideOthers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ] : []),
                ...(this.isNotMac ? [
                    {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.quit'),
                    accelerator: 'Control+Q',
                    click: () => app.quit()
                     
                }
                ] : [])
            ]
        },
        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.view'),
            submenu: [
                ...(this.isMac ? [
                {role: 'reload'},
                {role: 'forceReload'},
                {role: 'toggleDevTools'},
                {type: 'separator'},
                {role: 'resetZoom'},
                {role: 'zoomIn'},
                {role: 'zoomOut'},
                {type: 'separator'},
                {role: 'togglefullscreen'},
                {type: 'separator'},
                ] : []),
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.search'), 
                    accelerator: utils.getStoreValue("general.keybindings.search").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript('app.focusSearch()')
                },
                {type:'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.listenNow'),
                    accelerator: utils.getStoreValue('general.keybindings.listnow').join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('listen_now')`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.browse'),
                    accelerator: utils.getStoreValue("general.keybindings.browse").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('browse')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.recentlyAdded')
                    ,accelerator: utils.getStoreValue("general.keybindings.recentAdd").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-recentlyadded')`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.songs'),
                    accelerator: utils.getStoreValue("general.keybindings.songs").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-songs')`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.albums'),
                    accelerator: utils.getStoreValue("general.keybindings.albums").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-albums')`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.artists'),
                    accelerator: utils.getStoreValue("general.keybindings.artists").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-artists')`)
                },
            ]
        },
        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.window'),
            submenu: [
                {role: 'minimize', label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.minimize')},
                {type: 'separator'},
                ...(this.isMac ? [
                {
                    label: 'Show',
                    click: () => utils.getWindow().show()
                },
                {role: 'zoom'},
                {type: 'separator'},
                {role: 'front'},
                {role: 'close'},
                {
                    label: 'Edit',
                    submenu: [
                        {role: 'undo'},
                        {role: 'redo'},
                        {type: 'separator'},
                        {role: 'cut'},
                        {role: 'copy'},
                        {role: 'paste'},
                    ]
                },
                {type: 'separator'},
            ] : [ ]),
            ...(this.isNotMac ? [

                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.zoom'),
                    submenu: [
                        {
                            label: utils.getLocale(utils.getStoreValue('general.language'), 'term.zoomin'),
                            role: 'zoomIn',
                            accelerator: utils.getStoreValue("general.keybindings.zoomn").join('+')

                        },
                        {
                            label: utils.getLocale(utils.getStoreValue('general.language'), 'term.zoomout'),
                            role: 'zoomOut',
                            accelerator: utils.getStoreValue("general.keybindings.zoomt").join('+')

                        },
                        {
                            label: utils.getLocale(utils.getStoreValue('general.language'), 'term.zoomreset'),
                            role: 'resetZoom',
                            accelerator: utils.getStoreValue("general.keybindings.zoomrst").join('+')                           
                        }
                    ]
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.fullscreen'),
                    accelerator: 'Control+Enter',
                    role: 'togglefullscreen'
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'action.close'),
                    accelerator: 'Control+W',
                    role: 'close'
                },                     
                {type:'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.reload'),
                    accelerator: 'Control+R',
                    role: 'reload'
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.forcereload'),
                    accelerator: 'Control+Shift+R',
                    role: 'forceReload'
                },             
            ] : []),
            ],
        },

        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.controls'),
            submenu: [
                {
                    label:  utils.getLocale(utils.getStoreValue('general.language'), 'term.playpause'),
                    accelerator: 'Space',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.SpacePause()`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.next'),
                    accelerator: 'CommandOrControl+Right',
                    click: () => utils.getWindow().webContents.executeJavaScript(`MusicKitInterop.next()`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.previous'),
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
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.cast2'),
                    accelerator: utils.getStoreValue("general.keybindings.castToDevices").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.castMenu = true`)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.webremote'),
                    accelerator: utils.getStoreValue("general.keybindings.webRemote").join('+'),
                    sublabel: 'Opens in external window',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('remote-pair')`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.audioSettings'),
                    accelerator: utils.getStoreValue("general.keybindings.audioSettings").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.audioSettings = true`)
                },
                {type: 'separator'},
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.plugins'),
                    accelerator: utils.getStoreValue("general.keybindings.pluginMenu").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.pluginMenu = true`)
                }

            ]
        },
        {
            label: utils.getLocale(utils.getStoreValue('general.language'), 'menubar.options.account'),
            submenu: [
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.accountSettings'),
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
            role: 'help',
            submenu: [
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.discord'),
                    click: () => shell.openExternal("https://discord.gg/AppleMusic").catch(console.error)
                },
                {
                    label: utils.getLocale(utils.getStoreValue('general.language'), 'term.github'),
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
