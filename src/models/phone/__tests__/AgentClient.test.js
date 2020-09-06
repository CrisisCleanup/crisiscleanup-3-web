/**
 * Agent Client Tests
 */

import Vue from 'vue';
import Vuex from 'vuex';
import VuexORM, { Database } from '@vuex-orm/core';
import * as ACS from '@/services/connect.service';
import _ from 'lodash';
import WebsocketStore from '@/store/modules/websocket';
import StreamsStore from '@/store/modules/phone/streams';
import { getModule } from 'vuex-module-decorators';
import ControllerStore from '@/store/modules/phone/controller';
import AgentClient, { AgentStates, RouteStates } from '../AgentClient';
import Connection, { ConnectionStates } from '../Connection';
import Contact, {
  ContactActions,
  ContactAttributes,
  ContactStates,
} from '../Contact';

jest.mock('@/services/connect.service.js');

const RawContactAttrs = {
  [ContactAttributes.PDAS]: '1,2,3',
  [ContactAttributes.WORKSITES]: '0',
  [ContactAttributes.INCIDENT]: '500,',
  [ContactAttributes.OUTBOUND_IDS]: '0,2 , 3',
  [ContactAttributes.LOCALE]: 'en_US',
  [ContactAttributes.CALLBACK_NUMBER]: '+19999999999',
  [ContactAttributes.INBOUND_NUMBER]: '+19999999999',
  [ContactAttributes.CALLER_ID]: '+19999999999',
};

const mockAgentData = ({ agentId, routeState, state, ...rest } = {}) => ({
  agentId: agentId || '123',
  userId: 123,
  state: state || AgentStates.ONLINE,
  routeState: routeState || RouteStates.ROUTABLE,
  contacts: [],
  ...rest,
});

const mockContactData = ({ state, action } = {}) => ({
  contactId: 'contact-123',
  agentId: '123',
  state: state || ContactStates.QUEUED,
  action: action || ContactActions.ENTER,
});

