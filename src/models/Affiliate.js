import { Model } from '@vuex-orm/core';
import Organization from './Organization';

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

  get affiliate_organization() {
    return Organization.find(this.affiliate);
  }

  get status() {
    return this.approved_by ? 'Affiliated' : 'Pending';
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
