import User from '@/models/User';
import { Model } from '@vuex-orm/core';

export default class Agent extends Model {
  static entity = 'agents';

  static fields() {
    return {
      agent_id: this.attr(),
      password: this.string(''),
      user: this.attr({}),
      arn: this.string(''),
      instance_id: this.string(''),
    };
  }

  static apiConfig = {};

  get agentUser() {
    return User.find(this.user);
  }
}
