/**
 * Use Agent Hook Tests
 */

import { createLocalVue } from '@vue/test-utils';
import VuexORM, { Database } from '@vuex-orm/core';
import Vuex, { mapGetters } from 'vuex';
import AgentClient from '@/models/phone/AgentClient';
import useAgent from '@/use/phone/useAgent';

// jest.mock('@/models/phone/AgentClient');
jest.mock('vuex');

const database = new Database();
database.register(AgentClient, {});

const localVue = createLocalVue();
localVue.use(Vuex);

// eslint-disable-next-line no-unused-vars
const mockStore = new Vuex.Store({
  plugins: [VuexORM.install(database)],
});

describe('useAgent', () => {
  it('loads until ready', () => {
    mapGetters.mockReturnValue({
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
    mapGetters.mockReturnValue({
      agentClientId: {
        value: null,
      },
    });
    firstMock.mockReturnValue({ agentId: 'abc' });

    const { agent, loading } = useAgent();
    mapGetters.mockReturnValue({
      agentClientId: {
        value: 'abc',
      },
    });
    console.log(agent);
    expect(agent.value.agentId).toBe('abc');
    expect(loading.value).toBe(false);
  });
});
