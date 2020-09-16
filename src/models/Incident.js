import Location from '@/models/Location';
import CCUModel from '@/models/model';

export default class Incident extends CCUModel {
  static entity = 'incidents';

  static fields() {
    return {
      id: this.attr(),
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
        window.vue.$log.error(e);
      }
    }
    return null;
  }

  get locationModels() {
    const locationIds = this.locations.map((location) => location.location);
    return Location.query().whereIdIn(locationIds).get();
  }

  get phase() {
    if (this.form_fields) {
      return this.form_fields[0].phase;
    }
    return null;
  }

  get friendlyName() {
    if (this.short_name) {
      return this.short_name
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    return this.name;
  }

  static apiConfig = {
    actions: {
      async fetchById(id) {
        const incident = await this.get(
          `/incidents/${id}?fields=id,case_label,form_fields,geofence,short_name,name,start_at,uuid,incident_type,color,locations`,
        );

        if (incident.response.data.locations.length) {
          const locationIds = incident.response.data.locations.map(
            (location) => location.location,
          );
          await Location.api().get(
            `/locations?id__in=${locationIds.join(',')}`,
            {
              dataKey: 'results',
            },
          );
        }
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
      removeLocation(id, location) {
        return this.delete(
          `/incidents/${id}/locations`,
          {
            data: {
              location,
            },
          },
          { save: false },
        );
      },
    },
  };
}
