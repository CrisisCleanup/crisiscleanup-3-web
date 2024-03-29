import moment from 'moment';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import CCUModel from '@/models/model';

export default class PhoneDnis extends CCUModel<PhoneDnis> {
  static entity = 'phone_dnis';

  dnis!: string;

  number_of_inbound_calls!: number;

  number_of_outbound_calls!: number;

  last_call_at!: string;

  static fields() {
    return {
      id: this.attr(''),
      dnis: this.attr(''),
      number_of_inbound_calls: this.attr(0),
      number_of_outbound_calls: this.attr(0),
      area_code: this.attr(''),
      last_call_at: this.attr(''),
      last_action: this.attr(''),
      last_status: this.attr(''),
      meta: this.attr(''),
    };
  }

  static async fetchByDnis(dnis: number) {
    return this.api().get(`${this.entity}`, {
      params: {
        dnis,
      },
      dataKey: 'results',
    });
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

  get dnisNational(): string {
    if (!this.dnis) return '';
    const number = parsePhoneNumberFromString(String(this.dnis), 'US');
    if (!number) return '';
    return number.formatNational();
  }
}
