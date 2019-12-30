import { Model } from '@vuex-orm/core';
import moment from 'moment';

export default class Invitation extends Model {
  static entity = 'invitations';

  static fields() {
    return {
      id: this.increment(),
      invitee_email: this.string(''),
      invitation_token: this.attr(null),
      expires_at: this.attr(null),
      created_at: this.attr(null),
      invited_by: this.attr(null),
    };
  }

  get invitation_date() {
    if (this.created_at) {
      return moment(this.created_at).format('DD/MM/YYYY');
    }
    return '';
  }

  get status() {
    if (moment(this.expires_at).isBefore(moment())) {
      return 'Expired';
    }
    return 'Pending';
  }

  static apiConfig = {
    actions: {
      resendInvitation(invitation) {
        return this.post(
          `/invitations/${invitation.id}/resend`,
          {},
          { save: false },
        );
      },
    },
  };
}
