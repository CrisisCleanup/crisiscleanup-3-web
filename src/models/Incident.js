import { Model } from '@vuex-orm/core';
import VueLog from '@dreipol/vue-log';

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
      incident_type: this.attr(null),
      color: this.attr(null),
    };
  }

  get incidentImage() {
    if (this.incident_type) {
      try {
        const incidentKey = this.incident_type.replace('_', '-');
        return require(`@/assets/disaster_icons/${incidentKey}.svg`);
      } catch (e) {
        VueLog.error(e);
      }
    }
    return null;
  }

  static apiConfig = {
    actions: {
      fetchById(id) {
        return this.get(
          `/incidents/${id}?fields=id,case_label,form_fields,geofence,short_name,name,start_at,uuid,incident_type,color`,
        );
      },
      addLocation(id, location) {
        return this.post(
          `/incidents/${id}/locations`,
          {
            location,
          },
          { save: false },
        );
      },
    },
  };
}
