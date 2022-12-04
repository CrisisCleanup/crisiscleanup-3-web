import { openDB } from 'idb';

const dbPromise = openDB('crisiscleanup', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion > 0) {
      db.deleteObjectStore('keyval');
    }
    db.createObjectStore('keyval');
  },
});

const DbService = {
  async setItem(key, val) {
    const idbpDatabase = await dbPromise;
    return idbpDatabase.put('keyval', val, key);
  },
  async getItem(key) {
    const idbpDatabase = await dbPromise;
    const entry = await idbpDatabase.get('keyval', key);
    if (entry) {
      try {
        return JSON.parse(entry);
      } catch (e) {
        return entry;
      }
    }
    return null;
  },
};

export { DbService };
