import moment from 'moment';
import User from './User';
import CCUModel from '@/models/model';

export default class Invitation extends CCUModel<Invitation> {
  static entity = 'invitations';

  id!: string;
  invitee_email!: string;
  invitation_token!: string;
  expires_at!: string;
  created_at!: string;
  invited_by!: User;
  existing_user!: string;
  organization!: string;

  static fields() {
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

  static apiConfig = {
    actions: {
      resendInvitation(invitation: Invitation) {
        return this.post(
          `/invitations/${invitation.id}/resend`,
          {},
          { save: false },
        );
      },
      fetchById(id: string) {
        return this.get(`/invitations/${id}`);
      },
    } as any,
  };
}
