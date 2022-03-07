const CiderFrontAPI = {
    Objects: {
        MenuEntry: function () {
            this.id = ""
            this.name = ""
            this.onClick = () => {
            }
        }
    },
    AddMenuEntry(entry) {
        app.pluginMenuEntries.push(entry)
        app.pluginInstalled = true
    }
}

export {CiderFrontAPI}