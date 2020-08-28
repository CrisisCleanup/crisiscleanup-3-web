// @flow

/**
 * Phone ACS Streams Store
 */

import _ from 'lodash';
import {
  Action,
  config,
  Module,
  Mutation,
  VuexModule,
} from 'vuex-module-decorators';
import type { AuthState } from '@/store/modules/phone/types';
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

  // streams authentication status
  authed: AuthState = AuthStates.FAIL;

  // agent id
  agentId: string | null = null;

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

  @Action
  async createClient(agentInstance?: connect.Agent) {
    const agent = agentInstance || new connect.Agent();
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

    const {
      routingProfile: { queues },
    } = agent.getConfiguration();
    const agentQueue = queues.find((q) => q.queueId.includes('agent'));
    const agentId: string = agentQueue.queueId.split('agent/').pop();
    const agentClient: AgentClientType = {
      agentId,
      userId: this.context.rootGetters['auth/userId'],
      state: isOnline,
      routeState: isRoutable,
      contacts: [],
      connections: [],
    };
    Log.debug('Creating new agent client: ', agentClient);
    await AgentClient.create({ data: agentClient });
    this.context.commit('setAgentId', agentId);
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
    if (_.isNil(newData.contactId)) {
      const agent = await AgentClient.query()
        .withAllRecursive()
        .find(this.agentClientId);
      if (!_.isEmpty(agent.contacts)) {
        newData.contactId = agent.contacts[0].contactId;
        Log.info('had to auto resolve contact id!');
      }
    }
    await AgentClient.update({
      data: {
        agentId: this.agentClientId,
        contacts: [newData],
      },
      insertOrUpdate: ['phone/contact'],
    });
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
      [ACS.AgentEvents.ON_ERROR]: () => {
        Log.error('connect agent error!');
      },
    });
    // Bind Contact Events
    ACS.bindEvents<ACSContactEvent>(ACS.EventTopics.CONTACT, {
      [ACS.ContactEvents.ON_PENDING]: () => {
        this.updateContact({
          state: ContactStates.ROUTED,
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
      [ACS.ContactEvents.ON_CONNECTED]: () => {
        this.updateContact({
          action: ContactActions.CONNECTED,
          state: ContactStates.ROUTED,
        }).then(() => {
          Log.info('Contact => CONNECTED');
        });
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
        Log.info('Contact => ON_ACW');
      },
    });
  }
}

export default StreamsStore;
