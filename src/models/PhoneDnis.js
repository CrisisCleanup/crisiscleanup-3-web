import { Model } from '@vuex-orm/core';
import moment from 'moment';

export default class PhoneDnis extends Model {
  static entity = 'phone_dnis';

  static fields() {
    return {
      id: this.attr(),
      dnis: this.attr(),
      number_of_inbound_calls: this.attr(0),
      number_of_outbound_calls: this.attr(0),
      area_code: this.attr(),
      last_call_at: this.attr(),
      last_action: this.attr(),
      last_status: this.attr(),
    };
  }

  get totalCalls() {
    return this.number_of_inbound_calls + this.number_of_outbound_calls;
  }

  get lastCallDays() {
    if (this.last_call_at) {
      return moment(this.last_call_at).fromNow();
    }
    return 'Never';
  }
}
