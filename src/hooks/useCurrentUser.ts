import User from '../models/User';
import { store } from '../store';

export default function useCurrentUser() {
  const currentUser = User.find(store.getters['auth/userId']);

  return {
    currentUser,
  };
}
