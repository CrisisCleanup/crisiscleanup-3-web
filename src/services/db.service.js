const { openDB } = require('idb');
const dbPromise = openDB('crisiscleanup', 1, {
  upgrade(db) {
    db.createObjectStore('worksite');
  },
});

const DbService = {
  async setItem(key, val) {
    const idbpDatabase = await dbPromise;
    return idbpDatabase.put('worksite', val, key);
  },
  async getItem(key) {
    const idbpDatabase = await dbPromise;
    const entry = await idbpDatabase.get('worksite', key);
    if (entry) {
      return entry;
    }
    return null;
  },
};

export { DbService };
