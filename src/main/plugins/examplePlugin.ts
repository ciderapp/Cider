let i = 1, k = 1;
export default class ExamplePlugin {
		/**
		 * Private variables for interaction in plugins
		 */
		private _win: any;
		private _app: any;

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'examplePlugin';
    public description: string = 'Example plugin';
    public version: string = '1.0.0';
    public author: string = 'Example author';

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(app: any) {
				this._app = app;
				console.log('Example plugin loaded');
		}

    /**
     * Runs on app ready
     */
    onReady(win: any): void {
				this._win = win;
        console.log('Example plugin ready');
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        console.log('Example plugin stopped');
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.state = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {
        console.log('onPlaybackStateDidChange has been called ' + i +' times');
        i++
    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {
        console.log('onNowPlayingDidChange has been called ' + k +' times');
        k++
    }

}
