import { Model } from '@vuex-orm/core';

export default class Organization extends Model {
  static entity = 'organizations';

  static fields() {
    return {
      id: this.increment(),
      name: this.string(''),
      affiliates: this.attr([]),
    };
  }
}
