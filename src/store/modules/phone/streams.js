// @flow

/**
 * Phone ACS Streams Store
 */

import _ from 'lodash';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import {
  Action,
  config,
  Module,
  Mutation,
  VuexModule,
} from 'vuex-module-decorators';
import type { AuthState, InboundAction } from '@/store/modules/phone/types';
import * as ACS from '@/services/connect.service';
import Logger from '@/utils/log';
import * as SSO from '@/services/sso.service';
import type {
  ACSAgentEvent,
  ACSContactEvent,
  ACSCoreEvent,
} from '@/services/types';
import type {
  AgentClientType,
  AgentState,
  ContactType,
  RouteState,
} from '@/models/phone/types';
import AgentClient, {
  AgentStates,
  RouteStates,
} from '@/models/phone/AgentClient';
import Agent from '@/models/Agent';
import { ContactActions, ContactStates } from '@/models/phone/Contact';

config.rawError = true;

/**
 * Enum of different Connect authentication states.
 * @readonly
 * @enum {string}
 */
export const AuthStates = Object.freeze({
  FAIL: 'unauthenticated',
  SUCCESS: 'authenticated',
  IN_PROGRESS: 'in_progress',
  ERROR: 'error',
});

/**
 * Enum of different actions for handling inbounds.
 * @readonly
 * @enum {string}
 */
export const InboundActions = Object.freeze({
  VERIFY: 'verify',
  SKIP: 'skip',
});

const Log = Logger({ name: 'phone.streams' });

@Module({
  name: 'phone.streams',
  persist: false,
  namespaced: true,
  dynamic: false,
})
class StreamsStore extends VuexModule {
  // streams socket connection status
  connected: boolean = false;

  // heartbeat timestamp
  lastHeartbeatRecv: number | null = null;

  // heartbeat timestamp sent
  lastHeartbeatSent: number | null = null;

  // streams authentication status
  authed: AuthState = AuthStates.FAIL;

  // agent id
  agentId: string | null = null;

  // next inbound action
  nextInboundAction: InboundAction = InboundActions.VERIFY;

  get agentClientId(): string | null {
    return this.agentId ? this.agentId : null;
  }

  @Mutation
  setConnected(isConnected: boolean) {
    this.connected = isConnected;
  }

  @Mutation
  setAuthed(authState: AuthState) {
    this.authed = authState;
  }

  @Mutation
  setAgentId(agentId: string) {
    this.agentId = agentId;
  }

  @Mutation
  setNextInboundAction(nextAction: InboundAction) {
    this.nextInboundAction = nextAction;
  }

  @Mutation
  setBeatTimestamps({ recv, sent } = {}) {
    if (recv) {
      this.lastHeartbeatRecv = recv;
    }
    if (sent) {
      this.lastHeartbeatSent = sent;
    }
  }

  @Action
  setHeartbeatTime() {
    const sentAt = Date.now();
    let connection = this.connected;
    if (typeof this.lastHeartbeatRecv === 'number') {
      const threshold = 60; // 1 minute
      const elapsed = (this.lastHeartbeatRecv - sentAt) / 1000;
      if (elapsed >= threshold) {
        // we expect a heartbeat every 30s
        // if we have not recv one in over a minute
        // something is wrong.
        Log.error('heartbeat missed!');
        connection = false;
      }
    }
    this.setConnected(connection);
    this.setBeatTimestamps({
      sent: sentAt,
    });
  }

  @Action
  async receivePong() {
    Log.debug('Pong!');
    this.setConnected(true);
    this.setBeatTimestamps({
      recv: Date.now(),
    });
  }

