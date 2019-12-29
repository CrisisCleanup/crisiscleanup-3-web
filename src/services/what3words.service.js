const BASE_URL = 'https://api.what3words.com/v3';

const What3wordsService = {
  getWords(lat, lng) {
    const url = new URL(`${BASE_URL}/convert-to-3wa`);
    const params = {
      coordinates: `${lat},${lng}`,
      key: process.env.VUE_APP_WHAT_3_WORDS_API_KEY,
    };
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key]),
    );

    return fetch(url, {
      method: 'get',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(resp => resp.json())
      .then(data => data.words);
  },
};

export { What3wordsService };
