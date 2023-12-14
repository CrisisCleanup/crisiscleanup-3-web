import axios from 'axios';

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyD4ob43X7ggoCW7kGYKzLq-vIm_VGAGu74';
export default function useTranslation() {
  const translate = async (q: string, source: string, target: string) => {
    try {
      const instance = axios.create();
      delete instance.defaults.headers.common.Authorization;

      const res = await instance.get(
        'https://translation.googleapis.com/language/translate/v2',
        {
          params: {
            key: GOOGLE_TRANSLATE_API_KEY,
            q,
            source,
            target,
          },
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      return res.data.data.translations[0].translatedText;
    } catch {
      return '';
    }
  };

  const translateWithAWS = async (
    q: string,
    source: string,
    target: string,
  ) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/languages/${target}/translate`,
        {
          text: q,
        },
      );
      return response.data.translated_text;
    } catch {
      return '';
    }
  };

  return {
    translate: translateWithAWS,
  };
}
