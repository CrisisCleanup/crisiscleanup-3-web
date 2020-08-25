/**
 * Streams Store Tests
 */

import { getModule } from 'vuex-module-decorators';
import StreamsStore from '@/store/modules/phone/streams';
import AgentClient, {
  AgentStates,
  RouteStates,
} from '@/models/phone/AgentClient';
import Vuex from 'vuex';
import Vue from 'vue';
import * as ACS from '@/services/connect.service';

jest.mock('@/models/User');
jest.mock('@/models/phone/AgentClient');
jest.mock('@crisiscleanup/amazon-connect-streams');
jest.mock('@/services/sso.service');

Vue.use(Vuex);

const mockStore = new Vuex.Store({
  modules: {
    'phone.streams': StreamsStore,
  },
});

const mockAgentEventData = ({ type, name } = {}) => {
  const getState = jest.fn();
  const getConfiguration = jest.fn();
  getState.mockReturnValue({
    type: type || 'offline',
    name: name || 'name',
  });
  getConfiguration.mockReturnValueOnce({
    routingProfile: { queues: [{ queueId: 'fakearn://abc/123/agent/123' }] },
  });
  return {
    getState,
    getConfiguration,
  };
};

describe('phone/streams store', () => {
  it('creates client successfully', async () => {
    const createSpy = jest.spyOn(AgentClient, 'create');
    AgentClient.isStateOnline.mockReturnValue(AgentStates.OFFLINE);
    AgentClient.isStateRoutable.mockReturnValue(RouteStates.NOT_ROUTABLE);
    const store = getModule(StreamsStore, mockStore);
    await store.createClient(mockAgentEventData());
    expect(createSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "data": Object {
              "agentId": "123",
              "connections": Array [],
              "contacts": Array [],
              "routeState": "not_routable",
              "state": "offline",
              "userId": undefined,
            },
          },
        ],
      ]
    `);
  });

  it('recreates client without reinit connect', async () => {
    const connectInitSpy = jest.spyOn(ACS, 'initConnect');
    AgentClient.isStateOnline.mockReturnValue(AgentStates.OFFLINE);
    AgentClient.isStateRoutable.mockReturnValue(RouteStates.NOT_ROUTABLE);
    global.connect.core.initialized = true;
    const store = getModule(StreamsStore, mockStore);
    await store.setConnected(true);
    await store.init({});
    expect(connectInitSpy).not.toBeCalled();
  });
});
