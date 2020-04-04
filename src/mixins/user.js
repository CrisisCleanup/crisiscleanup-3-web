import User from '@/models/User';
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
    async updateUser(value, key) {
      await User.update({
        where: this.currentUser.id,
        data: {
          [key]: value,
        },
      });
    },
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn', 'isOrphan', 'userId']),
    currentUser() {
      return User.find(this.userId);
    },
  },
};
