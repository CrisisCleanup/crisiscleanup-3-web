import { Model } from '@vuex-orm/core';
import moment from 'moment';

export default class InvitationRequest extends Model {
  static entity = 'invitation_requests';

  static fields() {
    return {
      id: this.attr(),
      email: this.string(''),
      first_name: this.string(''),
      last_name: this.string(''),
      invitation_token: this.attr(null),
      mobile: this.attr(null),
      requested_to: this.attr(null),
      requested_to_organization: this.attr(null),
      requested_at: this.attr(null),
      approved_at: this.attr(null),
      rejected_at: this.attr(null),
    };
  }

  get full_name() {
    return `${this.first_name} ${this.last_name}`;
  }

  get requested_at_moment() {
    if (this.requested_at) {
      return moment(this.requested_at).format('DD/MM/YYYY');
    }
    return '';
  }

  static apiConfig = {
    actions: {
      acceptInvitationRequest(request) {
        return this.post(
          `/invitation_requests/${request.id}/approve`,
          {
            invitation_token: request.invitation_token,
          },
          { save: false },
        );
      },
      rejectInvitationRequest(request) {
        return this.post(
          `/invitation_requests/${request.id}/reject`,
          {
            invitation_token: request.invitation_token,
          },
          { save: false },
        );
      },
    },
  };
}
