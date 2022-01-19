import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron'

export default class PluginHandler {
    private basePluginsPath = path.join(__dirname, '../plugins');
    private userPluginsPath = path.join(electron.app.getPath('userData'), 'plugins');
    private pluginsList: any = {};

    constructor() {

        this.pluginsList = this.getPlugins();
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
                        plugins[file] = new plugin(electron.app);
                    }
                }
            });
        }
        
        
        if (fs.existsSync(this.userPluginsPath)) {
            fs.readdirSync(this.userPluginsPath).forEach(file => {
                if (file.endsWith('.ts') || file.endsWith('.js')) {
                    const plugin = require(path.join(this.userPluginsPath, file)).default;
                    if (plugins[file] || plugin in plugins) {
                        console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
                    } else {
                        plugins[file] = new plugin(electron.app);
                    }
                }
            });
        }
        console.log('loaded plugins:', JSON.stringify(plugins))
        return plugins;
    }

    public callPlugins(event: string, ...args: any[]) {
        for (const plugin in this.pluginsList) {
            if (this.pluginsList[plugin][event]) {
                this.pluginsList[plugin][event](...args);
            }
        }
    }

}
