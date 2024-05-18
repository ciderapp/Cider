import {app} from "electron";
import { existsSync, lstatSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { utils } from "./utils.js";

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
  private static PluginMap: any = {};
  private basePluginsPath = join(dirname(fileURLToPath(import.meta.url)), "../plugins");
  private userPluginsPath = join(app.getPath("userData"), "Plugins");
  private readonly pluginsList: any = {};

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

    if (existsSync(this.basePluginsPath)) {
      readdirSync(this.basePluginsPath).forEach(async (file) => {
        if (file.endsWith(".ts") || file.endsWith(".js")) {
          const plugin = (await import(join(this.basePluginsPath, file))).default;
          if (plugins[file] || plugin.name in plugins) {
            console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
          } else {
            plugins[file] = new plugin(utils);
          }
        }
      });
    }

    if (existsSync(this.userPluginsPath)) {
      readdirSync(this.userPluginsPath).forEach(async (file) => {
        // Plugins V1
        if (file.endsWith(".ts") || file.endsWith(".js")) {
          if (!app.isPackaged) {
            const plugin = (await import(join(this.userPluginsPath, file))).default;
            file = file.replace(".ts", "").replace(".js", "");
            if (plugins[file] || plugin in plugins) {
              console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
            } else {
              plugins[file] = new plugin(utils);
            }
          } else {
            const plugin = await import(join(this.userPluginsPath, file));
            file = file.replace(".ts", "").replace(".js", "");
            if (plugins[file] || plugin in plugins) {
              console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
            } else {
              plugins[file] = new plugin(utils);
            }
          }
        }
        // Plugins V2
        else if (lstatSync(join(this.userPluginsPath, file)).isDirectory()) {
          const pluginPath = join(this.userPluginsPath, file);
          if (existsSync(join(pluginPath, "package.json"))) {
            const pluginPackage = await import(join(pluginPath, "package.json"));
            const plugin = await import(join(pluginPath, pluginPackage.main));
            if (plugins[plugin.name] || plugin.name in plugins) {
              console.log(`[${plugin.name}] Plugin already loaded / Duplicate Class Name`);
            } else {
              Plugins.PluginMap[pluginPackage.name] = file;
              const pluginEnv = {
                app: app,
                store: utils.getStore(),
                utils: utils,
                win: utils.getWindow(),
                dir: pluginPath,
                dirName: file,
                express: utils.getExpress(),
              };
              plugins[plugin.name] = new plugin(pluginEnv);
            }
          }
        }
      });
    }
    console.log("[PluginHandler] Loaded plugins:", Object.keys(plugins));
    return plugins;
  }

  public callPlugins(event: string, ...args: any[]) {
    for (const plugin in this.pluginsList) {
      if (this.pluginsList[plugin][event]) {
        try {
          this.pluginsList[plugin][event](...args);
        } catch (e) {
          console.error(`[${plugin}] An error was encountered: ${e}`);
          console.error(e);
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
