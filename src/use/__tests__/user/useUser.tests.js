/**
 * Use User Hook Tests
 */

import { mapGetters } from 'vuex';
import useUser from '@/use/user/useUser';

jest.mock('@/models/User');
jest.mock('vuex');

describe('useUser', () => {
  it('retrieves current user', () => {
    mapGetters.mockReturnValue({
      userId: {
        value: 1,
      },
    });
    const { currentUser } = useUser();
    expect(currentUser.value.id).toBe(1);
  });
});
