const { openDB } = require('idb');
const dbPromise = openDB('crisiscleanup', 1, {
  upgrade(db) {
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
      return entry;
    }
    return null;
  },
};

export { DbService };
