import moment from 'moment';
import Bowser from 'bowser';
import * as Sentry from '@sentry/browser';
import { useRouter } from 'vue-router';
import { Model } from '@vuex-orm/core';
import type { Config } from '@vuex-orm/plugin-axios';
import { AuthService } from '../services/auth.service';
import Language from './Language';
import Role from './Role';
import CCUModel from '@/models/model';

export default class User extends CCUModel<User> {
  static entity = 'users';

  id!: string;

  primary_language!: string;

  secondary_language!: string;

  organization!: any;

  active_roles!: any[];

  referring_user!: string;

  preferences!: Record<string, any>;

  first_name!: string;

  last_name!: string;

  email!: string;

  mobile!: string;

  accepted_terms_timestamp!: string;

  states!: Record<string, any>;

  social!: Record<string, any>;

  files!: any[];

  lineage!: any[];

  permissions!: Record<string, boolean>;

  beta_features!: string[];

  static fields() {
    return {
      id: this.attr(''),
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

  static afterUpdate(model: User) {
    if (model.id === User.store().getters['auth/userId']) {
      AuthService.updateUser(model.$toJson());
      Sentry.setUser(model.$toJson());
      Sentry.setContext('user_states', model.states);
      Sentry.setContext('user_preferences', model.preferences);
      // User.store().commit("auth/setAcl", useRouter());
    }
  }

  get hasProfilePicture() {
    if (this.files && this.files.length > 0) {
      const profilePictures = this.files.filter(
        (file) => file.file_type_t === 'fileTypes.user_profile_picture',
      );
      return profilePictures.length;
    }

    return false;
  }

  get profilePictureUrl() {
    if (this.files && this.files.length > 0) {
      const profilePictures = this.files.filter(
        (file) => file.file_type_t === 'fileTypes.user_profile_picture',
      );
      if (profilePictures.length > 0) {
        return profilePictures[0].large_thumbnail_url;
      }
    }

    return `https://avatars.dicebear.com/api/bottts/${this.full_name}.svg`;
  }

  get currentRole() {
    return Role.query().whereIdIn(this.active_roles).get()[0];
  }

  get referringUser() {
    return User.find(this.referring_user);
  }

  get languages() {
    const languageList: any[] = [];
    if (this.primary_language) {
      languageList.push(Language.find(this.primary_language));
    }

    if (this.secondary_language) {
      languageList.push(Language.find(this.secondary_language));
    }

    return languageList;
  }

  get languageIds() {
    const languageList: any[] = [];
    if (this.primary_language) {
      languageList.push(this.primary_language);
    }

    if (this.secondary_language) {
      languageList.push(this.secondary_language);
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

  get isPrimaryContact() {
    return this.active_roles.includes(3);
  }

  getStatesForIncident(incidentId: string, fallback = true) {
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

  static apiConfig: Config = {
    actions: {
      login(email: string, password: string) {
        return this.post(
          `/api-token-auth`,
          {
            email,
            password,
          },
          { save: false },
        );
      },
      inviteUser(email: string, organization = null) {
        const data: Record<string, any> = {
          invitee_email: email,
        };
        if (organization) {
          data.organization = organization;
        }

        return this.post(`/invitations`, data, { save: false });
      },
      acceptInvite({
        token,
        first_name,
        last_name,
        password,
        mobile,
        title,
      }: Record<string, any>) {
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
      orphan(id: string) {
        return this.patch(`/users/${id}/orphan`);
      },
      addFile(id: string, file: string, type: string) {
        return this.post(
          `/users/${id}/files`,
          {
            file,
            type_t: type,
          },
          { save: false },
        );
      },
      deleteFile(id: string, file: string) {
        return this.delete(
          `/users/${id}/files`,
          {
            data: { file },
          },
          { save: false },
        );
      },
      async clearUserStates() {
        const currentUser = User.find(User.store().getters['auth/userId']);
        await this.patch(
          `/users/${currentUser?.id}`,
          {
            states: {},
          },
          { save: false },
        );
        await this.get('/users/me');
      },
      async clearUserPreferences() {
        const currentUser = User.find(User.store().getters['auth/userId']);
        await this.patch(
          `/users/${currentUser?.id}`,
          {
            preferences: {},
          },
          { save: false },
        );
        await this.get('/users/me');
      },
      async updateUserState(
        globalStates: Record<string, any>,
        incidentStates: Record<string, any>,
        reload = false,
      ) {
        /* Update user states JSON with new states.

           To be backwards-compatible with clients without per-incident states,
           update top-level with both globalStates and incidentStates
           and then update state for current incident with incidentStates.
        */
        let currentUser = User.find(User.store().getters['auth/userId']);

        if (!currentUser) {
          return;
        }

        const states = (currentUser && currentUser.states) || {};
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
          incidents: updatedIncidentStates,
          userAgent: Bowser.parse(window.navigator.userAgent),
        };
        await User.update({
          where: currentUser.id,
          data: {
            states: updatedStates,
          },
        });
        currentUser = User.find(AuthService.getUser().user_claims.id);
        await this.patch(
          `/users/${currentUser?.id}`,
          {
            states: updatedStates,
          },
          { save: false },
        );
        if (reload) {
          await this.get('/users/me');
        }
      },
      async updateUserPreferences(
        preferences: Record<string, any>,
        reload = false,
      ) {
        const currentUser = User.find(AuthService.getUser().user_claims.id);
        if (!currentUser) {
          return;
        }

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
        await this.patch(`/users/${currentUser?.id}`, {
          accepted_terms: true,
          accepted_terms_timestamp: moment().toISOString(),
        });
      },
    },
  };
}