  @Action
  async updateAgentConfig({ phone_number }) {
    const number = parsePhoneNumberFromString(String(phone_number), 'US');
    if (!number) {
      const client = AgentClient.find(this.context.getters.agentClientId);
      if (client) {
        // set new locale if it changed.
        AgentClient.afterUpdate(client);
      }
      return null;
    }
    const conAgent = new connect.Agent();
    const agentConfig = conAgent.getConfiguration();
    agentConfig.extension = number.format('E.164');
    conAgent.setConfiguration(agentConfig, {
      success: () => {
        Log.info('successfully updated connect extension!');
        const client = AgentClient.find(this.context.getters.agentClientId);
        if (client) {
          // set new locale if it changed.
          AgentClient.afterUpdate(client);
        }
      },
      failure: (err) => {
        Log.error('failed to update connect extension!', err);
        throw new Error(err);
      },
    });
    return number;
  }

  @Action
  async createClient(agentInstance?: connect.Agent) {
    const agent = agentInstance || new connect.Agent();
    if (!agent) {
      Log.info('no agent found! failed to create client!');
      this.setConnected(false);
    }
    const agentState =
      agent.getState().type === 'system'
        ? agent.getState().name
        : agent.getState().type;
    const isOnline: AgentState = AgentClient.isStateOnline(agentState);

    const agentAvail = agent.getState().name;
    const isRoutable: RouteState =
      isOnline === AgentStates.ONLINE
        ? AgentClient.isStateRoutable(agentAvail)
        : RouteStates.NOT_ROUTABLE;

    const { agent_id: agentId } = Agent.query().first();
    const agentClient: AgentClientType = {
      agentId,
      userId: this.context.rootGetters['auth/userId'],
      state: isOnline,
      routeState: isRoutable,
      contacts: [],
      connections: [],
      localeIds: [],
    };
    Log.debug('Creating new agent client: ', agentClient);
    await AgentClient.create({ data: agentClient });
    this.context.commit('setAgentId', agentId);
    await this.updateAgentClient({ state: isOnline, routeState: isRoutable });
  }

  @Action
  async updateAgentClient(newData: $Shape<AgentClientType>) {
    Log.debug('agent client update:', newData);
    await AgentClient.update({
      where: this.context.getters.agentClientId,
      data: newData,
    });
  }

  /**
   * Creates or updates a contact item.
   * This endpoint is invoked over websocket
   * via the CCU AWSConnect api.
   * @param newData
   * @returns {Promise<void>}
   */
  @Action
  async updateContact(newData: $Shape<ContactType>) {
    Log.debug('contact update:', newData);
    const { contactId } = newData;
    newData.contactId = null;
    const agent = await AgentClient.query()
      .withAllRecursive()
      .find(this.agentClientId);
    if (_.isNil(newData.contactId)) {
      if (_.isNil(agent) || _.isNil(agent.currentContact)) {
        const conAgent = new connect.Agent();
        if (!conAgent) {
          Log.info(
            'tried to update contact w/o any agents! retrying in 3 seconds...',
          );
          return _.delay(() => this.updateContact(newData), 3000);
        }
        const contact = _.first(conAgent.getContacts());
        if (contact) {
          Log.info('Got contact from connect!');
          newData.contactId = contact.getContactId();
        }
        if (!contact && contactId) {
          Log.info('no connect contacts found! using provided id!');
          newData.contactId = contactId;
        }
      } else if (!_.isEmpty(agent.contacts)) {
        newData.contactId = agent.contacts[0].contactId;
        Log.info('had to auto resolve contact id!');
      } else {
        if (contactId) {
          Log.info('no connect contacts found! using provided id!');
          newData.contactId = contactId;
        }
        Log.info('could not resolve contact id! trying again in 3 seconds...');
        return _.delay(() => this.updateContact(newData), 3000);
      }
    }
    await AgentClient.update({
      data: {
        agentId: this.agentClientId,
        contacts: [newData],
      },
      insertOrUpdate: ['phone/contact'],
    });
    return newData;
  }

  /**
   * Begins an outbound call from the current agent.
   * @param phoneNumber - number to dial.
   * @returns {Promise<void>}
   */
  @Action
  async connectEndpoint({ phoneNumber }: { phoneNumber: string }) {
    Log.info(`Dialing phone number: ${phoneNumber}`);
    ACS.connectEndpoint(phoneNumber);
  }

