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
import Contact from '@/models/phone/Contact';
import Connection, { ConnectionStates } from '@/models/phone/Connection';
import _ from 'lodash';
import { getModule } from 'vuex-module-decorators';
import Logger from '@/utils/log';
import * as ACS from '@/services/connect.service';
import WebsocketStore, { ACTIONS } from '@/store/modules/websocket';
import User from '@/models/User';

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
    }: AgentClientType);
  }

  static afterUpdate(model: AgentClient): void {
    Log.info('publishing agent client state update!');
    const client: AgentClient = AgentClient.query()
      .where('agentId', model.agentId)
      .first();
    if (!model.isOnline && model.isRoutable) {
      client
        .$update({ routeState: RouteStates.NOT_ROUTABLE })
        .then(() =>
          Log.info('client went offline, forcing not_routable route state'),
        );
    }
    const wsStore = getModule(WebsocketStore, AgentClient.store());
    wsStore
      .send({
        action: ACTIONS.SET_AGENT_STATE,
        data: {
          agentId: client.agentId,
          agentState: client.contactState,
        },
      })
      .then(() => Log.debug('agent state pushed'));
    client
      .heartbeat()
      .then(() => Log.debug('client heartbeat triggered by update'));
  }

  static isStateOnline(state: AgentState): AgentState {
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
    if (!_.isEmpty(this.connections)) {
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

  get isOnline(): boolean {
    return AgentClient.isStateOnline(this.state) === AgentStates.ONLINE;
  }

  get user(): User {
    return User.query().whereId(this.userId).first();
  }

  toggleOnline(connected?: boolean): void {
    if (typeof connected === 'boolean') {
      return ACS.setAgentState(connected);
    }
    return ACS.setAgentState(!this.isOnline);
  }

  async heartbeat() {
    Log.info('pushing client heartbeat');
    const wsStore = getModule(WebsocketStore, AgentClient.store());
    await wsStore.send({
      action: ACTIONS.CLIENT_HEARTBEAT,
      data: {
        userId: this.userId,
        type: this.user.isAdmin ? 'admin' : 'user',
        agentId: this.agentId,
      },
    });
  }
}
