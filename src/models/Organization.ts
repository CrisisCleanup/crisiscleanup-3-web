import { Model } from "@vuex-orm/core";
import Incident from "../models/Incident";

export default class Organization extends Model {
  static entity = "organizations";

  id!: string;

  name!: string;

  incidents!: any[];

  files!: any[];

  static fields() {
    return {
      id: this.attr(""),
      name: this.string(""),
      url: this.string(""),
      facebook: this.string(""),
      twitter: this.string(""),
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

  get incident_list() {
    return Incident.query().whereIdIn(this.incidents).get();
  }

  get logo_url() {
    if (this.files.length) {
      const logos = this.files.filter(
        (file) => file.file_type_t === "fileTypes.logo"
      );
      if (logos.length) {
        return logos[0].small_thumbnail_url;
      }
    }
    return "";
  }

  static apiConfig = {
    actions: {
      addFile(id: string, file: any, type: string) {
        return this.post(
          `/organizations/${id}/files`,
          {
            file,
            type_t: type,
          },
          { save: false }
        );
      },
      deleteFile(id: string, file: any) {
        return this.delete(
          `/organizations/${id}/files`,
          {
            data: { file },
          },
          { save: false }
        );
      },
      approve(id: string, reason: string) {
        return this.post(
          `/organizations/${id}/approve`,
          { approve_reject_reason_t: reason },
          { save: false }
        );
      },
      reject(id: string, reason: string, note: string | null = null) {
        const data: Record<string, any> = { approve_reject_reason_t: reason };
        if (note) {
          data.rejection_note = note;
        }
        return this.post(`/organizations/${id}/reject`, data, { save: false });
      },
    } as any,
  };
}
