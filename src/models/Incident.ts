import moment from 'moment';
import { DISASTER_ICONS } from '../constants';
import Location from './Location';
import CCUModel from './model';

export default class Incident extends CCUModel<Incident> {
  static entity = 'incidents';

  id!: string;

  name!: string;

  short_name!: string;

  incident_type!: string;

  start_at!: string;

  active_phone_number!: string;

  locations!: any[];

  form_fields!: any[];

  created_work_types!: any[];

  static fields() {
    return {
      id: this.attr(''),
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
      turn_on_release: this.attr(false),
      auto_contact: this.attr(false),
      active_phone_number: this.attr(null),
      created_work_types: this.attr([]),
    };
  }

  static getIncidentImage(incidentType: string) {
    if (incidentType) {
      try {
        const incidentKey = incidentType.replace('_', '-');
        return DISASTER_ICONS[incidentKey];
      } catch (error) {
        console.log(error);
        // Window.vue.$log.error(e);
      }
    }

    return null;
  }

  get incidentImage() {
    return Incident.getIncidentImage(this.incident_type);
  }

  get start_at_moment() {
    if (this.start_at) {
      return moment(this.start_at);
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
      async fetchById(id: string) {
        const incident = await this.get(
          `/incidents/${id}?fields=id,case_label,form_fields,geofence,short_name,name,start_at,uuid,incident_type,color,locations,turn_on_release,created_work_types,auto_contact,active_phone_number`,
        );

        if (incident.response.data.locations.length > 0) {
          const locationIds = incident.response.data.locations.map(
            (location: any) => location.location,
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
      addLocation(id: string, location: Location) {
        return this.post(
          `/incidents/${id}/locations`,
          {
            location,
          },
          { save: false },
        );
      },
      removeLocation(id: string, location: Location) {
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
    } as any,
  };
}
