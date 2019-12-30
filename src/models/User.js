import { Model } from '@vuex-orm/core';
import { AuthService } from '@/services/auth.service';

export default class User extends Model {
  static entity = 'users';

  static fields() {
    return {
      id: this.increment(),
      first_name: this.string(''),
      last_name: this.string(''),
      email: this.string(''),
      mobile: this.string(''),
      roles: this.attr(null),
      organization: this.attr(null),
      states: this.attr(null),
    };
  }

  get full_name() {
    return `${this.first_name} ${this.last_name}`;
  }

  static apiConfig = {
    actions: {
      login(email, password) {
        return this.post(
          `/api-token-auth`,
          {
            email,
            password,
          },
          { save: false },
        );
      },
      inviteUser(email) {
        return this.post(
          `/invitations`,
          {
            invitee_email: email,
          },
          { save: false },
        );
      },
      acceptInvite({ token, first_name, last_name, password, mobile }) {
        return this.post(
          `/invitations/accept`,
          {
            invitation_token: token,
            first_name,
            last_name,
            password,
            mobile,
          },
          { save: false },
        );
      },
      async updateUserState(states) {
        const currentUser = User.find(AuthService.getUser().user_claims.id);
        const newStates = {
          ...currentUser.states,
          ...states,
        };
        await this.patch(
          `/users/${currentUser.id}`,
          {
            states: newStates,
          },
          { save: false },
        );
        await User.update({
          where: currentUser.id,
          data: {
            states: newStates,
          },
        });
      },
    },
  };
}
