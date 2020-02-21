import { Model } from '@vuex-orm/core';

export default class Language extends Model {
  static entity = 'languages';

  static fields() {
    return {
      id: this.increment(),
      subtag: this.attr(null),
      name_t: this.attr(null),
    };
  }
}
