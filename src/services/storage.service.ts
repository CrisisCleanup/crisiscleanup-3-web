const StorageService = {
  getItem(key: string) {
    return JSON.parse(localStorage.getItem(key));
  },
  setItem(key:string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  removeItem(key:string) {
    localStorage.removeItem(key);
  },
};

export { StorageService };
