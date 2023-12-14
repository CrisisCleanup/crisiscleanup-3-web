import { openDB } from 'idb';

const dbPromise = openDB('crisiscleanup', 3, {
  upgrade(db, oldVersion) {
    if (oldVersion > 0) {
      db.deleteObjectStore('keyval');
    }

    db.createObjectStore('keyval');
  },
});

const DbService = {
  async setItem(key: string, value: unknown) {
    const idbpDatabase = await dbPromise;
    return idbpDatabase.put('keyval', value, key);
  },
  async getItem(key: string): Promise<unknown> {
    const idbpDatabase = await dbPromise;
    const entry = (await idbpDatabase.get('keyval', key)) as string;
    if (entry) {
      try {
        return JSON.parse(entry) as Record<string, unknown>;
      } catch {
        return entry as unknown;
      }
    }

    return null;
  },
};

export { DbService };
