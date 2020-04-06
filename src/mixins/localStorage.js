export default {
  methods: {
    setLocalStorage(key, value) {
      return localStorage.setItem(key, JSON.stringify(value));
    },
    getLocalStorage(key) {
      const value = localStorage.getItem(key);
      return JSON.parse(value);
    },
    existsLocalStorage(key) {
      const value = localStorage.getItem(key);
      if (value) {
        return true;
      }
      return false;
    },
  },
};
