import * as PouchDB from 'pouchdb-node';
import {join} from 'path';
import {app} from "electron";
PouchDB.plugin(require('pouchdb-upsert'));
export class ProviderDB {
    public static db: any = null
    static init() {
        if (ProviderDB.db == null){
            ProviderDB.db = new PouchDB(join(app.getPath('userData'), 'tracksdb'))
        }
    }
}