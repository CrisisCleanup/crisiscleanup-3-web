/**
 * Use User Hook
 */

import { computed } from 'vue';
import { mapGetters, useStore } from 'vuex';
import User from '@/models/User';

/**
 * Hook for using current user.
 * @returns {{currentUser: ComputedRef<User | null>}}
 */
export default () => {
  const store = useStore();
  const userId = computed(() => store.getters['auth/userId']);
  const currentUser = computed(() => User.find(userId.value));
  return {
    currentUser,
  };
};
