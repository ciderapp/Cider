import fetch from "electron-fetch";
import {nativeImage, Notification} from "electron";

export default class playbackNotifications {


    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'Playback Notifications';
    public description: string = 'Creates notifications on playback.';
    public version: string = '1.0.0';
    public author: string = 'Core';
    public contributors: string[] = ['Core', 'Monochromish'];

    private _utils: any;
    private _notification: Notification | undefined;

    /**
     * Creates playback notification
     * @param a: Music Attributes
     */
    createNotification(a: any): void {
        if (this._notification) {
            this._notification.close();
        }
        fetch(a.artwork.url.replace('/{w}x{h}bb', '/512x512bb').replace('/2000x2000bb', '/35x35bb')).then(async blob => {
            const artworkImage = nativeImage.createFromBuffer(Buffer.from(await blob.arrayBuffer()));
            this._notification = new Notification({
                title: a.name,
                body: `${a.artistName} — ${a.albumName}`,
                silent: true,
                icon: artworkImage,
                urgency: 'low',
                actions: [
                    {
                        'type': 'button',
                        'text': 'Play/Pause'
                    }
                ],
                toastXml: `<toast>
                        <visual>
                            <binding template="ToastGeneric">
                                <text id="1">${a.name ?? ''}</text>
                                <text id="2">${a.artistName ?? ''} - ${a.albumName ?? ''
                }</text>
                            </binding>
                        </visual>
                        <actions>
                            <action content="Play/Pause" activationType="protocol" arguments="cider://playpause/"/>
                            <action content="Next" activationType="protocol" arguments="cider://nextitem/"/>
                        </actions>
                    </toast>`
            });
            this._notification.on('click', (event: any) => {
                this._utils.getWindow().show()
                this._utils.getWindow().focus()
            })
            this._notification.on('close', (event: any) => {
                this._notification = undefined;
            })
            this._notification.on('action', (event: any, action: any) => {
                if (action === 0) {
                    this._utils.playback.playPause()
                } else if (action === 1) {
                    this._utils.playback.next()
                }
            })

            this._notification.show();

        })
    }

    /*******************************************************************************************
     * Public Methods
     * ****************************************************************************************/

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(utils: any) {
        this._utils = utils;
        console.debug(`[Plugin][${this.name}] Loading Complete.`);

        utils.getIPCMain().on('playbackNotifications:create', (event: any, a: any) => {
            this.createNotification(a);
        })
    }

}
