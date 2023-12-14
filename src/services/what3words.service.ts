const BASE_URL = 'https://api.what3words.com/v3';

const What3wordsService = {
  async getWords(lat: string, lng: string) {
    const url = new URL(`${BASE_URL}/convert-to-3wa`);
    const parameters = {
      coordinates: `${lat},${lng}`,
      key: import.meta.env.VITE_APP_WHAT_3_WORDS_API_KEY,
    } as Record<string, any>;
    for (const key of Object.keys(parameters))
      url.searchParams.append(key, parameters[key]);

    return fetch(url, {
      method: 'get',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (resp) => resp.json())
      .then((data) => data.words);
  },
};

export { What3wordsService };
