/**
 * Use User Hook Tests
 */

import { createLocalVue } from '@vue/test-utils';
import VueCompositionApi from '@vue/composition-api';
import useUser from '@/use/user/useUser';
import { useGetters } from '@u3u/vue-hooks';

jest.mock('@/models/User');
jest.mock('@u3u/vue-hooks');

const localVue = createLocalVue();
localVue.use(VueCompositionApi);

describe('useUser', () => {
  it('retrieves current user', () => {
    useGetters.mockReturnValue({
      userId: {
        value: 1,
      },
    });
    const { currentUser } = useUser();
    expect(currentUser.value.id).toBe(1);
  });
});
