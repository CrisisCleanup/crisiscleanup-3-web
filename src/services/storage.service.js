const StorageService = {
  getItem(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  setItem(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  removeItem(key) {
    localStorage.removeItem(key);
  },
};

export { StorageService };
