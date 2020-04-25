import User from '@/models/User';
import Organization from '@/models/Organization';
import { getErrorMessage } from '@/utils/errors';
import { mapGetters } from 'vuex';

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
    getOrganizationName(id) {
      const organization = Organization.find(id);
      return organization.name;
    },
    getUser(id) {
      return User.find(id);
    },
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn', 'isOrphan', 'userId']),
    currentUser() {
      return User.find(this.userId);
    },
  },
};
