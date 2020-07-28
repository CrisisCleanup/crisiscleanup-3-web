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

export default class Language extends Model {
  static entity = 'languages';

  static fields() {
    return ({
      id: this.attr(),
      subtag: this.attr(null),
      name_t: this.attr(null),
    }: LanguageType);
  }
}
