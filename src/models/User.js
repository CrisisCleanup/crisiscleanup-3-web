import { AuthService } from '@/services/auth.service';
import Language from '@/models/Language';
import Role from '@/models/Role';
import moment from 'moment';
import CCUModel from '@/models/model';

export default class User extends CCUModel {
  static entity = 'users';

  static fields() {
    return {
      id: this.attr(),
      first_name: this.string(''),
      last_name: this.string(''),
      email: this.string(''),
      mobile: this.string(''),
      roles: this.attr(null),
      active_roles: this.attr(null),
      files: this.attr(null),
      organization: this.attr(null),
      states: this.attr({}),
      preferences: this.attr({}),
      permissions: this.attr({}),
      beta_features: this.attr({}),
      primary_language: this.attr(null),
      secondary_language: this.attr(null),
      accepted_terms_timestamp: this.attr(null),
      accepted_terms: this.attr(null),
      social: this.attr({}),
      referring_user: this.attr({}),
      lineage: this.attr([]),
    };
  }

  get profilePictureUrl() {
    if (this.files && this.files.length) {
      const profilePictures = this.files.filter(
        (file) => file.file_type_t === 'fileTypes.user_profile_picture',
      );
      if (profilePictures.length) {
        return profilePictures[0].url;
      }
    }
    return `https://api.adorable.io/avatars/285/ccu-user-${this.id}.png`;
  }

  get currentRole() {
    return Role.query().whereIdIn(this.active_roles).get()[0];
  }

  get referringUser() {
    return User.find(this.referring_user);
  }

  get languages() {
    const languageList = [];
    if (this.primary_language) {
      languageList.push(Language.find(this.primary_language));
    }
    if (this.secondary_language) {
      languageList.push(Language.find(this.secondary_language));
    }
    return languageList;
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

  get isAdmin() {
    return this.active_roles.includes(1);
  }

  getStatesForIncident(incidentId, fallback = true) {
    if (
      this.states &&
      this.states.incidents &&
      this.states.incidents[incidentId]
    ) {
      return this.states.incidents[incidentId];
    }
    if (fallback) {
      return this.states;
    }
    return null;
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
      inviteUser(email, organization = null) {
        const data = {
          invitee_email: email,
        };
        if (organization) {
          data.organization = organization;
        }
        return this.post(`/invitations`, data, { save: false });
      },
      acceptInvite({ token, first_name, last_name, password, mobile, title }) {
        return this.post(
          `/invitations/accept`,
          {
            invitation_token: token,
            first_name,
            last_name,
            password,
            mobile,
            title,
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
      async updateUserState(globalStates, incidentStates, reload = false) {
        /* Update user states JSON with new states.

           To be backwards-compatible with clients without per-incident states,
           update top-level with both globalStates and incidentStates
           and then update state for current incident with incidentStates.
        */
        let currentUser = User.find(AuthService.getUser().user_claims.id);
        const states = currentUser.states || {};
        const currentIncident = states.incident;
        let updatedStates = {
          ...states,
          ...globalStates,
          ...incidentStates,
        };
        let updatedIncidentStates = states.incidents || {};
        if (incidentStates) {
          updatedIncidentStates = {
            ...updatedIncidentStates,
            [currentIncident]: incidentStates,
          };
        }
        updatedStates = {
          ...updatedStates,
          ...{ incidents: updatedIncidentStates },
        };
        await User.update({
          where: currentUser.id,
          data: {
            states: updatedStates,
          },
        });
        currentUser = User.find(AuthService.getUser().user_claims.id);
        await this.patch(
          `/users/${currentUser.id}`,
          {
            states,
          },
          { save: false },
        );
        if (reload) {
          await this.get('/users/me', {});
        }
      },
      async updateUserPreferences(preferences, reload = false) {
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
        if (reload) {
          await this.get('/users/me', {});
        }
      },
      async acceptTerms() {
        const currentUser = User.find(AuthService.getUser().user_claims.id);
        await this.patch(`/users/${currentUser.id}`, {
          accepted_terms: true,
          accepted_terms_timestamp: moment().toISOString(),
        });
      },
    },
  };
}
