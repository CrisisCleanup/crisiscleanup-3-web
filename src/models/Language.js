// @flow
/**
 * Language Model
 */

import detectBrowserLanguage from 'detect-browser-language';
import CCUModel from '@/models/model';

export type LanguageType = {|
  id: number,
  subtag: string,
  name_t: string,
|};

type LanguageTranslationResponse = {|
  text: string,
  translated_text: string,
  source_subtag: string,
  target_subtag: string,
|};

export default class Language extends CCUModel<Language> {
  static entity = 'languages';

  static state() {
    return ({
      _browserLanguage: detectBrowserLanguage(),
    }: { _browserLanguage: null | string });
  }

  static fields() {
    return ({
      id: this.attr(),
      subtag: this.attr(null),
      name_t: this.attr(null),
    }: LanguageType);
  }

  static fetchById(id: number) {
    return this.api().get(`/languages/${id}`);
  }

  static async fetchOrFindId(id: number) {
    const exists = await this.query().whereId(id).exists();
    if (!exists) {
      await this.fetchById(id);
    }
    return this.find(id);
  }

  static get browserLanguage() {
    return Language.query()
      .where(
        'subtag',
        Language.store().state.entities.languages._browserLanguage,
      )
      .first();
  }

  /**
   * Perform real-time translation of text.
   * Source language will be auto detected.
   * @param id - Locale id.
   * @param text - Text to translate.
   * @returns {Promise<LanguageTranslationResponse>}
   */
  static async translateText(id: number, text: string) {
    const locale = await this.fetchOrFindId(id);
    const {
      response: { data },
    }: {
      response: { data: LanguageTranslationResponse },
    } = await this.api().post(
      `/languages/${locale.subtag}/translate`,
      {
        text,
      },
      { save: false },
    );
    return data;
  }
}
