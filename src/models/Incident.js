import { Model } from '@vuex-orm/core';
import VueLog from '@dreipol/vue-log';
import Location from '@/models/Location';

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
      locations: this.attr(null),
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

  get locationModels() {
    const locationIds = this.locations.map(location => location.location);
    return Location.query()
      .whereIdIn(locationIds)
      .get();
  }

  static apiConfig = {
    actions: {
      async fetchById(id) {
        const incident = await this.get(
          `/incidents/${id}?fields=id,case_label,form_fields,geofence,short_name,name,start_at,uuid,incident_type,color,locations`,
        );

        const locationPromises = incident.response.data.locations.map(
          location => Location.api().fetchById(location.location),
        );
        await Promise.all(locationPromises);
        return incident;
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
