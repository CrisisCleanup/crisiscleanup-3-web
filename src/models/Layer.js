import { Model } from '@vuex-orm/core';

export default class Layer extends Model {
  static entity = 'layers';

  static fields() {
    return {
      id: this.increment(),
      title: this.string(''),
      descripton: this.string(''),
      locations: this.attr(null),
      available_to: this.attr(null),
    };
  }

  static apiConfig = {
    actions: {
      fetchById(id) {
        return this.get(`/layers/${id}`);
      },
    },
  };
}
