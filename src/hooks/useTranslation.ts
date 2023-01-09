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

  return {
    translate,
  };
}
