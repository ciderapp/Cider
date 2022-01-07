import * as electron from 'electron';

export class App {
    constructor() {
        console.log('App started');
    }

    /**
     * Handles all actions that occur for the app on start (Mainly commandline arguments)
     * @returns {void}
     */
    public start(store: any): void {
        console.log('App started');

        switch (store.get("visual.hw_acceleration")) {
            default:
            case "default":
                electron.app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode')
                electron.app.commandLine.appendSwitch('enable-accelerated-video')
                electron.app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds')
                electron.app.commandLine.appendSwitch('ignore-gpu-blacklist')
                electron.app.commandLine.appendSwitch('enable-native-gpu-memory-buffers')
                electron.app.commandLine.appendSwitch('enable-accelerated-video-decode');
                electron.app.commandLine.appendSwitch('enable-gpu-rasterization');
                electron.app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
                electron.app.commandLine.appendSwitch('enable-oop-rasterization');
                break;

            case "webgpu":
                console.info("WebGPU is enabled.");
                electron.app.commandLine.appendSwitch('enable-unsafe-webgpu')
                break;

            case "disabled":
                console.info("Hardware acceleration is disabled.");
                electron.app.commandLine.appendSwitch('disable-gpu')
                break;
        }
    }

    public stop() {
        console.log('App stopped');
    }

    public ready() {
        console.log('App ready');
    }
}