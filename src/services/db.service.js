const DbService = {
  async init() {
    const { openDB } = require('idb');
    const dbPromise = await openDB('crisiscleanup', 1, {
      upgrade(db) {
        db.createObjectStore('keyval');
      },
    });
    this.db = dbPromise;
  },
  async setItem(key, val) {
    const idbpDatabase = this.db;
    return idbpDatabase.put('keyval', val, key);
  },
  async getItem(key) {
    const idbpDatabase = this.db;
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
