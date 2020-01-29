import { Model } from '@vuex-orm/core';

export default class Location extends Model {
  static entity = 'locations';

  static fields() {
    return {
      id: this.increment(),
      name: this.string(''),
      notes: this.string(''),
      type: this.attr(null),
      geom: this.attr(null),
      poly: this.attr(null),
      attr: this.attr(null),
      point: this.attr(null),
    };
  }

  static apiConfig = {
    actions: {
      fetchById(id) {
        return this.get(`/locations/${id}`);
      },
    },
  };
}