describe('phone models', () => {
  let database;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();
    database = new Database();
    database.register(AgentClient, {});
    database.register(Connection, {});
    database.register(Contact, {});
    Vue.use(Vuex);

    // eslint-disable-next-line no-unused-vars
    mockStore = new Vuex.Store({
      plugins: [VuexORM.install(database)],
      modules: {
        websocket: WebsocketStore,
        'phone.streams': StreamsStore,
        'phone.controller': ControllerStore,
      },
    });
  });

  it('creates agent', async () => {
    await AgentClient.create({
      data: mockAgentData(),
    });
    const agent = await AgentClient.find('123');
    await expect(agent.$toJson()).toMatchInlineSnapshot(`
            Object {
              "agentId": "123",
              "connections": Array [],
              "contacts": Array [],
              "routeState": "routable",
              "state": "online",
              "userId": 123,
            }
          `);
  });

  it('add contact to agent client', async () => {
    await AgentClient.create({
      data: {
        agentId: '123',
        userId: 123,
        state: AgentStates.ONLINE,
        routeState: RouteStates.ROUTABLE,
        contacts: [],
      },
    });
    await Contact.insert({
      data: mockContactData(),
    });
    const agents = await AgentClient.query().withAllRecursive().all();
    await expect(agents).toMatchInlineSnapshot(`
            Array [
              AgentClient {
                "$id": "123",
                "agentId": "123",
                "connections": Array [
                  Connection {
                    "$id": "connection#contact-123",
                    "connectionId": "connection#contact-123",
                    "contactId": "contact-123",
                    "state": "pending",
                    "streamsConnectionId": "",
                  },
                ],
                "contacts": Array [
                  Contact {
                    "$id": "contact-123",
                    "action": "enter_ivr",
                    "agentId": "123",
                    "attributes": null,
                    "connection": Connection {
                      "$id": "connection#contact-123",
                      "connectionId": "connection#contact-123",
                      "contactId": "contact-123",
                      "state": "pending",
                      "streamsConnectionId": "",
                    },
                    "contactId": "contact-123",
                    "state": "queued",
                  },
                ],
                "routeState": "routable",
                "state": "online",
                "userId": 123,
              },
            ]
          `);
  });

  it('resolve contact state correctly', async () => {
    await AgentClient.create({
      data: {
        agentId: '123',
        userId: 123,
        state: AgentStates.ONLINE,
        routeState: RouteStates.ROUTABLE,
        contacts: [],
      },
    });
    const agent = AgentClient.find('123');
    // AGENT w/ NO Contact
    expect(agent.contactState).toBe(RouteStates.ROUTABLE);
  });

  it('resolve contact state with queued contact', async () => {
    await AgentClient.create({ data: mockAgentData() });
    await Contact.insert({
      data: mockContactData(),
    });
    const agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.contactState).toBe(ConnectionStates.AGENT_PENDING);
  });

  it('resolve contact state with routed contact', async () => {
    await AgentClient.create({ data: mockAgentData() });
    await Contact.insert({
      data: mockContactData({
        state: ContactStates.ROUTED,
      }),
    });
    const agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.contactState).toBe(ConnectionStates.PENDING_CALL);
  });

  it('should update connection when contact has been routed', async () => {
    ACS.getConnectionByContactId.mockReturnValueOnce({
      getConnectionId: () => 'verified_connection123',
    });
    await AgentClient.create({ data: mockAgentData() });
    await Contact.insert({ data: mockContactData() });
    let agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.connections[0]).toMatchInlineSnapshot(`
      Connection {
        "$id": "connection#contact-123",
        "connectionId": "connection#contact-123",
        "contactId": "contact-123",
        "state": "pending",
        "streamsConnectionId": "",
      }
    `);
    await Contact.update({
      where: 'contact-123',
      data: { state: ContactStates.ROUTED },
    });
    agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.connections.length).toBe(1);
    expect(agent.connections[0]).toMatchInlineSnapshot(`
      Connection {
        "$id": "connection#contact-123",
        "connectionId": "connection#contact-123",
        "contactId": "contact-123",
        "state": "PendingBusy",
        "streamsConnectionId": "verified_connection123",
      }
    `);
  });

  it('parse contact attributes correctly', () => {
    const attrs = _.mapValues(RawContactAttrs, (v) => ({ name: '', value: v }));
    expect(Contact.parseAttributes(attrs)).toMatchInlineSnapshot(`
      Object {
        "CALLBACK_NUMBER": "+19999999999",
        "INCIDENT_ID": Array [
          500,
        ],
        "InboundNumber": "+19999999999",
        "OUTBOUND_IDS": Array [
          0,
          2,
          3,
        ],
        "PDAS": Array [
          1,
          2,
          3,
        ],
        "USER_LANGUAGE": "en_US",
        "WORKSITES": Array [
          0,
        ],
        "callerID": "+19999999999",
      }
    `);
  });
  it('should parse raw and normal contact attributes correctly', async () => {
    const _attrs = _.mapValues(RawContactAttrs, (v) => ({
      name: '',
      value: v,
    }));
    const attrs = {
      ..._attrs,
      [ContactAttributes.LOCALE]: 'en_US',
      [ContactAttributes.WORKSITES]: '1,2,3',
    };
    expect(Contact.parseAttributes(attrs)).toMatchInlineSnapshot(`
      Object {
        "CALLBACK_NUMBER": "+19999999999",
        "INCIDENT_ID": Array [
          500,
        ],
        "InboundNumber": "+19999999999",
        "OUTBOUND_IDS": Array [
          0,
          2,
          3,
        ],
        "PDAS": Array [
          1,
          2,
          3,
        ],
        "USER_LANGUAGE": "en_US",
        "WORKSITES": Array [
          1,
          2,
          3,
        ],
        "callerID": "+19999999999",
      }
    `);
  });
  it('should return online/routable status correctly', async () => {
    await AgentClient.create({ data: mockAgentData() });
    let agent = await AgentClient.find('123');
    expect(agent.isOnline).toBe(true);
    expect(agent.isRoutable).toBe(true);
    await agent.$update({
      state: AgentStates.OFFLINE,
      routeState: RouteStates.NOT_ROUTABLE,
    });
    agent = await AgentClient.find('123');
    expect(agent.isOnline).toBe(false);
    expect(agent.isRoutable).toBe(false);
    expect(AgentClient.isStateOnline(ConnectionStates.BUSY)).toBe(
      AgentStates.ONLINE,
    );
  });
  it('should auto set routable state on state update', async () => {
    await AgentClient.create({ data: mockAgentData() });
    let agent = await AgentClient.find('123');
    await agent.$update({ state: AgentStates.OFFLINE });
    agent = await AgentClient.find('123');
    expect(agent.isRoutable).toBe(false);
  });
  it('should toggle online status correctly', async () => {
    await AgentClient.create({ data: mockAgentData() });
    const agent = await AgentClient.find('123');
    agent.toggleOnline();
    expect(ACS.setAgentState).toBeCalledWith(false);
    agent.toggleOnline(true);
    expect(ACS.setAgentState).toBeCalledWith(true);
  });
  it.skip('should create contact and connection correctly', async () => {
    const streamsStore = getModule(StreamsStore, mockStore);
    streamsStore.setConnected(true);
    streamsStore.setAgentId('123');
    ACS.getConnectionByContactId.mockClear();
    ACS.getConnectionByContactId.mockReturnValue(null);
    await AgentClient.create({ data: mockAgentData() });
    const attrs = _.mapValues(RawContactAttrs, (v) => ({ name: '', value: v }));
    await streamsStore.updateContact({
      contactId: 'contact-123',
      state: ContactStates.QUEUED,
      action: ContactActions.ENTER,
      attributes: attrs,
    });
    const agent = await AgentClient.query().withAllRecursive().find('123');
    expect(agent).toMatchInlineSnapshot(`
      AgentClient {
        "$id": "123",
        "agentId": "123",
        "connections": Array [
          Connection {
            "$id": "connection#contact-123",
            "connectionId": "connection#contact-123",
            "contactId": "contact-123",
            "state": "pending",
            "streamsConnectionId": "",
          },
        ],
        "contacts": Array [
          Contact {
            "$id": "contact-123",
            "action": "enter_ivr",
            "agentId": "123",
            "attributes": Object {
              "CALLBACK_NUMBER": Object {
                "name": "",
                "value": "+19999999999",
              },
              "INCIDENT_ID": Object {
                "name": "",
                "value": "500,",
              },
              "InboundNumber": Object {
                "name": "",
                "value": "+19999999999",
              },
              "USER_LANGUAGE": Object {
                "name": "",
                "value": "en_US",
              },
              "callerID": Object {
                "name": "",
                "value": "+19999999999",
              },
              "ids": Object {
                "name": "",
                "value": "0,2 , 3",
              },
              "pdas": Object {
                "name": "",
                "value": "1,2,3",
              },
              "worksites": Object {
                "name": "",
                "value": "0",
              },
            },
            "connection": Connection {
              "$id": "connection#contact-123",
              "connectionId": "connection#contact-123",
              "contactId": "contact-123",
              "state": "pending",
              "streamsConnectionId": "",
            },
            "contactId": "contact-123",
            "state": "queued",
          },
        ],
        "routeState": "not_routable",
        "state": "online",
        "userId": 123,
      }
    `);
    expect(agent.contactState).toBe(ConnectionStates.AGENT_PENDING);
    expect(agent.isConnecting).toBe(true);
    ACS.getConnectionByContactId.mockClear();
  });
  it.skip('should update existing connection through contact', async () => {
    const streamsStore = getModule(StreamsStore, mockStore);
    streamsStore.setConnected(true);
    streamsStore.setAgentId('123');
    await AgentClient.create({ data: mockAgentData() });
    ACS.getConnectionByContactId.mockClear();
    ACS.getConnectionByContactId.mockReturnValue(null);
    await streamsStore.updateContact({
      contactId: 'contact-123',
      state: ContactStates.QUEUED,
      action: ContactActions.ENTER,
    });
    ACS.getConnectionByContactId.mockReturnValue({
      getConnectionId: () => 'verified_connection123',
    });
    await streamsStore.updateContact({
      contactId: 'contact-123',
      state: ContactStates.ROUTED,
      action: ContactActions.CONNECTING,
    });
    const newAgent = await AgentClient.query().withAllRecursive().find('123');
    expect(newAgent).toMatchInlineSnapshot(`
      AgentClient {
        "$id": "123",
        "agentId": "123",
        "connections": Array [
          Connection {
            "$id": "connection#contact-123",
            "connectionId": "connection#contact-123",
            "contactId": "contact-123",
            "state": "PendingBusy",
            "streamsConnectionId": "verified_connection123",
          },
        ],
        "contacts": Array [
          Contact {
            "$id": "contact-123",
            "action": "connecting",
            "agentId": "123",
            "attributes": null,
            "connection": Connection {
              "$id": "connection#contact-123",
              "connectionId": "connection#contact-123",
              "contactId": "contact-123",
              "state": "PendingBusy",
              "streamsConnectionId": "verified_connection123",
            },
            "contactId": "contact-123",
            "state": "routed",
          },
        ],
        "routeState": "not_routable",
        "state": "online",
        "userId": 123,
      }
    `);
    expect(newAgent.contactState).toBe(ConnectionStates.PENDING_CALL);
    expect(newAgent.routeState).toBe(RouteStates.NOT_ROUTABLE);
  });
  it.skip('should update connection state based on contact action', async () => {
    const streamsStore = getModule(StreamsStore, mockStore);
    streamsStore.setConnected(true);
    streamsStore.setAgentId('123');
    await AgentClient.create({ data: mockAgentData() });
    ACS.getConnectionByContactId.mockClear();
    ACS.getConnectionByContactId.mockReturnValue(null);
    await streamsStore.updateContact({
      contactId: 'contact-123',
      state: ContactStates.QUEUED,
      action: ContactActions.ENTER,
    });
    ACS.getConnectionByContactId.mockReturnValue({
      getConnectionId: () => 'verified_connection123',
    });
    await streamsStore.updateContact({
      contactId: 'contact-123',
      state: ContactStates.ROUTED,
      action: ContactActions.CONNECTING,
    });
    await streamsStore.updateContact({
      contactId: 'contact-123',
      state: ContactStates.ROUTED,
      action: ContactActions.CONNECTED,
    });
    const newAgent = await AgentClient.query().withAllRecursive().find('123');
    expect(newAgent.connections[0]).toMatchInlineSnapshot(`
      Connection {
        "$id": "connection#contact-123",
        "connectionId": "connection#contact-123",
        "contactId": "contact-123",
        "state": "Busy",
        "streamsConnectionId": "verified_connection123",
      }
    `);
    expect(newAgent.contactState).toBe(ConnectionStates.BUSY);
  });
  it.skip('contact should auto resolve attributes if connect is ready', async () => {
    const streamsStore = getModule(StreamsStore, mockStore);
    streamsStore.setConnected(true);
    streamsStore.setAgentId('123');
    await AgentClient.create({ data: mockAgentData() });
    ACS.getConnectionByContactId.mockClear();
    ACS.getConnectionByContactId.mockReturnValue(null);
    ACS.getContactById.mockReturnValue({
      getAttributes: () =>
        _.mapValues(RawContactAttrs, (v) => ({ name: '', value: v })),
    });
    await streamsStore.updateContact({
      contactId: 'contact-123',
      state: ContactStates.QUEUED,
      action: ContactActions.ENTER,
    });
    await streamsStore.updateContact({
      contactId: 'contact-123',
      state: ContactStates.ROUTED,
      action: ContactActions.CONNECTED,
    });
    const agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.contacts[0].contactAttributes).toMatchInlineSnapshot(`
      Object {
        "CALLBACK_NUMBER": "+19999999999",
        "INCIDENT_ID": Array [
          500,
        ],
        "InboundNumber": "+19999999999",
        "USER_LANGUAGE": "en_US",
        "callerID": "+19999999999",
        "ids": Array [
          0,
          2,
          3,
        ],
        "pdas": Array [
          1,
          2,
          3,
        ],
        "worksites": Array [
          0,
        ],
      }
    `);
  });
  it.skip('contact should move agent out of ACW on deletion', async () => {
    ACS.getConnectionByContactId.mockReturnValue({
      getConnectionId: () => 'verified_connection123',
    });
    ACS.getContactById.mockReturnValue(null);
    await AgentClient.create({ data: mockAgentData() });
    await Contact.insert({
      data: mockContactData({
        state: ContactStates.ROUTED,
        action: ContactActions.ENDED, // ended contact, so agent should be in ACW.
      }),
    });
    let agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.contactState).toBe(ConnectionStates.PAUSED);
    await Contact.delete(agent.contacts[0].contactId);
    agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.contactState).toBe(RouteStates.ROUTABLE);
  });
  it.skip('should clear contact on early ACW exit.', async () => {
    const streamsStore = getModule(StreamsStore, mockStore);
    streamsStore.setConnected(true);
    streamsStore.setAgentId('123');
    ACS.getConnectionByContactId.mockReturnValue({
      getConnectionId: () => 'verified_connection123',
    });
    ACS.getContactById.mockReturnValue(null);
    await AgentClient.create({ data: mockAgentData() });
    await Contact.insert({
      data: mockContactData({
        state: ContactStates.ROUTED,
        action: ContactActions.ENDED, // ended contact, so agent should be in ACW.
      }),
    });
    let agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.contactState).toBe(ConnectionStates.PAUSED);
    await streamsStore.updateAgentClient({
      routeState: RouteStates.ROUTABLE,
    });
    agent = await AgentClient.query().withAllRecursive().first();
    expect(agent.contactState).toBe(RouteStates.ROUTABLE);
    expect(agent.contacts.length).toBe(0);
  });
});
