// import { ProviderDB } from "./db";
import * as path from 'path';
const { readdir } = require('fs').promises;
import { utils } from '../../base/utils';
import * as mm from 'music-metadata';

export class LocalFiles {
    static localSongs: any = [];
    static localSongsArts: any = [];
    // public static DB = ProviderDB.db;


    static async scanLibrary() {
        let folders = utils.getStoreValue("libraryPrefs.localPaths")
        if (folders == null || folders.length == null || folders.length == 0) folders = ["D:\\Music"]
        console.log('folders', folders)
        let files: any[] = []
        for (var folder of folders) {
            // get files from the Music folder
            files = files.concat(await LocalFiles.getFiles(folder))
        }

        //console.log("cider.files", files2);
        let supporttedformats = ["mp3", "aac", "webm", "flac", "m4a", "ogg", "wav", "opus"]
        let audiofiles = files.filter(f => supporttedformats.includes(f.substring(f.lastIndexOf('.') + 1)));
        // console.log("cider.files2", audiofiles, audiofiles.length);
        let metadatalist = []
        let metadatalistart = []
        let numid = 0;
        for (var audio of audiofiles) {
            try {
                const metadata = await mm.parseFile(audio);
                if (metadata != null) {
                    let form = {
                        "id": "ciderlocal" + numid,
                        "type": "podcast-episodes",
                        "href": audio,
                        "attributes": {
                            "artwork": {
                                "width": 3000,
                                "height": 3000,
                                "url": "/ciderlocalart/" + "ciderlocal" + numid,
                            },
                            "topics": [],
                            "url": "",
                            "subscribable": true,
                            "mediaKind": "audio",
                            "genreNames": [
                                ""
                            ],
                            // "playParams": { 
                            //     "id": "ciderlocal" + numid, 
                            //     "kind": "podcast", 
                            //     "isLibrary": true, 
                            //     "reporting": false },
                            "trackNumber": metadata.common.track?.no ?? 0,
                            "discNumber": metadata.common.disk?.no ?? 0,
                            "name": metadata.common.title ?? audio.substring(audio.lastIndexOf('\\') + 1),
                            "albumName": metadata.common.album,
                            "artistName": metadata.common.artist,
                            "copyright": metadata.common.copyright ?? "",
                            "assetUrl": "file:///" + audio,
                            "contentAdvisory": "",
                            "releaseDateTime": `${metadata?.common?.year ?? '2022'}-05-13T00:23:00Z`,
                            "durationInMillis": Math.floor((metadata.format.duration ?? 0) * 1000),

                            "offers": [
                                {
                                    "kind": "get",
                                    "type": "STDQ"
                                }
                            ],
                            "contentRating": "clean"
                        }
                    };
                    metadatalistart.push({
                        id: "ciderlocal" + numid,
                        url: metadata.common.picture != undefined ? metadata.common.picture[0].data.toString('base64') : "",
                    })
                    numid += 1;
                    metadatalist.push(form)
                }
            } catch (e) { }
        }
        // console.log('metadatalist', metadatalist);
        this.localSongs = metadatalist;
        this.localSongsArts = metadatalistart;
        return metadatalist;
    }
    static async getFiles(dir: any) {
        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent: any) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
    }

    static setupHandlers () {
        const app = utils.getExpress()
        console.log("Setting up handlers for local files")        
        app.get("/ciderlocal/:songs", (req: any, res: any) => {
            const audio = atob(req.params.songs.replace(/_/g, '/').replace(/-/g, '+'));
            //console.log('auss', audio)
            let data = {
                data:
                    LocalFiles.localSongs.filter((f: any) => audio.split(',').includes(f.id))
            };
            res.send(data);
        });

        app.get("/ciderlocalart/:songs", (req: any, res: any) => {
            const audio = req.params.songs;
            // metadata.common.picture[0].data.toString('base64')

            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Expires', new Date(Date.now() + 31536000).toUTCString());
            res.setHeader('Content-Type', 'image/jpeg');

            let data =
                LocalFiles.localSongsArts.filter((f: any) => f.id == audio);
            res.status(200).send(Buffer.from(data[0]?.url, 'base64'));
        });

        return app
    }
}