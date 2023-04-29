import moment from 'moment';
import User from './User';
import CCUModel from '@/models/model';

export default class InvitationRequest extends CCUModel<InvitationRequest> {
  static entity = 'invitation_requests';

  id!: string;
  email!: string;
  first_name!: string;
  last_name!: string;
  invitation_token!: string;
  mobile!: User;
  requested_to!: string;
  requested_to_organization!: string;
  requested_at!: string;
  approved_at!: string;
  rejected_at!: string;

  static fields() {
    return {
      id: this.attr(''),
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
      acceptInvitationRequest(request: InvitationRequest) {
        return this.post(
          `/invitation_requests/${request.id}/approve`,
          {
            invitation_token: request.invitation_token,
          },
          { save: false },
        );
      },
      rejectInvitationRequest(request: InvitationRequest) {
        return this.post(
          `/invitation_requests/${request.id}/reject`,
          {
            invitation_token: request.invitation_token,
          },
          { save: false },
        );
      },
    } as any,
  };
}
