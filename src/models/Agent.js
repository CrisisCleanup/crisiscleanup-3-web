import User from '@/models/User';
import CCUModel from '@/models/model';

export const ERRORS = {
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  MOBILE_NOT_FOUND: 'MOBILE_NOT_FOUND',
  MOBILE_INVALID: 'MOBILE_INVALID',
  LANGUAGE_NOT_FOUND: 'LANGUAGE_NOT_FOUND',
  LANGUAGE_NOT_SUPPORTED: 'LANGUAGE_NOT_SUPPORTED',
};

export default class Agent extends CCUModel {
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

  static async fetchRealtimeMetrics() {
    const {
      response: { data },
    } = await Agent.api().get('/agents_metrics/realtime', { save: false });
    return data;
  }

  static async fetchHistoricMetrics() {
    const {
      response: { data },
    } = await Agent.api().get('/agents_metrics/history', { save: false });
    return data;
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
      async getMetrics(agent_id) {
        const response = await this.get(`/agents_metrics?agent=${agent_id}`, {
          save: false,
        });
        const {
          response: { data },
        } = response;
        const [metrics] = data.results;
        return metrics;
      },
      async updateConfig(id) {
        return this.patch(`/agents/${id}`, { save: false });
      },
    },
  };
}
