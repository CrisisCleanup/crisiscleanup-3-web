// @flow

/**
 * AgentClient model
 */

import { Model } from '@vuex-orm/core';
import type {
  AgentClientType,
  AgentState,
  ConnectionState,
  ConnectionType,
  RouteState,
} from '@/models/phone/types';
import Contact, { ContactActions } from '@/models/phone/Contact';
import Connection, { ConnectionStates } from '@/models/phone/Connection';
import _ from 'lodash';
import Logger from '@/utils/log';
import * as ACS from '@/services/connect.service';
import { ACTIONS } from '@/store/modules/websocket';
import User from '@/models/User';
import Language from '@/models/Language';

/**
 * Enum of states that represent whether a client is currently
 * actively connected via websocket or not.
 * (if they they online or offline)
 * @param ONLINE - Is online.
 * @param OFFLINE - Is offline.
 * @readonly
 * @enum {string}
 */
export const AgentStates = Object.freeze({
  ONLINE: 'online',
  OFFLINE: 'offline',
});

/**
 * Enum of states representing a singular agent's eligibility
 * to receive an inbound/outbound contact.
 * @readonly
 * @enum {string}
 */
export const RouteStates = Object.freeze({
  ROUTABLE: 'routable',
  NOT_ROUTABLE: 'not_routable',
});

const Log = Logger({ name: 'phone.agent' });

export default class AgentClient extends Model {
  static entity = 'phone/agent';

  static primaryKey = 'agentId';

  static fields() {
    return ({
      userId: this.number(),
      agentId: this.string(),
      state: this.string(),
      routeState: this.string(),
      contacts: this.hasMany(Contact, 'agentId'),
      connections: this.hasManyThrough(
        Connection,
        Contact,
        'agentId',
        'contactId',
      ),
      localeIds: this.attr([]),
      locale: this.hasManyBy(Language, 'localeIds'),
    }: AgentClientType);
  }

  static beforeCreate(model: AgentClient): void {
    const user = User.find(model.userId);
    if (user) {
      model.localeIds = user.languages.map((l) => l.id);
    }
  }

  static beforeUpdate(model: AgentClient): void {
    const user = User.find(model.userId);
    if (user) {
      model.localeIds = user.languages.map((l) => l.id);
    }
    const contactQ = Contact.query()
      .withAllRecursive()
      .where('agentId', model.agentId);
    if (contactQ.exists()) {
      const contact = contactQ.get();
      if (contact && contact.connection) {
        model.routeState = AgentClient.isStateRoutable(
          contact.connection.state,
        );
      }
    }
  }

  static afterUpdate(model: AgentClient): void {
    Log.info('publishing agent client state update!');
    const client: AgentClient = AgentClient.query()
      .withAllRecursive()
      .where('agentId', model.agentId)
      .first();
    if (!model.isOnline && model.isRoutable) {
      client
        .$update({ routeState: RouteStates.NOT_ROUTABLE })
        .then(() =>
          Log.info('client went offline, forcing not_routable route state'),
        );
    }
    Log.info(`Agent => ${client.contactState}`);
    Log.info(client);
    const payload = {
      agentId: client.agentId,
      state: client.state,
      routeState: client.routeState,
      contactState: client.contactState,
      locale: client.localeMap,
    };
    const isInbound =
      client.currentContact === null ? true : client.currentContact.isInbound;
    if (
      !isInbound ||
      ![ConnectionStates.AGENT_PENDING].includes(client.contactState)
    ) {
      AgentClient.store()
        .dispatch('websocket/send', {
          action: ACTIONS.SET_AGENT_STATE,
          data: payload,
        })
        .then(() => Log.debug('agent state pushed'));
    }
    client
      .heartbeat()
      .then(() => Log.debug('client heartbeat triggered by update'));
  }

