let i = 1, k = 1;
export default class ExamplePlugin {

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
    constructor() {

    }

    /**
     * Runs on app ready
     */
    onReady(): void {
        console.log('Example plugin ready');
    }

    /**
     * Runs on app stop
     */
    onStop(): void {
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