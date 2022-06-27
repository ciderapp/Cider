import * as PouchDB from 'pouchdb-node';

export class ProviderDB {
    public static db: any = null
    static async init() {
        // ProviderDB.db = new PouchDB('tracks')
    }
}