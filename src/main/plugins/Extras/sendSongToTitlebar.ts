import * as electron from "electron";

export default class sendSongToTitlebar {
    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'sendSongToTitlebar';
    public description: string = 'Sets the app\'s titlebar to the Song title';
    public version: string = '0.0.1';
    public author: string = 'Cider Collective (credit to 8times9 via #147)'; 
    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor() {}
    /**
     * Runs on app ready
     */
    onReady(): void {}
    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {}
    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.state = current state)
     */
    onPlaybackStateDidChange(attributes: any): void {
        electron.ipcRenderer.send('set-titlebar', attributes.name)
    }
    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {}
}