const BASE_URL = process.env.VUE_APP_API_BASE_URL;

const i18nService = {
  async getLanguage(subtag) {
    const url = new URL(`${BASE_URL}/languages/${subtag}`);

    return fetch(url, {
      method: 'get',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(resp => resp.json())
      .then(data => data);
  },
};

export { i18nService };
