import moment from 'moment';
import type { Config, Request } from '@vuex-orm/plugin-axios';
import Location from './Location';
import { DISASTER_ICONS } from '@/constants';
import CCUModel from '@/models/base';
import type { FormField, LocationJoin } from '@/models/types';

export default class Incident extends CCUModel {
  static entity = 'incidents';

  static apiConfig: Config = {
    actions: {
      async fetchById(this: Request, id: string) {
        const incident = await this.get(
          `/incidents/${id}?fields=id,case_label,form_fields,geofence,short_name,name,start_at,uuid,incident_type,color,locations,turn_on_release,created_work_types,auto_contact,active_phone_number`,
        );
        const _response = incident.response.data as Incident;
        if (_response.locations.length > 0) {
          const locationIds = _response.locations.map(
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
      async addLocation(this: Request, id: string, location: Location) {
        return this.post(
          `/incidents/${id}/locations`,
          {
            location,
          },
          { save: false },
        );
      },
      async removeLocation(this: Request, id: string, location: Location) {
        return this.delete(`/incidents/${id}/locations`, {
          data: {
            location,
          },
          save: false,
        });
      },
    },
  };

  static fields() {
    return {
      id: this.attr(''),
      case_label: this.string(''),
      timezone: this.string(''),
      form_fields: this.attr(null),
      geofence: this.attr(null), // This field is not used. to be removed once confirmed
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
      is_archived: this.attr(false),
    };
  }

  static getIncidentImage(incidentType: string): any {
    if (incidentType) {
      try {
        const incidentKey = incidentType.replace('_', '-');
        return DISASTER_ICONS[incidentKey];
      } catch (error: unknown) {
        console.log(error);
      }
    }

    return null;
  }

  case_label!: string;
  timezone!: string;
  form_fields!: FormField[];
  geofence!: any;
  short_name!: string;
  name!: string;
  start_at!: string | Date;
  uuid!: string;
  extent!: any;
  incident_type!: string;
  color!: string;
  locations!: LocationJoin[];
  turn_on_release!: boolean;
  auto_contact!: boolean;
  active_phone_number!: string | undefined;
  created_work_types!: any[];
  is_archived!: boolean;

  get incidentImage() {
    return Incident.getIncidentImage(this.incident_type) as unknown;
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
}
