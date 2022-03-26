import { mapGetters } from 'vuex';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { getErrorMessage } from '@/utils/errors';
import { AuthService } from '@/services/auth.service';

export default {
  methods: {
    async saveUser() {
      try {
        await User.api().patch(`/users/${this.currentUser.id}`, {
          ...this.currentUser.$toJson(),
          preferences: this.currentUser.preferences,
          states: this.currentUser.states,
        });
      } catch (error) {
        throw getErrorMessage(error);
      }
    },
    updateUser(value, key) {
      User.update({
        where: this.userId,
        data: {
          [key]: value,
        },
      });
    },
    updateUserState(state) {
      User.api().updateUserState(state);
    },
    getOrganizationName(id) {
      const organization = Organization.find(id);
      return organization.name;
    },
    getUser(id) {
      return User.find(id);
    },
    async getCurrentUser() {
      let user;
      try {
        await User.api().get('/users/me', {});
        user = User.find(this.$store.getters['auth/userId']);
        AuthService.updateUser(user.$toJson());
        return user;
      } catch {
        await AuthService.removeUser();
        await this.$store.dispatch('auth/logout');
        return null;
      }
    },
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn', 'isOrphan', 'userId']),
    currentUser() {
      let user = User.find(this.userId);
      if (!user) {
        user = this.getCurrentUser().then((u) => u);
      }
      return user;
    },
  },
};
