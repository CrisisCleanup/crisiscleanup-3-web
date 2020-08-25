/**
 * Use Agent Hook Tests
 */

import { createLocalVue } from '@vue/test-utils';
import VueCompositionApi from '@vue/composition-api';
import { useGetters } from '@u3u/vue-hooks';
import AgentClient from '@/models/phone/AgentClient';
import useAgent from '@/use/phone/useAgent';

jest.mock('@/models/phone/AgentClient');
jest.mock('@u3u/vue-hooks');

const localVue = createLocalVue();
localVue.use(VueCompositionApi);

describe('useAgent', () => {
  it('loads until ready', () => {
    useGetters.mockReturnValue({
      agentClientId: {
        value: null,
      },
    });
    const { loading } = useAgent();
    expect(loading.value).toBe(true);
  });

  it('retrieves agent when ready', () => {
    const firstMock = jest.fn();
    AgentClient.query().first = firstMock;
    useGetters.mockReturnValue({
      agentClientId: {
        value: null,
      },
    });

    const { agent } = useAgent();
    useGetters.mockReturnValue({
      agentClientId: {
        value: 'abc',
      },
    });
    firstMock.mockReturnValue({ agentId: 'abc' });
    expect(agent.value.agentId).toBe('abc');
  });
});
