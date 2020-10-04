/**
 * Phone Controller Store Tests
 */

import { getModule } from 'vuex-module-decorators';
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import ControllerStore, { Metrics } from '@/store/modules/phone/controller';

const localVue = createLocalVue();
localVue.use(Vuex);

const mockStore = new Vuex.Store({
  modules: {
    'phone.controller': ControllerStore,
  },
});

const MockMetrics = ({ queueCount = 2, online = 1, locale = 'en-US' } = {}) => [
  {
    name: `AGENTS_AVAILABLE#${locale}`,
    type: 'realtime',
    value: String(online),
  },
  {
    name: `AGENTS_ONLINE#${locale}`,
    type: 'realtime',
    value: String(online),
  },
  {
    name: `AGENTS_ON_CALL#${locale}`,
    type: 'realtime',
    value: '1',
  },
  {
    name: `CONTACTS_IN_QUEUE#${locale}`,
    type: 'realtime',
    value: String(queueCount),
  },
  {
    name: `CONTACTS_IN_QUEUE_OUTBOUND#${locale}`,
    type: 'realtime',
    value: '0',
  },
];

describe('phone.controller store', () => {
  it('updateMetrics', async () => {
    const ctrlStore = getModule(ControllerStore, mockStore);

    const metricsIn = MockMetrics();
    await ctrlStore.updateMetrics({ metrics: metricsIn });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "en-US": Object {
          "agentsAvailable": 0,
          "agentsNeeded": 0,
          "agentsOnCall": 0,
          "agentsOnline": 0,
          "contactsInQueue": 0,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 0,
        },
      }
    `);
    await ctrlStore.updateMetrics({ metrics: MockMetrics({ queueCount: 12 }) });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "en-US": Object {
          "agentsAvailable": 1,
          "agentsNeeded": 0,
          "agentsOnCall": 1,
          "agentsOnline": 1,
          "contactsInQueue": 12,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 12,
        },
      }
    `);

    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 35, online: 0 }),
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "en-US": Object {
          "agentsAvailable": 0,
          "agentsNeeded": 3,
          "agentsOnCall": 1,
          "agentsOnline": 0,
          "contactsInQueue": 35,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 35,
        },
      }
    `);

    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 35, online: 1 }),
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "en-US": Object {
          "agentsAvailable": 1,
          "agentsNeeded": 2,
          "agentsOnCall": 1,
          "agentsOnline": 1,
          "contactsInQueue": 35,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 35,
        },
      }
    `);

    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: -1, online: 1 }),
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "en-US": Object {
          "agentsAvailable": 1,
          "agentsNeeded": 0,
          "agentsOnCall": 1,
          "agentsOnline": 1,
          "contactsInQueue": 0,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 0,
        },
      }
    `);
    await ctrlStore.updateMetrics({
      metrics: [
        ...MockMetrics({ queueCount: 1, online: 2 }),
        ...MockMetrics({ queueCount: 3, online: 4, locale: 'es-MX' }),
      ],
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "en-US": Object {
          "agentsAvailable": 2,
          "agentsNeeded": 0,
          "agentsOnCall": 1,
          "agentsOnline": 2,
          "contactsInQueue": 1,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 1,
        },
        "es-MX": Object {
          "agentsAvailable": 0,
          "agentsNeeded": 0,
          "agentsOnCall": 0,
          "agentsOnline": 0,
          "contactsInQueue": 0,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 0,
        },
      }
    `);
  });

  it('updateMetrics is additive to current state', async () => {
    const ctrlStore = getModule(ControllerStore, mockStore);
    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 1, online: 1 }),
    });
    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 2, online: 1, locale: 'es-MX' }),
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "en-US": Object {
          "agentsAvailable": 1,
          "agentsNeeded": 0,
          "agentsOnCall": 1,
          "agentsOnline": 1,
          "contactsInQueue": 1,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 1,
        },
        "es-MX": Object {
          "agentsAvailable": 1,
          "agentsNeeded": 0,
          "agentsOnCall": 1,
          "agentsOnline": 1,
          "contactsInQueue": 2,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 2,
        },
      }
    `);
  });

  it('updateMetrics supports partial updates', async () => {
    const ctrlStore = getModule(ControllerStore, mockStore);
    await ctrlStore.updateMetrics({
      metrics: [
        ...MockMetrics({ queueCount: 0, online: 1 }),
        ...MockMetrics({ queueCount: 12, online: 1, locale: 'es-MX' }),
      ],
    });

    await ctrlStore.updateMetrics({
      metrics: [
        {
          name: 'AGENTS_ONLINE#en-US',
          type: 'realtime',
          value: 10,
        },
      ],
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "en-US": Object {
          "agentsAvailable": 1,
          "agentsNeeded": 0,
          "agentsOnCall": 1,
          "agentsOnline": 10,
          "contactsInQueue": 0,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 0,
        },
        "es-MX": Object {
          "agentsAvailable": 1,
          "agentsNeeded": 0,
          "agentsOnCall": 1,
          "agentsOnline": 1,
          "contactsInQueue": 12,
          "contactsInQueueOutbound": 0,
          "contactsInQueueOutboundAll": 0,
          "contactsScheduledOutboundAll": 0,
          "totalWaiting": 12,
        },
      }
    `);
  });

  it('calculates agents needed over 3 day span', async () => {
    const ctrlStore = getModule(ControllerStore, mockStore);
    // no historic metrics yet should default to avg of 1
    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 1600, online: 3 }),
    });
    expect(ctrlStore.metrics['en-US']).toMatchInlineSnapshot(`
      Object {
        "agentsAvailable": 3,
        "agentsNeeded": 44,
        "agentsOnCall": 1,
        "agentsOnline": 3,
        "contactsInQueue": 1600,
        "contactsInQueueOutbound": 0,
        "contactsInQueueOutboundAll": 0,
        "contactsScheduledOutboundAll": 0,
        "totalWaiting": 1600,
      }
    `);
    await ctrlStore.setHistoricMetrics({ aggregates: { outbound__avg: 11 } });
    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 1600, online: 1 }),
    });
    expect(ctrlStore.metrics['en-US'].agentsNeeded).toMatchInlineSnapshot(
      `133`,
    );
    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 1600, online: 5 }),
    });
    expect(ctrlStore.metrics['en-US'].agentsNeeded).toMatchInlineSnapshot(`26`);
    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 1600, online: 10 }),
    });
    expect(ctrlStore.metrics['en-US'].agentsNeeded).toMatchInlineSnapshot(`13`);
    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 1600, online: 40 }),
    });
    expect(ctrlStore.metrics['en-US'].agentsNeeded).toMatchInlineSnapshot(`3`);
  });

  it('getGeneralMetrics', async () => {
    const ctrlStore = getModule(ControllerStore, mockStore);
    await ctrlStore.updateMetrics({
      metrics: [
        ...MockMetrics({ queueCount: -1, online: 1 }),
        ...MockMetrics({ queueCount: 12, online: 1, locale: 'es-MX' }),
      ],
    });

    const metricOrder = [
      Metrics.CONTACTS_QUEUED,
      Metrics.CALLBACKS_QUEUED,
      Metrics.TOTAL_WAITING,
      Metrics.ONLINE,
      Metrics.ONLINE,
      Metrics.AGENTS_ON_CALL,
      Metrics.NEEDED,
    ];

    // should default to ALL
    expect(ctrlStore.getGeneralMetrics(metricOrder)).toMatchInlineSnapshot(`
      Map {
        "phoneDashboard.on_hold_now" => 0,
        "phoneDashboard.remaining_callbacks" => 0,
        "phoneDashboard.total_people_waiting" => 0,
        "phoneDashboard.volunteers_online" => 0,
        "phoneDashboard.volunteers_on_phone" => 0,
        "phoneDashboard.additional_volunteers_needed" => 0,
      }
    `);
    // should scope to given locale
    expect(ctrlStore.getGeneralMetrics(metricOrder, 'en-US'))
      .toMatchInlineSnapshot(`
      Map {
        "phoneDashboard.on_hold_now" => 0,
        "phoneDashboard.remaining_callbacks" => 0,
        "phoneDashboard.total_people_waiting" => 0,
        "phoneDashboard.volunteers_online" => 1,
        "phoneDashboard.volunteers_on_phone" => 1,
        "phoneDashboard.additional_volunteers_needed" => 0,
      }
    `);
  });
});
