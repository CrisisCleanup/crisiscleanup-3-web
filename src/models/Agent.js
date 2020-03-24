import User from '@/models/User';
import { Model } from '@vuex-orm/core';

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
          agent = await this.post('/agents', user);
        }
        return agent;
      },
    },
  };
}
