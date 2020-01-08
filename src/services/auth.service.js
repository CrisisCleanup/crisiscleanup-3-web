import axios from 'axios';
import jwt_decode from 'jwt-decode';
import moment from 'moment';

const AuthService = {
  getUser() {
    return JSON.parse(localStorage.getItem('user'));
  },
  getToken() {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).access_token;
    }
    return null;
  },
  getExpiry() {
    const user = localStorage.getItem('user');
    if (user) {
      const decoded = jwt_decode(JSON.parse(user).access_token);
      return moment.unix(decoded.exp);
    }
    return moment();
  },
  saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common.Authorization = `Bearer ${user.access_token}`;
  },
  removeUser() {
    localStorage.removeItem('user');
    axios.defaults.headers.common.Authorization = null;
  },
};

export { AuthService };
