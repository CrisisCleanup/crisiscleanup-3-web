import { Model } from '@vuex-orm/core';

export default class WorksiteRequest extends Model {
  static entity = 'worksite_requests';

  static fields() {
    return {
      id: this.increment(),
      worksite_work_type: this.attr(null),
      worksite: this.attr(null),
      requested_by: this.attr(null),
      requested_by_org: this.attr(null),
      expires_at: this.attr(null),
      created_at: this.attr(null),
      accepted_rejected_reason: this.attr(null),
    };
  }
}
