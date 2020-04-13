import { Model } from '@vuex-orm/core';

export default class PhoneOutbound extends Model {
  static entity = 'phone_outbound';

  static fields() {
    return {
      id: this.attr(),
      phone_number: this.attr(),
      vm_url: this.attr(),
      call_type: this.attr(),
      completion: this.attr(),
      incident_id: this.attr(),
      inbound_at: this.attr(),
      created_at: this.attr(),
      updated_at: this.attr(),
      locked_at: this.attr(),
      dnis1: this.attr(),
      dnis2: this.attr(),
      ani: this.attr(),
      worksite: this.attr(),
      pda: this.attr(),
      language: this.attr(),
      created_by: this.attr(),
      updated_by: this.attr(),
      latest_status: this.attr(),
    };
  }

  static apiConfig = {
    actions: {
      async getNextOutbound(incidentId) {
        const phoneOutbound = await this.get(
          `/phone_outbound?next=${incidentId}`,
        );
        const {
          response: { data },
        } = phoneOutbound;
        return data;
      },
      async callOutbound(id) {
        const result = this.post(`/phone_outbound/${id}/call`);
        return result;
      },
      async updateStatus(id, { statusId, worksiteId = null }) {
        const body = {
          status: statusId || null,
        };
        if (worksiteId) {
          body[worksiteId] = worksiteId;
        }
        await this.post(`/phone_outbound/${id}/update_status`, body, {
          save: false,
        });
      },
    },
  };
}
