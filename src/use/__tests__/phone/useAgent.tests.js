/**
 * Use Agent Hook Tests
 */

import { createLocalVue } from '@vue/test-utils';
import VueCompositionApi from '@vue/composition-api';
import { useGetters } from '@u3u/vue-hooks';
import AgentClient from '@/models/phone/AgentClient';
import useAgent from '@/use/phone/useAgent';
import VuexORM, { Database } from '@vuex-orm/core';
import Vuex from 'vuex';

// jest.mock('@/models/phone/AgentClient');
jest.mock('@u3u/vue-hooks');

const database = new Database();
database.register(AgentClient, {});

const localVue = createLocalVue();
localVue.use(VueCompositionApi);
localVue.use(Vuex);

// eslint-disable-next-line no-unused-vars
const mockStore = new Vuex.Store({
  plugins: [VuexORM.install(database)],
});

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
    AgentClient.query = jest.fn();
    AgentClient.query.mockReturnValue({
      withAllRecursive: () => ({
        first: firstMock,
      }),
    });
    useGetters.mockReturnValue({
      agentClientId: {
        value: null,
      },
    });
    firstMock.mockReturnValue({ agentId: 'abc' });

    const { agent, loading } = useAgent();
    useGetters.mockReturnValue({
      agentClientId: {
        value: 'abc',
      },
    });
    console.log(agent);
    expect(agent.value.agentId).toBe('abc');
    expect(loading.value).toBe(false);
  });
});
