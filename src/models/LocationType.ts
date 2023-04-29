import CCUModel from '@/models/base';

export default class LocationType extends CCUModel<LocationType> {
  static entity = 'location_types';

  id!: string;

  key!: string;

  name_t!: string;
  description_t!: string;

  static fields() {
    return {
      id: this.attr(null),
      key: this.attr(null),
      name_t: this.attr(null),
      description_t: this.attr(null),
    };
  }
}
