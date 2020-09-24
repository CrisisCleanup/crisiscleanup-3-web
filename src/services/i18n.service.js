import { StorageService } from '@/services/storage.service';
import moment from 'moment';

const BASE_URL = process.env.VUE_APP_API_BASE_URL;

const i18nService = {
  async getLanguage(subtag) {
    const cachedLocalizations = StorageService.getItem('cachedLocalizations');
    const localizationsUpdated = StorageService.getItem('localizationsUpdated');
    if (cachedLocalizations) {
      const response = await fetch(
        `${BASE_URL}/localizations/count?updated_at__gt=${localizationsUpdated}`,
      );
      const data = await response.json();
      if (data.count === 0) {
        return cachedLocalizations;
      }
    }
    const localizations = await this.getLocalizations(subtag);
    StorageService.setItem('cachedLocalizations', localizations);
    StorageService.setItem('localizationsUpdated', moment().toISOString());
    return localizations;
  },
  async getLocalizations(subtag) {
    const url = new URL(`${BASE_URL}/languages/${subtag}`);

    return fetch(url, {
      method: 'get',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((data) => data);
  },
};

export { i18nService };
