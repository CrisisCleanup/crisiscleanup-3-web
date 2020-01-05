import { Model } from '@vuex-orm/core';

export default class Incident extends Model {
  static entity = 'incidents';

  static fields() {
    return {
      id: this.increment(),
      case_label: this.string(''),
      form_fields: this.attr(null),
      geofence: this.attr(null),
      short_name: this.attr(null),
      name: this.attr(null),
      start_at: this.attr(null),
      uuid: this.attr(null),
      extent: this.attr(null),
    };
  }

  static apiConfig = {
    actions: {
      fetchById(id) {
        return this.get(
          `/incidents/${id}?fields=id,case_label,form_fields,geofence,short_name,name,start_at,uuid`,
        );
      },
    },
  };
}
