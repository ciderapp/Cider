import { ProviderDB } from "./db";
import * as path from 'path';
const { readdir } = require('fs').promises;
import { utils } from '../../base/utils';
import * as mm from 'music-metadata';
import {Md5} from 'ts-md5/dist/md5';
import e from "express";
import { EventEmitter } from 'events';
import { parseFile, recursiveFolderSearch } from 'cider_utils';

export class LocalFiles {
    static localSongs: any = [];
    static localSongsArts: any = [];
    public static DB = ProviderDB.db;
    static eventEmitter = new EventEmitter();

    static getDataType(item_id : String | any){
        if ((item_id ?? ('')).startsWith('ciderlocalart'))
            return 'artwork'
        else if ((item_id ?? ('')).startsWith('ciderlocal'))
        return 'track'   
    }

    static async sendOldLibrary() {
        ProviderDB.init()
        let rows = (await ProviderDB.db.allDocs({include_docs: true,
            attachments: true})).rows.map((item: any)=>{return item.doc})
        let tracks = rows.filter((item: any) => {return this.getDataType(item._id) == "track"})
        let arts = rows.filter((item: any) => {return this.getDataType(item._id) == "artwork"})
        this.localSongs = tracks; 
        this.localSongsArts = arts; 
        return tracks;
    }
    
    static async scanLibrary() {
        ProviderDB.init()
        let folders = utils.getStoreValue("libraryPrefs.localPaths")
        if (folders == null || folders.length == null || folders.length == 0) folders = []
        console.log('folders', folders)
        let parseFileQueue: any[] = []; let mmQueue: any[] = []
        for (var folder of folders) {
            // Recursively search and add 
            let result = await recursiveFolderSearch(folder)
            parseFileQueue = parseFileQueue.concat(result.parseFile)
            mmQueue = mmQueue.concat(result.musicMetadata)
        }
        if (parseFileQueue.length !== 0 || mmQueue.length !== 0) {console.log('Recursive Folder Search in Cider Utils worki')}
        let metadatalist = []
        let metadatalistart = []
        let numid = 0;

        // Music Metadata fallback
        for (var audio of mmQueue) {
            try {
                const metadata = await mm.parseFile(audio);
                let lochash = Md5.hashStr(audio) ?? numid;
                if (metadata != null) {
                    let form = {
                        "id": "ciderlocal" + lochash,
                        "_id": "ciderlocal" + lochash,
                        "type": "podcast-episodes",
                        "href": audio,
                        "attributes": {
                            "artwork": {
                                "width": 3000,
                                "height": 3000,
                                "url": "/ciderlocalart/" + "ciderlocal" + lochash,
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
                            "bitrate": Math.floor((metadata.format?.bitrate ?? 0) / 1000),
                            "offers": [
                                {
                                    "kind": "get",
                                    "type": "STDQ"
                                }
                            ],
                            "contentRating": "clean"
                        },
                        flavor: Math.floor((metadata.format?.bitrate ?? 0) / 1000),
                        localFilesMetadata: {
                            lossless: metadata.format?.lossless,
                            container: metadata.format?.container,
                            bitDepth: metadata.format?.bitsPerSample ?? 0,
                            sampleRate: metadata.format?.sampleRate ?? 0,    
                        },                    
                    };
                    let art = {
                        id: "ciderlocal" + lochash,
                        _id: "ciderlocalart" + lochash,
                        url: metadata.common.picture != undefined ? metadata.common.picture[0].data.toString('base64') : "",
                    }
                    metadatalistart.push(art)
                    numid += 1;
                    ProviderDB.db.putIfNotExists(form)
                    ProviderDB.db.putIfNotExists(art)
                    metadatalist.push(form)

                    if (this.localSongs.length === 0 && numid  % 10 === 0) { // send updated chunks only if there is no previous database
                        this.eventEmitter.emit('newtracks', metadatalist)}
                    }
            } catch (e) {console.error("error:", e)}
        }

        // Cider-Utils supported formats.
        for (var audio of parseFileQueue) {
            try {
                const metadata = await parseFile(audio);
                let lochash = Md5.hashStr(audio) ?? numid;
                if (metadata != null) {
                    let form = {
                        "id": "ciderlocal" + lochash,
                        "_id": "ciderlocal" + lochash,
                        "type": "podcast-episodes",
                        "href": audio,
                        "attributes": {
                            "artwork": {
                                "width": 3000,
                                "height": 3000,
                                "url": "/ciderlocalart/" + "ciderlocal" + lochash,
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
                            "trackNumber": metadata.track_number ?? 0,
                            "discNumber": metadata.disc_number ?? 0,
                            "name": metadata.title == 0 ? audio.substring(audio.lastIndexOf('\\') + 1) : metadata.title,
                            "albumName": metadata.album,
                            "artistName": metadata.artist,
                            "copyright": metadata.copyright ?? "",
                            "assetUrl": "file:///" + audio,
                            "contentAdvisory": "",
                            "releaseDateTime": `${metadata.year ?? '2022'}-05-13T00:23:00Z`,
                            "durationInMillis": metadata.duration_in_ms ?? 0,       
                            "bitrate": metadata.bitrate ?? 0,
                            "offers": [
                                {
                                    "kind": "get",
                                    "type": "STDQ"
                                }
                            ],
                            "contentRating": "clean"
                        },
                        flavor: metadata.bitrate,
                        localFilesMetadata: {
                            lossless: metadata.lossless,
                            container: metadata.container,
                            bitDepth: metadata.bit_depth,
                            sampleRate: metadata.sample_rate ?? 0,         
                        },                    
                    };
                    let art = {
                        id: "ciderlocal" + lochash,
                        _id: "ciderlocalart" + lochash,
                        url: metadata.artwork != undefined ? metadata.artwork : "",
                    }
                    metadatalistart.push(art)
                    numid += 1;
                    ProviderDB.db.putIfNotExists(form)
                    ProviderDB.db.putIfNotExists(art)
                    metadatalist.push(form)

                    if (this.localSongs.length === 0 && numid  % 10 === 0) { // send updated chunks only if there is no previous database
                        this.eventEmitter.emit('newtracks', metadatalist)}
                    }
            } catch (e) {console.error("error:", e)}
        }
        this.localSongs = metadatalist;
        this.localSongsArts = metadatalistart;
        return metadatalist;
    }

    static async cleanUpDB(){
        let folders = utils.getStoreValue("libraryPrefs.localPaths")
        let rows = (await ProviderDB.db.allDocs({include_docs: true,
            attachments: true})).rows.map((item: any)=>{return item.doc})
        let tracks = rows.filter((item: any) => {return this.getDataType(item._id) == "track" && !folders.some((i: String) => {return item["attributes"]["assetUrl"].startsWith("file:///" + i)})})
        let hashs = tracks.map((i: any) => {return i._id})
        for (let hash of hashs){
            try{
            ProviderDB.db.get(hash).then(function (doc: any) {
                return ProviderDB.db.remove(doc);
            });} catch(e){}
            try{
            ProviderDB.db.get(hash.replace('ciderlocal','ciderlocalart')).then(function (doc: any) {
                return ProviderDB.db.remove(doc);
            });} catch(e){}
        }
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
            res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
            res.setHeader('Content-Type', 'image/jpeg');

            let data =
                LocalFiles.localSongsArts.filter((f: any) => f.id == audio);
            res.status(200).send(Buffer.from(data[0]?.url, 'base64'));
        });

        return app
    }
}