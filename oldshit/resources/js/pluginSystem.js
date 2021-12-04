var _plugins = {
    events: {
        Start: [],
        OnNavigation: [],
        OnPlaybackStateChanged: [],
        OnExit: [],
        OnHide: [],
        OnShow: []
    },
    plugins: [],
    menuitems: [],
    chromeitems: [],
    loadPlugin(plugin = "") {
        if (plugin == "") {
            return
        }
        ipcRenderer.send("load-plugin", plugin)
    },
    execute(type = "Start", args = {}) {
        let self = this
        if (!this.events[type]) {
            console.warn(`[Plugins] Event type: ${type} not found!`)
            return
        } else {
            console.info(`[Plugins] Event type: ${type} called`) //info makes it more distingishable in the console (more Beginner friendly)
        }
        this.events[type].forEach(element => {
            element(args)
        });
    }
};

class AMEPlugin_Menuitem {
    constructor() {
        this.Text = ""
        this.Icon = ""
        this.OnClick = () => {}
    }
    get() {
        JSON.stringify(this)
    }
}

class AMEPluginHelper {
    constructor() {
        /**
         * Adds all events to the _plugins event queue
         */
        _plugins.events.Start.push(this.Start)
        _plugins.events.OnNavigation.push(this.OnNavigation)
        _plugins.events.OnPlaybackStateChanged.push(this.OnPlaybackStateChanged)
        _plugins.events.OnExit.push(this.OnExit)
        _plugins.events.OnHide.push(this.OnHide)
        _plugins.events.OnShow.push(this.OnShow)
        this.name = "Plugin Name"
        this.Start()
        this.Announce()
    }
    /**
     * Announces that the plugin has loaded in console
     */
    Announce() {
        console.info(`[Plugins] Plugin: ${this.name} loaded.`)
    }
    /**
     * Excutes when the web player has fully loaded
     */
    Start() {}
    /**
     * Executes when playback state is changed (WIP)
     */
    OnPlaybackStateChanged() {}
    /**
     * Executes when the user changes pages on the site or opens a context menu 
     * ex: Songs to Playlist screen
     */
    OnNavigation() {}
    /**
     * Executes when the application exits (WIP)
     */
    OnExit() {}
    /**
     * Executes when the application is hidden to the taskbar
     */
    OnHide() {}
    /**
     * Executes when the application is unhidden (WIP)
     */
    OnShow() {}
    /**
     * Adds a menu item to the profile menu (WIP)
     */
    AddMenuItem({
        Text = "",
        Icon = "",
        OnClick = () => {}
    }) {
        var menuitem = new AMEPlugin_Menuitem()
        menuitem.Text = Text
        menuitem.Icon = Icon
        menuitem.OnClick = OnClick
        _plugins.menuitems.push(menuitem)
    }
    /**
     * Adds a button to the web chrome after the volume meter (WIP)
     */
    AddChromeButton({
        text = "",
        style = {},
        onclick = () => {}
    }) {
        var btn = document.createElement("button")
        btn.classList.add("button-reset")
        var btnStyle = {
            width: 38
        }
    }
}