  static isStateOnline(state: AgentState): AgentState {
    if (Object.values(ConnectionStates).includes(state)) {
      return AgentStates.ONLINE;
    }
    return [AgentStates.ONLINE, RouteStates.ROUTABLE].includes(state)
      ? AgentStates.ONLINE
      : AgentStates.OFFLINE;
  }

  static isStateRoutable(state: ConnectionState | RouteState): RouteState {
    if (Object.values(RouteStates).includes(state)) {
      return state;
    }
    return !Object.values(ConnectionStates).includes(state)
      ? RouteStates.ROUTABLE
      : RouteStates.NOT_ROUTABLE;
  }

  static friendlyStateMap = {
    [RouteStates.ROUTABLE]: 'online',
    [ConnectionStates.PENDING_CALL]: 'connecting',
    [ConnectionStates.AGENT_CALLING]: 'connecting',
    [ConnectionStates.PAUSED]: 'paused',
    [ConnectionStates.BUSY]: 'talking',
    [ConnectionStates.AGENT_PENDING]: 'connecting',
  };

  static getFriendlyState(
    state: AgentState | RouteState | ConnectionState,
  ): string {
    let contactState = state;
    if (state.includes('#')) {
      [, , contactState] = state.split('#');
    }
    return _.get(AgentClient.friendlyStateMap, contactState, 'offline');
  }

  get contactState(): ConnectionState | RouteState {
    if (
      !_.isEmpty(this.connections) &&
      !_.isNil(this.currentContact) &&
      _.get(this.currentContact, 'action', null) !== ContactActions.DESTROYED
    ) {
      const initConnection: ConnectionType = this.connections[0];
      return initConnection.state;
    }
    return this.routeState;
  }

  get friendlyState(): string {
    return _.get(AgentClient.friendlyStateMap, this.contactState, 'offline');
  }

  get isRoutable(): boolean {
    if (Object.values(RouteStates).includes(this.contactState)) {
      return this.contactState === RouteStates.ROUTABLE;
    }
    return (
      AgentClient.isStateRoutable(this.contactState) === RouteStates.ROUTABLE
    );
  }

  get isConnecting(): boolean {
    return [
      ConnectionStates.AGENT_PENDING,
      ConnectionStates.PENDING_CALL,
    ].includes(this.contactState);
  }

  get isConnected(): boolean {
    return [ConnectionStates.BUSY].includes(this.contactState);
  }

  get isOnline(): boolean {
    return AgentClient.isStateOnline(this.state) === AgentStates.ONLINE;
  }

  get user(): User {
    return User.query().whereId(this.userId).first();
  }

  get currentContact(): Contact | null {
    const contact = Contact.query().where('agentId', this.agentId);
    if (!contact.exists()) return null;
    return contact.first();
  }

  get localeMap(): string {
    return this.locale ? this.locale.map((l) => l.subtag).join('#') : '';
  }

  get fullState(): string {
    return [this.state, this.routeState, this.contactState].join('#');
  }

  get acwDuration(): number {
    if (this.contactState !== ConnectionStates.PAUSED) {
      return 0;
    }
    if (this.currentContact) {
      const conConnection = ACS.getConnectionByContactId(
        this.currentContact.contactId,
      );
      if (conConnection) {
        return conConnection.getStateDuration();
      }
    }
    return 0;
  }

  toggleOnline(connected?: boolean): void | boolean {
    if (this.contactState === ConnectionStates.PAUSED && this.currentContact) {
      Contact.delete(this.currentContact.contactId).then(() =>
        Log.info('Agent exiting ACW!'),
      );
      return this.isOnline;
    }
    if (typeof connected === 'boolean') {
      return ACS.setAgentState(connected);
    }
    return ACS.setAgentState(!this.isOnline);
  }

  async heartbeat() {
    Log.info('pushing client heartbeat');
    await AgentClient.store().dispatch('websocket/send', {
      action: ACTIONS.CLIENT_HEARTBEAT,
      data: {
        userId: this.userId,
        type: this.user.isAdmin ? 'admin' : 'user',
        agentId: this.agentId,
      },
    });
  }
}
