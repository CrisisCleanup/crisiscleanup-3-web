// @flow
/**
 * Language Model
 */

import detectBrowserLanguage from 'detect-browser-language';
import CCUModel from '@/models/model';
import _ from 'lodash';

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

  static get browserLanguage() {
    return Language.query()
      .where(
        'subtag',
        Language.store().state.entities.languages._browserLanguage,
      )
      .first();
  }

  static async fetchBySubtags(subtags: string | string[]) {
    const _subtags = _.castArray(subtags);
    const resolved = await _subtags.filter((s) =>
      this.query().where('subtag', s).exists(),
    );
    const unresolved = _.difference(_subtags, resolved);
    if (!_.isEmpty(unresolved)) {
      await this.api().get('/languages', {
        params: {
          subtag: unresolved.join(','),
        },
        dataKey: 'results',
      });
    }
    return subtags.map((s) => this.query().where('subtag', s).first());
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

  get shortName() {
    return this.name_t.split(' ')[0];
  }
}
