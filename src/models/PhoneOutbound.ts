import { isArray, isNil, omitBy } from 'lodash';
import CCUModel from '@/models/model';

export default class PhoneOutbound extends CCUModel<PhoneOutbound> {
  static entity = 'phone_outbound';

  phone_number!: string;

  incident_id!: string;

  id!: string;

  dnis1!: string;

  location_name!: string;

  state_name!: string;

  static fields() {
    return {
      id: this.attr(''),
      phone_number: this.attr(''),
      vm_url: this.attr(''),
      call_type: this.attr(''),
      completion: this.attr(''),
      incident_id: this.attr(''),
      inbound_at: this.attr(''),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      locked_at: this.attr(''),
      locked_by: this.attr(''),
      dnis1: this.attr(''),
      dnis2: this.attr(''),
      ani: this.attr(''),
      worksite: this.attr(''),
      pda: this.attr(''),
      language: this.attr(''),
      created_by: this.attr(''),
      updated_by: this.attr(''),
      latest_status: this.attr(''),
      location_name: this.attr(''),
      priority: this.attr(''),
      external_id: this.attr(''),
    };
  }

  async skipOutbound() {
    // @ts-expect-error
    await this.api().post(`/phone_outbound/${this.id}/unlock`, {
      skipped: true,
    });
  }

  static apiConfig = {
    actions: {
      async acceptCall(id: string) {
        await this.post(`/phone_outbound/${id}/accept`, { save: false });
      },
      async skipCall(id: string) {
        await this.post(`/phone_outbound/${id}/skip`, { save: false });
      },
      async getNextOutbound({
        incidentId = 199,
        agentId = '',
        useCalldowns = false,
        isManual = false,
      }) {
        let queryUrl = `/phone_outbound?next=${incidentId}`;
        if (agentId) {
          queryUrl = `${queryUrl}&agent=${agentId}`;
        }

        if (useCalldowns) {
          queryUrl = `${queryUrl}&use_calldowns=1`;
        }

        if (isManual) {
          queryUrl = `${queryUrl}&manual=1`;
        }

        const phoneOutbound = await this.get(queryUrl);
        const {
          response: { data },
        } = phoneOutbound;
        return data;
      },
      async getRemainingCallbackCount(incidentId: string) {
        const phoneOutbound = await this.get(
          `/phone_outbound?incident_id=${incidentId}&completion__lt=1&limit=1&filter_ani=1&locked_at__isnull=True&call_type=callback`,
        );
        const {
          response: { data },
        } = phoneOutbound;
        return data.count;
      },
      async getRemainingCalldownCount(incidentId: string) {
        const phoneOutbound = await this.get(
          `/phone_outbound?incident_id=${incidentId}&completion__lt=1&limit=1&filter_ani=1&locked_at__isnull=True&call_type=calldown`,
        );
        const {
          response: { data },
        } = phoneOutbound;
        return data.count;
      },
      async getSingleOutbound(id: string) {
        const phoneOutbound = await this.get(`/phone_outbound/${id}`);
        const {
          response: { data },
        } = phoneOutbound;
        return data;
      },
      async callOutbound(id: string, { isManual = false } = {}) {
        return this.post(
          `/phone_outbound/${id}/call`,
          {
            manual: isManual,
          },
          { save: false },
        );
      },
      async updateStatus(
        id: string,
        { statusId, notes, dnisMeta, agentId, cases, worksiteId }: any,
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
      async createManual({ number, incidentId, ani, language, userId }: any) {
        const resp = await this.post(
          `/phone_outbound`,
          omitBy(
            {
              phone_number: number,
              incident_id: isArray(incidentId) ? incidentId : [incidentId],
              ani,
              language,
              locked_by: userId,
              completion: 1,
            },
            isNil,
          ),
        );
        const [outbound] = resp.entities.phone_outbound || [];
        return outbound;
      },
    } as any,
  };
}
