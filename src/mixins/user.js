import User from '@/models/User';
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('auth', ['isLoggedIn', 'isOrphan', 'userId']),
    currentUser() {
      return User.find(this.userId);
    },
  },
};
