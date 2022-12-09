import User from '../models/User';
import { store } from '../store';
import { getErrorMessage } from '../utils/errors';

export default function useCurrentUser() {
  const currentUser = User.find(store.getters['auth/userId']);
  const updateCurrentUser = (value: any, key: string) => {
    return User.update({
      where: currentUser?.id,
      data: {
        [key]: value,
      },
    });
  };
  const saveCurrentUser = async () => {
    try {
      await User.api().patch(`/users/${currentUser?.id}`, {
        ...currentUser?.$toJson(),
        preferences: currentUser?.preferences,
        states: currentUser?.states,
      });
    } catch (error) {
      throw getErrorMessage(error);
    }
  };

  return {
    currentUser,
    updateCurrentUser,
    saveCurrentUser,
  };
}
