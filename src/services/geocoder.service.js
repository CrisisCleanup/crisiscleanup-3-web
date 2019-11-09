const GEOCODER_BASE_URL = 'https://api.pitneybowes.com';

export default {
    getOauthToken() {
        const tokenUrl = `${GEOCODER_BASE_URL}/oauth/token`;
        const params = {
            grant_type: 'client_credentials',
        };
        const URLSearchParams = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
        return fetch(tokenUrl, {
            method: 'POST',
            body: URLSearchParams,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${process.env.VUE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN}`,
            },
        }).then(resp => resp.json()).then(data => data.access_token);
    },
    async getMatchingAddresses(text, country) {
        const geoCoderUrl = new URL(`${GEOCODER_BASE_URL}/location-intelligence/geocode-service/v1/transient/premium/geocode`);
        const params = {
            mainAddress: text,
            country,
            maxCands: 5,
        };
        Object.keys(params).forEach(key => geoCoderUrl.searchParams.append(key, params[key]));

        const oauthToken = await this.getOauthToken();

        return fetch(geoCoderUrl, {
            method: 'get',
            mode: 'cors',
            headers: {
                'Content-type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${oauthToken}`,
            },
        }).then(resp => resp.json()).then(data => data.candidates);
    },
};