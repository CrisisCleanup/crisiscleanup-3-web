import moment from 'moment';
import type { Config, Request } from '@vuex-orm/plugin-axios';
import type { Fields } from '@vuex-orm/core';
import CCUModel from '@/models/base';
import type { UserContact } from '@/models/types';

export default class Invitation extends CCUModel {
  static entity = 'invitations';

  static apiConfig: Config = {
    actions: {
      async resendInvitation(this: Request, invitation: Invitation) {
        return this.post(
          `/invitations/${invitation.id}/resend`,
          {},
          { save: false },
        );
      },
      async fetchById(this: Request, id: string) {
        return this.get(`/invitations/${id}`);
      },
    },
  };

  static fields(): Fields {
    return {
      id: this.attr(''),
      invitee_email: this.string(''),
      invitation_token: this.attr(null),
      expires_at: this.attr(null),
      created_at: this.attr(null),
      invited_by: this.attr(null),
      existing_user: this.attr(null),
      organization: this.attr(null),
    };
  }

  invitee_email!: string;
  invitation_token!: string;
  expires_at!: string;
  invited_by!: UserContact;
  existing_user!: UserContact | undefined;
  organization!: number;

  get invitation_date() {
    if (this.created_at) {
      return moment(this.created_at).format('L');
    }

    return '';
  }

  get inviter() {
    return `${this.invited_by.first_name} ${this.invited_by.last_name}`;
  }

  get status() {
    if (moment(this.expires_at).isBefore(moment())) {
      return 'Expired';
    }

    return 'Pending';
  }
}
