import axios from 'axios';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import _ from 'lodash';

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
  updateUser(userClaims) {
    const user = this.getUser();
    localStorage.setItem(
      'user',
      JSON.stringify({
        ...user,
        user_claims: userClaims,
      }),
    );
    axios.defaults.headers.common.Authorization = `Bearer ${user.access_token}`;
  },
  removeUser() {
    localStorage.removeItem('user');
    axios.defaults.headers.common = _.omit(axios.defaults.headers.common, [
      'Authorization',
    ]);
  },
};

export { AuthService };
