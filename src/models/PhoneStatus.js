import { Model } from '@vuex-orm/core';

export default class PhoneStatus extends Model {
  static entity = 'phone_statuses';

  static fields() {
    return {
      id: this.attr(),
      substatus: this.string(''),
      status: this.string(''),
      primary_state: this.string(''),
      substatus_name_t: this.string(''),
      status_name_t: this.string(''),
      primary_state_name_t: this.string(''),
      completion: this.number(1),
      try_again_delay: this.number(0),
      list_order: this.number(0),
    };
  }
}
