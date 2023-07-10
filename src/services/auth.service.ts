import axios from 'axios';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { omit } from 'lodash';
import type { LocationQueryValue } from 'vue-router';
import { generateRandomString, pkceChallengeFromVerifier } from '@/utils/oauth';

export const CLIENT_ID = import.meta.env.VITE_APP_CRISISCLEANUP_WEB_CLIENT_ID;
const tokenEndpoint = `${import.meta.env.VITE_APP_API_BASE_URL}/o/token/`;

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

export interface OuathToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

const AuthService = {
  async exchangeAuthorizationCode(authorizationCode: string) {
    const code_verifier = localStorage.getItem('code_verifier');

    // Prepare the request payload
    const payload = {
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: `${window.location.origin}/o/callback`,
      code_verifier: code_verifier,
    } as Record<string, string>;

    // Send the token exchange request
    const response = await axios.post(
      tokenEndpoint,
      new URLSearchParams(payload).toString(),
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': this.getCsrfToken(),
        },
      },
    );

    this.setAccessToken(response.data);
    const user = await axios.get(
      `${import.meta.env.VITE_APP_API_BASE_URL}/users/me`,
      {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      },
    );
    this.saveUser(user.data);
    localStorage.removeItem('code_verifier');
  },
  getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith('csrftoken=')) {
        return cookie.slice('csrftoken='.length);
      }
    }
    return null;
  },
  async refreshAccessToken(): Promise<any> {
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: this.getRefreshToken(),
      client_id: CLIENT_ID,
    } as Record<string, string>;

    try {
      const response = await axios.post(
        tokenEndpoint,
        new URLSearchParams(payload).toString(),
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': this.getCsrfToken(),
          },
        },
      );
      this.setAccessToken(response.data);
      const user = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
          },
        },
      );
      this.saveUser(user.data);
    } catch (error: any) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  },
  async revokeAccessToken(token: string): Promise<any> {
    const payload = {
      token,
      client_id: CLIENT_ID,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/o/revoke_token/`,
        new URLSearchParams(payload).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': this.getCsrfToken(),
          },
        },
      );
      console.log('Token revoked successfully');
    } catch (error: any) {
      throw new Error(`Failed to revoke access token: ${error.message}`);
    }
  },
  setAccessToken(token: OuathToken) {
    localStorage.setItem('oauth_token', JSON.stringify(token));
    localStorage.setItem(
      'oauth_token_expiry',
      moment().add(token.expires_in, 'seconds').toISOString(),
    );
  },
  getAccessToken() {
    const oauthToken = localStorage.getItem('oauth_token');
    if (oauthToken) {
      return JSON.parse(oauthToken).access_token as string;
    }

    return null;
  },
  getRefreshToken() {
    const oauthToken = localStorage.getItem('oauth_token');
    if (oauthToken) {
      return JSON.parse(oauthToken).refresh_token as string;
    }

    return null;
  },
  getAccessTokenExpiry() {
    const expiry = localStorage.getItem('oauth_token_expiry');
    if (expiry) {
      return moment(expiry);
    }

    return moment();
  },
  getUser() {
    const user = localStorage.getItem('oauth_user');
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    return JSON.parse(user) as Record<string, any>;
  },
  getToken() {
    const user = localStorage.getItem('oauth_user');
    if (user) {
      return JSON.parse(user).access_token as string;
    }

    return null;
  },
  getExpiry() {
    const user = localStorage.getItem('oauth_user');
    if (user) {
      const decoded = jwt_decode<CCUJwtDecoded>(JSON.parse(user).access_token);
      // eslint-disable-next-line import/no-named-as-default-member
      return moment.unix(decoded.exp);
    }

    return moment();
  },
  saveUser(user: Record<string, any>) {
    localStorage.setItem('oauth_user', JSON.stringify(user));
    const accessToken = this.getAccessToken();
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  },
  updateUser(user: Record<string, any>) {
    localStorage.setItem('oauth_user', JSON.stringify(user));
    const accessToken = this.getAccessToken();
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  },
  removeUser() {
    localStorage.removeItem('user');
    axios.defaults.headers.common = omit(axios.defaults.headers.common, [
      'Authorization',
    ]);
  },
  async logoutUser() {
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/logout/`,
        null,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': this.getCsrfToken(),
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
        },
      );
    } catch (error) {
      console.error(error);
    }
    if (this.getAccessToken()) {
      await this.revokeAccessToken(this.getAccessToken() as string);
      await this.revokeAccessToken(this.getRefreshToken() as string);
      localStorage.removeItem('oauth_user');
      localStorage.removeItem('oauth_token');
    }
  },
  async buildOauthAuthorizationUrl(from: string | null | LocationQueryValue[]) {
    const code_verifier = generateRandomString();
    localStorage.setItem('code_verifier', code_verifier);
    const code_challenge = await pkceChallengeFromVerifier(code_verifier);

    const url = new URL(
      `${import.meta.env.VITE_APP_API_BASE_URL}/o/authorize/`,
    );

    const params = new URLSearchParams({
      response_type: 'code',
      code_challenge: code_challenge,
      code_challenge_method: 'S256',
      client_id: CLIENT_ID,
      redirect_uri: `${window.location.origin}/o/callback`,
      state: String(from || '/'),
    });

    url.search = params.toString();

    return url.toString();
  },
};

export { AuthService };
