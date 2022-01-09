import * as electron from 'electron';
import * as path from 'path';

export class AppEvents {
    constructor(store: any) {
        console.log('App started');

        AppEvents.start(store);
    }

    /**
     * Handles all actions that occur for the app on start (Mainly commandline arguments)
     * @returns {void}
     */
    private static start(store: any): void {
        console.log('App started');

        /**********************************************************************************************************************
         * Startup arguments handling
         **********************************************************************************************************************/
        if (electron.app.commandLine.hasSwitch('version') || electron.app.commandLine.hasSwitch('v')) {
            console.log(electron.app.getVersion())
            electron.app.exit()
        }

        // Verbose Check
        if (electron.app.commandLine.hasSwitch('verbose')) {
            console.log("[Apple-Music-Electron] User has launched the application with --verbose");
        }

        // Log File Location
        if (electron.app.commandLine.hasSwitch('log') || electron.app.commandLine.hasSwitch('l')) {
            console.log(path.join(electron.app.getPath('userData'), 'logs'))
            electron.app.exit()
        }

        /***********************************************************************************************************************
         * Commandline arguments
         **********************************************************************************************************************/
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

    public quit() {
        console.log('App stopped');
    }

    public ready() {
        console.log('App ready');
    }
}