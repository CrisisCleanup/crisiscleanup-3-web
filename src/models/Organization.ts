import type { Config, Request } from '@vuex-orm/plugin-axios';
import Incident from './Incident';
import type Location from './Location';
import CCUModel from '@/models/base';
import type { CCUFileItem, UserContact } from '@/models/types';

export default class Organization extends CCUModel<Organization> {
  static entity = 'organizations';

  static apiConfig: Config = {
    actions: {
      async addFile(this: Request, id: string, file: string, type: string) {
        return this.post(
          `/organizations/${id}/files`,
          {
            file,
            type_t: type,
          },
          { save: false },
        );
      },
      async deleteFile(this: Request, id: string, file: string) {
        return this.delete(`/organizations/${id}/files`, {
          data: { file },
          save: false,
        });
      },
      async approve(this: Request, id: string, reason: string) {
        return this.post(
          `/organizations/${id}/approve`,
          { approve_reject_reason_t: reason },
          { save: false },
        );
      },
      async reject(
        this: Request,
        id: string,
        reason: string,
        note: string | undefined = undefined,
      ) {
        const data: Record<string, any> = { approve_reject_reason_t: reason };
        if (note) {
          data.rejection_note = note;
        }

        return this.post(`/organizations/${id}/reject`, data, { save: false });
      },
    },
  };

  static fields() {
    return {
      id: this.attr(''),
      name: this.string(''),
      url: this.string(''),
      facebook: this.string(''),
      twitter: this.string(''),
      affiliates: this.attr([]),
      primary_location: this.attr(null),
      secondary_location: this.attr(null),
      type_t: this.attr(null),
      user_count: this.attr(null),
      incidents: this.attr(null),
      approved_incidents: this.attr(null),
      approved_roles: this.attr(null),
      pending_incidents: this.attr(null),
      incident_primary_contacts: this.attr(null),
      primary_contacts: this.attr(null),
      files: this.attr(null),
      custom_ops_message: this.attr(null),
      custom_legal_tos: this.attr(null),
      custom_legal_survivor_waiver: this.attr(null),
      address: this.attr(null),
      city: this.attr(null),
      state: this.attr(null),
      postal_code: this.attr(null),
      phone1: this.attr(null),
      phone2: this.attr(null),
      email: this.attr(null),
      donate_url: this.attr(null),
    };
  }

  // Fields
  name!: string;
  url!: string;
  facebook!: string;
  twitter!: string;
  affiliates!: number[];
  primary_location!: Location;
  secondary_location!: Location | undefined;
  type_t!: string | undefined;
  user_count!: number;
  incidents!: number[];
  approved_incidents!: number[];
  approved_roles!: number[];
  pending_incidents!: number[];
  incident_primary_contacts!: number[];
  primary_contacts!: UserContact[];
  files!: CCUFileItem[];
  custom_ops_message!: string | undefined;
  custom_legal_tos!: string | undefined;
  custom_legal_survivor_waiver!: string | undefined;
  address!: string | undefined;
  city!: string | undefined;
  state!: string | undefined;
  postal_code!: string | undefined;
  phone1!: string | undefined;
  phone2!: string | undefined;
  email!: string | undefined;
  donate_url!: string | undefined;

  get incident_list() {
    return Incident.query().whereIdIn(this.incidents).get();
  }

  get logo_url() {
    if (this.files.length > 0) {
      const logos = this.files.filter(
        (file) => file.file_type_t === 'fileTypes.logo',
      );
      if (logos.length > 0) {
        return logos[0].small_thumbnail_url;
      }
    }

    return '';
  }
}