  @Action
  async init({ element }: { element: HTMLElement }) {
    Log.info('Initializing ACS streams store!');
    const ssoPortalUrl: string = await SSO.authenticate(
      this.context.rootGetters['auth/userToken'],
    );
    if (connect.core.initialized) {
      Log.warn('connect already initialized!');
      if (this.connected) {
        Log.info('skipping event rebind, already connected!');
        return;
      }
      const ccpEmbed = document.getElementById('ccp-embed');
      if (ccpEmbed && ccpEmbed.childElementCount >= 1) {
        Log.warn('existing connect embeds detected! removing...');
        _.map(ccpEmbed.children, (c) => c.remove());
      }
    }
    try {
      ACS.initConnect({
        htmlEl: element,
        config: { loginUrl: ssoPortalUrl },
      });
    } catch (e) {
      Log.error(e);
    }
    // Bind core events
    ACS.bindEvents<ACSCoreEvent>(ACS.EventTopics.CORE, {
      [ACS.CoreEvents.ON_AUTH_FAIL]: () => {
        Log.warn('Connect authentication failed!');
        this.context.commit('setAuthed', AuthStates.FAIL);
      },
    });
    // Bind agent events
    connect.agent((agent) => {
      Log.info('ACS got agent!');
      Log.debug(agent);
      this.createClient(agent)
        .then(() => {
          this.context.commit('setConnected', true);
          this.context.commit('setAuthed', AuthStates.SUCCESS);
        })
        .catch((e) => Log.error(e));
    });
    ACS.bindEvents<ACSAgentEvent>(ACS.EventTopics.AGENT, {
      [ACS.AgentEvents.ON_CONNECTION_GAINED]: () => {
        Log.info('ACS successfully connected!');
      },
      [ACS.AgentEvents.ON_CONNECTION_LOST]: () => {
        Log.warn('ACS lost connection!');
        this.context.commit('setConnected', false);
        this.context.commit('setAuthed', AuthStates.SUCCESS);
      },
      [ACS.AgentEvents.ON_ROUTABLE]: () => {
        this.updateAgentClient({
          state: AgentStates.ONLINE,
          routeState: RouteStates.ROUTABLE,
        }).then(() => {
          Log.info('Agent Client => ROUTABLE');
        });
      },
      [ACS.AgentEvents.ON_NOT_ROUTABLE]: () => {
        this.updateAgentClient({ routeState: RouteStates.NOT_ROUTABLE }).then(
          () => {
            Log.info('Agent Client => NOT_ROUTABLE');
          },
        );
      },
      [ACS.AgentEvents.ON_OFFLINE]: () => {
        this.updateAgentClient({
          routeState: RouteStates.NOT_ROUTABLE,
          state: AgentStates.OFFLINE,
        }).then(() => {
          Log.info('Agent Client => OFFLINE');
        });
      },
      [ACS.AgentEvents.ON_ACW]: () => {
        this.updateAgentClient({
          routeState: RouteStates.NOT_ROUTABLE,
          state: AgentStates.ONLINE,
        }).then(() => {
          Log.info('Agent Client => ACW');
        });
      },
      [ACS.AgentEvents.ON_ERROR]: (agent: connect.Agent) => {
        agent.getContacts().forEach((c) =>
          c.clear({
            success: () => Log.info('successfully cleared agent contact!'),
            failure: () => Log.info('failed to clear agent contact!'),
          }),
        );
        this.updateAgentClient({
          routeState: RouteStates.NOT_ROUTABLE,
          state: AgentStates.OFFLINE,
        }).then(() =>
          Log.error('agent error! Cleared contacts and placed agent offline!'),
        );
      },
    });
    // Bind Contact Events
    ACS.bindEvents<ACSContactEvent>(ACS.EventTopics.CONTACT, {
      [ACS.ContactEvents.ON_PENDING]: () => {
        this.updateContact({
          state: ContactStates.ROUTED,
          action: ContactActions.ENTER,
        }).then(() => {
          Log.info('Contact => PENDING');
        });
      },
      [ACS.ContactEvents.ON_CONNECTING]: () => {
        this.updateContact({
          action: ContactActions.CONNECTING,
          state: ContactStates.ROUTED,
        }).then(() => {
          Log.info('Contact => CONNECTING');
        });
      },
      [ACS.ContactEvents.ON_CONNECTED]: (contact: connect.Contact) => {
        const payload = {
          action: ContactActions.CONNECTING,
          state: ContactStates.ROUTED,
        };
        if (this.agentClientId === null) {
          _.delay(
            (data) =>
              this.updateContact(data).then(() =>
                Log.info('Contact => CONNECTED'),
              ),
            3000,
            {
              action: ContactActions.CONNECTED,
              state: ContactStates.ROUTED,
            },
          );
        } else {
          this.updateContact(payload).then(() => {
            Log.info('Contact => CONNECTED');
            const voiceConn: connect.VoiceConnection =
              ACS.getConnectionByContactId(contact.contactId);
            if (voiceConn) {
              if (voiceConn.getType() === 'inbound') {
                if (this.nextInboundAction === InboundActions.SKIP) {
                  this.updateContact({
                    action: ContactActions.MISSED,
                    state: ContactStates.ROUTED,
                  }).then(() => {
                    this.updateAgentClient({
                      routeState: RouteStates.NOT_ROUTABLE,
                      state: AgentStates.OFFLINE,
                    }).then(() => {
                      Log.info('contact successfully skipped!');
                    });
                  });
                } else {
                  Log.info('inbound connection connected!');
                  this.updateContact({
                    action: ContactActions.CONNECTED,
                    state: ContactStates.ROUTED,
                  });
                }
              } else if (voiceConn.getType() === 'outbound') {
                Log.info('outbound connection connected!');
                this.updateContact({
                  action: ContactActions.CONNECTED,
                  state: ContactStates.ROUTED,
                });
              }
            }
          });
        }
      },
      [ACS.ContactEvents.ON_ENDED]: () => {
        this.updateContact({
          action: ContactActions.ENDED,
          state: ContactStates.ROUTED,
        }).then(() => {
          Log.info('Contact => ENDED');
        });
      },
      [ACS.ContactEvents.ON_DESTROY]: () => {
        this.updateContact({
          action: ContactActions.DESTROYED,
          state: ContactStates.ROUTED,
        }).then(() => {
          Log.info('Contact => DESTROYED');
        });
      },
      [ACS.ContactEvents.ON_ACW]: () => {
        const payload = {
          action: ContactActions.ENDED,
          state: ContactStates.ROUTED,
        };
        if (!this.agentClientId) {
          _.delay(
            (data) =>
              this.updateContact(data).then(() =>
                Log.info('Contact => ON_ACW'),
              ),
            3000,
            payload,
          );
        } else {
          this.updateContact(payload).then(() => Log.info('Contact => ON_ACW'));
        }
      },
      [ACS.ContactEvents.ON_MISSED]: () => {
        this.updateContact({
          action: ContactActions.MISSED,
        }).then(() => Log.info('Contact => MISSED'));
      },
      [ACS.ContactEvents.ON_INCOMING]: (contact: connect.Contact) => {
        contact.accept();
      },
      [ACS.ContactEvents.ON_REFRESH]: (contact: connect.Contact) => {
        const transferCon = contact.getSingleActiveThirdPartyConnection();
        if (transferCon) {
          Log.info('found transfer connection for contact!', transferCon);
          const initCon = contact.getInitialConnection();
          if (!initCon.isOnHold()) {
            Log.info(
              'Initial connection no longer on hold! ending transfer connection!',
            );
            transferCon.destroy({
              success: () => {
                this.updateContact({
                  action: ContactActions.CONNECTED,
                  state: ContactStates.ROUTED,
                }).then(() => {
                  Log.info('Contact => CONNECTED');
                });
                Log.info('successfully destroyed transfer con!');
              },
              failure: () => Log.error('failed to end transfer conf!'),
            });
          }
        }
      },
    });
  }
}

export default StreamsStore;
