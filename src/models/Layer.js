import { Model } from '@vuex-orm/core';

export default class Layer extends Model {
  static entity = 'layers';

  static fields() {
    return {
      id: this.increment(),
      title: this.string(''),
      type: this.string(''),
      description: this.string(''),
      locations: this.attr([]),
      available_to: this.attr([]),
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
