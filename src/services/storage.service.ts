const StorageService = {
  getItem(key: string) {
    let item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  },
  setItem(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
  },
};

export { StorageService };
