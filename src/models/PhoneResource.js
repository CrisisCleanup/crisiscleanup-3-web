import { Model } from '@vuex-orm/core';

export default class PhoneResource extends Model {
  static entity = 'phone_resources';

  static fields() {
    return {
      id: this.attr(),
      name_t: this.attr(''),
      category_t: this.attr(''),
      dnis: this.attr(''),
      transfer_type: this.attr(''),
      dnis_ext: this.attr(''),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      file: this.attr(''),
      created_by: this.attr(''),
      uodated_by: this.attr(''),
    };
  }
}
