import type { Config, Request } from '@vuex-orm/plugin-axios';
import Organization from './Organization';
import type User from './User';
import CCUModel from '@/models/base';

export default class Affiliate extends CCUModel {
  static entity = 'organization_affiliate_requests';

  static apiConfig: Config = {
    actions: {
      async acceptRequest(this: Request, request: Affiliate) {
        return this.post(
          `/organization_affiliate_requests/${request.id}/respond`,
          {
            action: 'approve',
          },
          { save: false },
        );
      },
      async rejectRequest(this: Request, request: Affiliate) {
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

  static fields() {
    return {
      id: this.attr(''),
      organization: this.attr(null),
      affiliate: this.attr(null),
      requested_by: this.attr(null),
      requested_at: this.attr(null),
      approved_by: this.attr(null),
      approved_at: this.attr(null),
      rejected_by: this.attr(null),
      rejected_at: this.attr(null),
      request_notes: this.attr(null),
    };
  }

  organization!: Organization;
  affiliate!: string | number;
  requested_by!: User;
  requested_at!: string;
  approved_by!: User;
  approved_at!: string;
  rejected_by!: User;
  rejected_at!: string;
  request_notes!: string;

  get affiliate_organization() {
    return Organization.find(this.affiliate);
  }

  get status() {
    return this.approved_by ? 'Affiliated' : 'Pending';
  }
}
