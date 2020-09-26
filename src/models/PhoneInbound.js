import { isNil, omitBy } from 'lodash';
import CCUModel from '@/models/model';

export default class PhoneInbound extends CCUModel {
  static entity = 'phone_inbound';

  static fields() {
    return {
      id: this.attr(),
      dnis: this.attr(),
      ani: this.attr(),
      session_id: this.attr(),
      incident_id: this.attr(),
      language: this.attr(),
    };
  }

  static apiConfig = {
    actions: {
      async skipCall(id) {
        await this.post(`/phone_inbound/${id}/skip`, { save: false });
      },
      async fetchById(id) {
        const inbound = await this.get(`/phone_inbound/${id}`);
        const {
          response: { data },
        } = inbound;
        return data;
      },
      async fetchBySessionId(sessionId) {
        const inbound = await this.get(
          `/phone_inbound/get_by_session_id?session_id=${sessionId}`,
        );
        const {
          response: { data },
        } = inbound;
        return data;
      },
      async updateStatus(id, { statusId, notes, dnisMeta, agentId, cases }) {
        const body = omitBy(
          {
            status: statusId || null,
            dnis_meta: dnisMeta || null,
            agent: agentId,
            notes: notes || null,
            cases,
          },
          isNil,
        );
        await this.post(`/phone_inbound/${id}/update_status`, body, {
          save: false,
        });
      },
    },
  };
}
