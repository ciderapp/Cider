import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron'
import {utils} from './utils';

//
// Hello, this is our loader for the various plugins that the Cider Development Team built for our
// numerous plugins internally and ones made by the community
//
// To learn how to make your own, visit https://github.com/ciderapp/Cider/wiki/Plugins
//
/**
 * @class
 * Plugin Loading
 * @author booploops#7139
 * @see {@link https://github.com/ciderapp/Cider/wiki/Plugins|Documentation}
 */
export class Plugins {
    private basePluginsPath = path.join(__dirname, '../plugins');
    private userPluginsPath = path.join(electron.app.getPath('userData'), 'Plugins');
    private readonly pluginsList: any = {};
    private static PluginMap: any = {};

    constructor() {
        this.pluginsList = this.getPlugins();
    }

    public static getPluginFromMap(plugin: string): any {
        if (Plugins.PluginMap[plugin]) {
            return Plugins.PluginMap[plugin];
        } else {
            return plugin;
        }
    }

    public getPlugins(): any {
        let plugins: any = {};
        
        
        if (fs.existsSync(this.basePluginsPath)) {
            fs.readdirSync(this.basePluginsPath).forEach(file => {
                if (file.endsWith('.ts') || file.endsWith('.js')) {
                    const plugin = require(path.join(this.basePluginsPath, file)).default;
                    if (plugins[file] || plugin.name in plugins) {
                        console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
                    } else {
                        plugins[file] = new plugin(utils);
                    }
                }
            });
        }
        
        
        if (fs.existsSync(this.userPluginsPath)) {
            fs.readdirSync(this.userPluginsPath).forEach(file => {
                // Plugins V1
                if (file.endsWith('.ts') || file.endsWith('.js')) {
                    if (!electron.app.isPackaged) {
                        const plugin = require(path.join(this.userPluginsPath, file)).default;
                        file = file.replace('.ts', '').replace('.js', '');
                        if (plugins[file] || plugin in plugins) {
                            console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
                        } else {
                            plugins[file] = new plugin(utils);
                        }
                    } else {
                        const plugin = require(path.join(this.userPluginsPath, file));
                        file = file.replace('.ts', '').replace('.js', '');
                        if (plugins[file] || plugin in plugins) {
                            console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
                        } else {
                            plugins[file] = new plugin(utils);
                        }
                    }
                }
                // Plugins V2
                else if (fs.lstatSync(path.join(this.userPluginsPath, file)).isDirectory()) {
                    const pluginPath = path.join(this.userPluginsPath, file);
                    if (fs.existsSync(path.join(pluginPath, 'package.json'))) {
                        const pluginPackage = require(path.join(pluginPath, "package.json"));
                        const plugin = require(path.join(pluginPath, pluginPackage.main));
                        if (plugins[plugin.name] || plugin.name in plugins) {
                            console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
                        } else {
                            Plugins.PluginMap[pluginPackage.name] = file;
                            const pluginEnv = {
                                app: electron.app,
                                store: utils.getStore(),
                                utils: utils,
                                win: utils.getWindow(),
                                dir: pluginPath,
                                dirName: file
                            }
                            plugins[plugin.name] = new plugin(pluginEnv);
                        }
                    }
                }
            });
        }
        console.log('[PluginHandler] Loaded plugins:', Object.keys(plugins));
        return plugins;
    }

    public callPlugins(event: string, ...args: any[]) {
        for (const plugin in this.pluginsList) {
            if (this.pluginsList[plugin][event]) {
                try{
                    this.pluginsList[plugin][event](...args);
                }catch(e) {
                    console.error(`[${plugin}] An error was encountered: ${e}`);
                    console.error(e)
                }
            }
        }
    }

    public callPlugin(plugin: string, event: string, ...args: any[]) {
        if (this.pluginsList[plugin][event]) {
            this.pluginsList[plugin][event](...args);
        }
    }

}
