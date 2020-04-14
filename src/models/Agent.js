import User from '@/models/User';
import { Model } from '@vuex-orm/core';

export const ERRORS = {
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  MOBILE_NOT_FOUND: 'MOBILE_NOT_FOUND',
  MOBILE_INVALID: 'MOBILE_INVALID',
  LANGUAGE_NOT_FOUND: 'LANGUAGE_NOT_FOUND',
  LANGUAGE_NOT_SUPPORTED: 'LANGUAGE_NOT_SUPPORTED',
};

export default class Agent extends Model {
  static entity = 'agents';

  static primaryKey = 'agent_id';

  static fields() {
    return {
      agent_id: this.attr(null),
      user_id: this.attr(null),
      password: this.string(''),
      user: this.belongsTo(User, 'user_id'),
      arn: this.string(''),
      instance_id: this.string(''),
    };
  }

  static apiConfig = {
    actions: {
      async fetch(user) {
        let agent;
        try {
          agent = await this.get('/agents/me');
        } catch {
          try {
            agent = await this.post('/agents', user);
          } catch (e) {
            const {
              response: {
                data: { data },
              },
            } = e;
            let errors = data.errors ? data.errors : [];
            errors = errors.map(({ type }) => ERRORS[type]);
            if (errors) {
              throw errors;
            }
            throw e;
          }
        }
        const {
          response: { data },
        } = agent;
        return data;
      },
      async updateConfig(id) {
        return this.patch(`/agents/${id}`, { save: false });
      },
      async getDynamicState(id) {
        let resp;
        try {
          resp = await this.get(`/agents/${id}/state`, { save: false });
        } catch (e) {
          return {
            state: 'static',
          };
        }
        const {
          response: { data },
        } = resp;
        return data;
      },
      async setDynamicState(id, state) {
        return this.patch(
          `/agents/${id}`,
          {
            state,
            entered_timestamp: new Date().toISOString(),
          },
          { save: false },
        );
      },
    },
  };
}
