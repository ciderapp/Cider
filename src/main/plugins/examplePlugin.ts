export default class ExamplePlugin {

    public name: string = 'examplePlugin';
    public description: string = 'Example plugin';
    public version: string = '1.0.0';
    public author: string = 'Example author';
    
    constructor() {
        this.name = 'coolPlugin';
        this.description = 'A pretty cool plugin';
        this.version = '1.0.0';
        this.author = 'Core';
    }

    onStart(): void {
        console.log('Example plugin started');
    }
    
    onReady(): void {
        console.log('Example plugin ready');
    }

    onStop(): void {
        console.log('Example plugin stopped');
    }

    OnPlaybackStateChanged(attributes: object): void {
    }

    OnMediaStateChanged(attributes: object): void {
    }

}