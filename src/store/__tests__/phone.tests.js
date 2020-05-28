/**
 * phone.tests.js
 * Phone Store Tests
 */

import Agent from '@/models/Agent';
import { MockAgents, MockUsers } from '@/utils/testing';
import { actions } from '../modules/phone';

jest.mock('@/services/acs.service.js');
jest.mock('@/services/sso.service.js');

jest.mock('@/models/Worksite');
jest.mock('@/models/Incident');
jest.mock('@/models/User');
jest.mock('@/models/PhoneStatus');
jest.mock('@/models/Agent');

const MockMetrics = ({ queueCount = 2, online = 1 } = {}) => [
  {
    name: 'AGENTS_AVAILABLE',
    type: 'realtime',
    value: String(online),
  },
  {
    name: 'AGENTS_ONLINE',
    type: 'realtime',
    value: String(online),
  },
  {
    name: 'AGENTS_ON_CALL',
    type: 'realtime',
    value: '1',
  },
  {
    name: 'CONTACTS_IN_QUEUE',
    type: 'realtime',
    value: String(queueCount),
  },
  {
    name: 'CONTACTS_IN_QUEUE_OUTBOUND',
    type: 'realtime',
    value: '0',
  },
];

describe('metric actions', () => {
  it('getRealtimeMetrics', async () => {
    const commit = jest.fn();
    const state = {};

    const metricsIn = MockMetrics();
    await actions.getRealtimeMetrics({ commit, state }, { metrics: metricsIn });
    await actions.getRealtimeMetrics(
      { commit, state },
      { metrics: MockMetrics({ queueCount: 12 }) },
    );
    await actions.getRealtimeMetrics(
      { commit, state },
      { metrics: MockMetrics({ queueCount: 35, online: 0 }) },
    );
    await actions.getRealtimeMetrics(
      { commit, state },
      { metrics: MockMetrics({ queueCount: 35, online: 1 }) },
    );
    await actions.getRealtimeMetrics(
      { commit, state },
      { metrics: MockMetrics({ queueCount: -1, online: 1 }) },
    );

    expect(commit).toMatchSnapshot();
  });

  it('getAgentMetrics', async () => {
    const commit = jest.fn();
    const state = {
      controller: {
        history: {
          resolvedCases: [],
        },
      },
      contact: {
        attributes: {
          incidentId: 99,
        },
      },
    };

    const inboundMetrics = [
      {
        agent: 'xxxx',
        state: 'routable',
        user: MockUsers[0],
        total_calls: 6,
        total_inbound: 3,
        total_outbound: 3,
        total_rejects: 0,
        total_abandons: 0,
      },
      {
        agent: 'yyyy',
        state: 'routable',
        user: MockUsers[1],
        total_calls: 6,
        total_inbound: 3,
        total_outbound: 3,
        total_rejects: 0,
        total_abandons: 0,
        recent_contacts: [
          {
            caller_name: 'Adam Smith',
            dnis: 0,
            phone_number: '+11234567890',
            completed_at: '2019-12-31T06:00:00.000Z',
            cases: [1, 2],
            notes: 'metric note',
            status: 1,
          },
        ],
      },
    ];

    Agent.api = jest.fn(() => ({
      get: jest.fn(() => MockAgents[0]),
      getMetrics: jest.fn((id) =>
        inboundMetrics.find(({ agent }) => agent === id),
      ),
    }));

    const aniIncident = jest.fn();
    aniIncident.id = 99;

    await actions.getAgentMetrics(
      { commit, state, getters: { currentAniIncident: () => aniIncident } },
      {
        agents: [
          {
            agent_id: 'xxxx',
            state: 'routable',
            entered_timestamp: '2019-12-31T06:00:00.000Z',
          },
          {
            agent_id: 'yyyy',
            state: 'routable',
            entered_timestamp: '2019-12-31T06:00:00.000Z',
          },
        ],
      },
    );
    expect(commit.mock.calls).toMatchSnapshot();
  });
});
