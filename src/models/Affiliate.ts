import { Model } from '@vuex-orm/core';
import { type Config } from '@vuex-orm/plugin-axios';
import Organization from './Organization';
import type User from './User';

export default class Affiliate extends Model {
  static entity = 'organization_affiliate_requests';

  id!: number;
  organization!: Organization;
  affiliate!: string | number;
  approved_by!: User;
  rejected_by!: User;

  static fields() {
    return {
      id: this.attr(''),
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

  static apiConfig: Config = {
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
