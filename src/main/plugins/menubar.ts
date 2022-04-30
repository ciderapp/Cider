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
                    label: 'About',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('about')`)
                },
                {type: 'separator'},
                {
                    label: 'Settings',
                    accelerator: utils.getStoreValue("general.keybindings.settings").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('settings')`)
                },
                {type: 'separator'},
                {role: 'services'},
                {type: 'separator'},
                {role: 'hide'},
                {role: 'hideOthers'},
                {role: 'unhide'},
                {type: 'separator'},
                {role: 'quit'}
            ]
        },
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forceReload'},
                {role: 'toggleDevTools'},
                {type: 'separator'},
                {role: 'resetZoom'},
                {role: 'zoomIn'},
                {role: 'zoomOut'},
                {type: 'separator'},
                {role: 'togglefullscreen'},
            ]
        },
        {
            label: 'Window',
            submenu: [
                {role: 'minimize'},
                {
                    label: 'Show',
                    click: () => utils.getWindow().show()
                },
                {role: 'zoom'},
                ...(this.isMac ? [
                    {type: 'separator'},
                    {role: 'front'},
                    {role: 'close'},
                ] : [
                    {role: 'close'},
                ]),

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
                {
                    label: 'Toggle Private Session',
                    accelerator: utils.getStoreValue("general.keybindings.togglePrivateSession").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.cfg.general.privateEnabled = !app.cfg.general.privateEnabled`)
                },
                {type: 'separator'},
                {
                    label: 'Web Remote',
                    accelerator: utils.getStoreValue("general.keybindings.webRemote").join('+'),
                    sublabel: 'Opens in external window',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('remote-pair')`)
                },
                {
                    label: 'Audio Settings',
                    accelerator: utils.getStoreValue("general.keybindings.audioSettings").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.audioSettings = true`)
                },
                {
                    label: 'Plug-in Menu',
                    accelerator: utils.getStoreValue("general.keybindings.pluginMenu").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.pluginMenu = true`)
                }
            ]
        },
        {
            label: 'Controls',
            submenu: [
                {
                    label: 'Pause / Play',
                    accelerator: 'Space',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.SpacePause()`)
                },
                {
                    label: 'Next',
                    accelerator: 'CommandOrControl+Right',
                    click: () => utils.getWindow().webContents.executeJavaScript(`MusicKitInterop.next()`)
                },
                {
                    label: 'Previous',
                    accelerator: 'CommandOrControl+Left',
                    click: () => utils.getWindow().webContents.executeJavaScript(`MusicKitInterop.previous()`)
                },
                {type: 'separator'},
                {
                    label: 'Volume Up',
                    accelerator: 'CommandOrControl+Up',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.volumeUp()`)
                },
                {
                    label: 'Volume Down',
                    accelerator: 'CommandOrControl+Down',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.volumeDown()`)
                },
                {
                    label: 'Browse',
                    accelerator: utils.getStoreValue("general.keybindings.browse").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('browse')`)
                },
                {type: 'separator'},
                {
                    label: 'Artists',
                    accelerator: utils.getStoreValue("general.keybindings.artists").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-artists')`)
                },
                {
                    label: 'Search',
                    accelerator: utils.getStoreValue("general.keybindings.search").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('search')`)
                },
                {type: 'separator'},
                {
                    label: 'Album',
                    accelerator: utils.getStoreValue("general.keybindings.albums").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('library-albums')`)
                },
                {type: 'separator'},
                {
                    label: 'Cast To Devices',
                    accelerator: utils.getStoreValue("general.keybindings.castToDevices").join('+'),
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.modals.castMenu = true`)
                }
            ]
        },
        {
            label: 'Account',
            submenu: [
                {
                    label: 'Account Settings',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.appRoute('apple-account-settings')`)
                },
                {
                    label: 'Sign Out',
                    click: () => utils.getWindow().webContents.executeJavaScript(`app.unauthorize()`)
                }
            ]
        },
        {
            label: 'Support',
            role: 'help',
            submenu: [
                {
                    label: 'Discord',
                    click: () => shell.openExternal("https://discord.gg/AppleMusic").catch(console.error)
                },
                {
                    label: 'GitHub Wiki',
                    click: () => shell.openExternal("https://github.com/ciderapp/Cider/wiki/Troubleshooting").catch(console.error)
                },
                {type: 'separator'},
                {
                    label: 'Report a...',
                    submenu: [
                        {
                            label: 'Bug',
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/issues/new?assignees=&labels=bug%2Ctriage&template=bug_report.yaml&title=%5BBug%5D%3A+").catch(console.error)
                        },
                        {
                            label: 'Feature Request',
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/discussions/new?category=feature-request").catch(console.error)
                        },
                        {
                            label: 'Translation Report/Request',
                            click: () => shell.openExternal("https://github.com/ciderapp/Cider/issues/new?assignees=&labels=%F0%9F%8C%90+Translations&template=translation.yaml&title=%5BTranslation%5D%3A+").catch(console.error)
                        },
                    ]
                },
                {type: 'separator'},
                {
                    label: 'View License',
                    click: () => shell.openExternal("https://github.com/ciderapp/Cider/blob/main/LICENSE").catch(console.error)
                },
                {type: 'separator'},
                {
                    label: 'Toggle Developer Tools',
                    accelerator: utils.getStoreValue("general.keybindings.openDeveloperTools").join('+'),
                    click: () => utils.getWindow().webContents.openDevTools()
                },
                {
                    label: 'Open Configuration File in Editor',
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
