import { Model } from '@vuex-orm/core';

export default class Report extends Model {
  static entity = 'reports';

  static fields() {
    return {
      id: this.attr(),
      name_t: this.attr(null),
      description_t: this.attr(null),
      report_key: this.attr(null),
      inputs: this.attr(null),
      output_formats: this.attr(null),
    };
  }
}
