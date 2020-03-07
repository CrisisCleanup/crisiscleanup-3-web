import { Model } from '@vuex-orm/core';
import { AuthService } from '@/services/auth.service';
import Language from '@/models/Language';
import Role from '@/models/Role';

export default class User extends Model {
  static entity = 'users';

  static fields() {
    return {
      id: this.attr(),
      first_name: this.string(''),
      last_name: this.string(''),
      email: this.string(''),
      mobile: this.string(''),
      roles: this.attr(null),
      files: this.attr(null),
      organization: this.attr(null),
      states: this.attr({}),
      preferences: this.attr({}),
      primary_language: this.attr(null),
      secondary_language: this.attr(null),
      social: this.attr({}),
      referring_user: this.attr({}),
    };
  }

  get profilePictureUrl() {
    if (this.files && this.files.length) {
      const profilePictures = this.files.filter(
        file => file.file_type_t === 'fileTypes.user_profile_picture',
      );
      if (profilePictures.length) {
        return profilePictures[0].url;
      }
    }
    return `https://api.adorable.io/avatars/285/ccu-user-${this.id}.png`;
  }

  get currentRole() {
    return Role.query()
      .whereIdIn(this.roles)
      .get()[0];
  }

  get referringUser() {
    return User.find(this.referring_user);
  }

  get languages() {
    const langugageList = [];
    if (this.primary_language) {
      langugageList.push(Language.find(this.primary_language));
    }
    if (this.secondary_language) {
      langugageList.push(Language.find(this.secondary_language));
    }
    return langugageList;
  }

  get notificationSettings() {
    const settings = {
      has_notifications: false,
    };
    if (this.preferences && this.preferences.notification_settings) {
      return this.preferences.notification_settings;
    }
    return settings;
  }

  get full_name() {
    return `${this.first_name} ${this.last_name}`;
  }

  get facebook() {
    return this.social && this.social.facebook;
  }

  get twitter() {
    return this.social && this.social.twitter;
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
      orphan(id) {
        return this.patch(`/users/${id}/orphan`);
      },
      addFile(id, file, type) {
        return this.post(
          `/users/${id}/files`,
          {
            file,
            type_t: type,
          },
          { save: false },
        );
      },
      deleteFile(id, file) {
        return this.delete(
          `/users/${id}/files`,
          {
            data: { file },
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
      async updateUserPreferences(preferences) {
        const currentUser = User.find(AuthService.getUser().user_claims.id);
        const newPreferences = {
          ...currentUser.preferences,
          ...preferences,
        };
        await this.patch(
          `/users/${currentUser.id}`,
          {
            preferences: newPreferences,
          },
          { save: false },
        );
        await User.update({
          where: currentUser.id,
          data: {
            preferences: newPreferences,
          },
        });
      },
    },
  };
}
