// @flow
/**
 * Use User Hook
 */

import { computed } from '@vue/composition-api';
import { useGetters } from '@u3u/vue-hooks';
import User from '@/models/User';

/**
 * Hook for using current user.
 * @returns {{currentUser: ComputedRef<User | null>}}
 */
export default () => {
  const getters = {
    ...useGetters('auth', ['userId']),
  };

  const currentUser = computed(() => User.find(getters.userId.value));
  return {
    currentUser,
  };
};
