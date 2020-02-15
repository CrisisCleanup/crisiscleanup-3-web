import { Model } from '@vuex-orm/core';
import LocationType from '@/models/LocationType';

export default class Location extends Model {
  static entity = 'locations';

  static fields() {
    return {
      id: this.increment(),
      name: this.string(''),
      notes: this.string(''),
      shared: this.string('shared'),
      type: this.attr(null),
      geom: this.attr(null),
      poly: this.attr(null),
      attr: this.attr(null),
      point: this.attr(null),
    };
  }

  get location_type() {
    return LocationType.find(this.type);
  }

  static apiConfig = {
    actions: {
      fetchById(id) {
        return this.get(`/locations/${id}`);
      },
      download(id) {
        return this.request({
          url: `/locations/${id}/download`,
          method: 'GET',
          responseType: 'blob',
          save: false,
        });
      },
    },
  };
}
