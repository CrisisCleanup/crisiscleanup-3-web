// @flow
/**
 * Language Model
 */

import { Model } from '@vuex-orm/core';

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

export default class Language extends Model {
  static entity = 'languages';

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
