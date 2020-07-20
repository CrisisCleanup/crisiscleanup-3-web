/**
 * Agent Client Tests
 */

import Vue from 'vue';
import Vuex from 'vuex';
import VuexORM, { Database } from '@vuex-orm/core';
import * as ACS from '@/services/connect.service';
import AgentClient, { AgentStates, RouteStates } from '../AgentClient';
import Connection, { ConnectionStates } from '../Connection';
import Contact, { ContactActions, ContactStates } from '../Contact';

jest.mock('@/services/connect.service.js');

const database = new Database();
database.register(AgentClient, {});
database.register(Connection, {});
database.register(Contact, {});
Vue.use(Vuex);

// eslint-disable-next-line no-unused-vars
const mockStore = new Vuex.Store({
  plugins: [VuexORM.install(database)],
});

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
});
