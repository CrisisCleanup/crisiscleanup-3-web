/**
 * phone.tests.js
 * Phone Store Tests
 */

import { actions } from '../modules/phone';

jest.mock('@/services/acs.service.js');
jest.mock('@/services/sso.service.js');

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

describe('actions', () => {
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

    expect(commit).toMatchSnapshot();
  });
});
