import User from '../models/User';
import { store } from '../store';
import { getErrorMessage } from '../utils/errors';
import { computed } from 'vue';

export default function useCurrentUser() {
  const currentUser = computed(() => User.find(store.getters['auth/userId']));
  const updateCurrentUser = async (value: any, key: string) => {
    return User.update({
      where: currentUser.value?.id,
      data: {
        [key]: value,
      },
    });
  };

  const saveCurrentUser = async () => {
    try {
      await User.api().patch(`/users/${currentUser.value?.id}`, {
        ...User.find(currentUser.value?.id)?.$toJson(),
        preferences: currentUser.value?.preferences,
        states: currentUser.value?.states,
      });
    } catch (error) {
      throw getErrorMessage(error);
    }
  };

  return {
    currentUser: currentUser.value,
    updateCurrentUser,
    saveCurrentUser,
  };
}
