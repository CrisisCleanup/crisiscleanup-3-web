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

/**
 * Enum of states that represent whether a client is currently
 * actively connected via websocket or not.
 * (if they they online or offline)
 * @type {{ONLINE: string, OFFLINE: string}|*}
 */
export const AgentStates = Object.freeze({
  ONLINE: 'online',
  OFFLINE: 'offline',
});

/**
 * Enum of states representing a singular agent's eligibility
 * to receive an inbound/outbound contact.
 * @type {{ROUTABLE: string, NOT_ROUTABLE: string}|*}
 */
export const RouteStates = Object.freeze({
  ROUTABLE: 'routable',
  NOT_ROUTABLE: 'not_routable',
});

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

  static isStateOnline(state: AgentState): AgentState {
    return [AgentStates.ONLINE, RouteStates.ROUTABLE].includes(state)
      ? AgentStates.ONLINE
      : AgentStates.OFFLINE;
  }

  static isStateRoutable(state: ConnectionState): RouteState {
    return !Object.keys(ConnectionStates).includes(state)
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
}
