import axios from 'axios';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { omit } from 'lodash';

export interface CCUJwtDecoded {
  username: string;
  iat: number;
  exp: number;
  jti: string;
  user_id: number;
  orig_iat: number;
  aud: string;
  iss: string;
}

const AuthService = {
  getUser() {
    const user = localStorage.getItem('user');
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    return JSON.parse(user) as Record<string, any>;
  },
  getToken() {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).access_token as string;
    }

    return null;
  },
  getExpiry() {
    const user = localStorage.getItem('user');
    if (user) {
      const decoded = jwt_decode<CCUJwtDecoded>(JSON.parse(user).access_token);
      return moment.unix(decoded.exp);
    }

    return moment();
  },
  saveUser(user: Record<string, any>) {
    localStorage.setItem('user', JSON.stringify(user));
    const accessToken = user.access_token as string;
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  },
  updateUser(userClaims: Record<string, any>) {
    const user = this.getUser()!;
    localStorage.setItem(
      'user',
      JSON.stringify({
        ...user,
        user_claims: userClaims,
      }),
    );
    const accessToken = user.access_token as string;
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  },
  removeUser() {
    localStorage.removeItem('user');
    axios.defaults.headers.common = omit(axios.defaults.headers.common, [
      'Authorization',
    ]);
  },
};

export { AuthService };
