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

  static apiConfig = {};
}
