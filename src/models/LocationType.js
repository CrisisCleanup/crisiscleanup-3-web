import { Model } from '@vuex-orm/core';

export default class LocationType extends Model {
  static entity = 'location_types';

  static fields() {
    return {
      id: this.attr(),
      key: this.attr(null),
      name_t: this.attr(null),
      description_t: this.attr(null),
    };
  }
}
