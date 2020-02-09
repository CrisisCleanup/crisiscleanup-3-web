import { Model } from '@vuex-orm/core';

export default class Affiliate extends Model {
  static entity = 'organization_affiliate_requests';

  static fields() {
    return {
      id: this.attr(),
      organization: this.attr(null),
      affiliate: this.attr(null),
      approved_by: this.attr(null),
      rejected_by: this.attr(null),
    };
  }

  static apiConfig = {
    actions: {
      acceptRequest(request) {
        return this.post(
          `/organization_affiliate_requests/${request.id}/respond`,
          {
            action: 'approve',
          },
          { save: false },
        );
      },
      rejectRequest(request) {
        return this.post(
          `/organization_affiliate_requests/${request.id}/respond`,
          {
            action: 'reject',
          },
          { save: false },
        );
      },
    },
  };
}
