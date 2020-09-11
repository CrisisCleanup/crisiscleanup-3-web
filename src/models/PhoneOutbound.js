import { isNil, isArray, omitBy, first } from 'lodash';
import CCUModel from '@/models/model';

export default class PhoneOutbound extends CCUModel {
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
      locked_by: this.attr(),
      dnis1: this.attr(),
      dnis2: this.attr(),
      ani: this.attr(),
      worksite: this.attr(),
      pda: this.attr(),
      language: this.attr(),
      created_by: this.attr(),
      updated_by: this.attr(),
      latest_status: this.attr(),
      location_name: this.attr(),
      priority: this.attr(),
    };
  }

  static apiConfig = {
    actions: {
      async getNextOutbound({ incidentId = 199, agentId = '' }) {
        let queryUrl = `/phone_outbound?next=${incidentId}`;
        if (agentId) {
          queryUrl = `${queryUrl}&agent=${agentId}`;
        }
        const phoneOutbound = await this.get(queryUrl);
        const {
          response: { data },
        } = phoneOutbound;
        return data;
      },
      async getRemainingCallbackCount(incidentId) {
        const phoneOutbound = await this.get(
          `/phone_outbound?incident_id=${incidentId}&&completion__lt=1&limit=1`,
        );
        const {
          response: { data },
        } = phoneOutbound;
        return data.count;
      },
      async getSingleOutbound(id) {
        const phoneOutbound = await this.get(`/phone_outbound/${id}`);
        const {
          response: { data },
        } = phoneOutbound;
        return data;
      },
      async callOutbound(id) {
        const result = this.post(`/phone_outbound/${id}/call`);
        return result;
      },
      async updateStatus(
        id,
        { statusId, notes, dnisMeta, agentId, cases, worksiteId },
      ) {
        const body = omitBy(
          {
            status: statusId || null,
            dnis_meta: dnisMeta || null,
            agent: agentId || null,
            worksite: worksiteId || null,
            notes: notes || null,
            cases,
          },
          isNil,
        );
        await this.post(`/phone_outbound/${id}/update_status`, body, {
          save: false,
        });
      },
      async createAndCall({ number, incidentId, ani, language, userId }) {
        const resp = await this.post(
          `/phone_outbound`,
          omitBy(
            {
              dnis1: number,
              incident_id: isArray(incidentId) ? incidentId : [incidentId],
              ani,
              language,
              locked_by: userId,
            },
            isNil,
          ),
        );
        const outbound = first(resp.entities);
        if (outbound) {
          await this.callOutbound(outbound.id);
        }
        return outbound;
      },
    },
  };
}
