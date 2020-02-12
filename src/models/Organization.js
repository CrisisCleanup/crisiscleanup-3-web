import { Model } from '@vuex-orm/core';

export default class Organization extends Model {
  static entity = 'organizations';

  static fields() {
    return {
      id: this.increment(),
      name: this.string(''),
      url: this.string(''),
      facebook: this.string(''),
      twitter: this.string(''),
      affiliates: this.attr([]),
      primary_location: this.attr(null),
      secondary_location: this.attr(null),
      type_t: this.attr(null),
      user_count: this.attr(null),
    };
  }
}
