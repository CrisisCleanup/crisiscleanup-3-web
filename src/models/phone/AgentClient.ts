/**
 * AgentClient model
 */

import { InstanceOf, Item, Model } from '@vuex-orm/core';
import _ from 'lodash';
import * as Sentry from '@sentry/browser';
import Contact, { ContactActions } from '@/models/phone/Contact';
import Connection, { ConnectionStates } from '@/models/phone/Connection';
import Logger from '@/utils/log';
import * as ACS from '@/services/connect.service';
import User from '@/models/User';
import Language from '@/models/Language';

const ACTIONS = {
  CLIENT_HEARTBEAT: 'CLIENT_HEARTBEAT',
  SET_AGENT_STATE: 'SET_AGENT_STATE',
};

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
  static entity: string = 'phone/agent';

  static primaryKey: string = 'agentId';

  userId!: string | number;

  agentId!: string;

  state!: string;

  routeState!: string;

  contacts!: Contact[];

  connections!: Connection[];

  localeIds!: any[];

  locale!: Language[];

  static fields() {
    return {
      userId: this.number(0),
      agentId: this.string('0'),
      state: this.string(''),
      routeState: this.string(''),
      contacts: this.hasMany(Contact, 'agentId'),
      connections: this.hasManyThrough(
        Connection,
        Contact,
        'agentId',
        'contactId',
      ),
      localeIds: this.attr([]),
      locale: this.hasManyBy(Language, 'localeIds'),
    };
  }

  static beforeCreate(model: AgentClient): void {
    const user = User.find(model.userId);
    if (user) {
      model.localeIds = user.languages.map((l) => l?.id);
    }
  }

  static beforeUpdate(model: AgentClient): void {
    const user = User.find(model.userId);
    if (user) {
      model.localeIds = user.languages.map((l) => l?.id);
    }
    const contactQ: Item<InstanceOf<Contact>> = Contact.query()
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
    const client = AgentClient.query()
      .withAllRecursive()
      .where('agentId', model.agentId)
      .first();
    if (client && !model.isOnline && model.isRoutable) {
      client
        .$update({ routeState: RouteStates.NOT_ROUTABLE })
        .then(() =>
          Log.info('client went offline, forcing not_routable route state'),
        );
    }
    Log.info(`Agent => ${client?.contactState}`);
    Log.info(client);
    let curContactId: string | null = null;
    if (client?.currentContact) {
      curContactId = client.currentContact.connectContactId
        ? client.currentContact.connectContactId
        : client.currentContact.contactId;
    }
    const payload = {
      agentId: client?.agentId,
      state: client?.state,
      routeState: client?.routeState,
      contactState: client?.contactState,
      locale: client?.localeMap,
      currentContactId: curContactId,
    };
    const isInbound =
      client?.currentContact === null ? true : client?.currentContact.isInbound;
    if (
      !isInbound ||
      ![ConnectionStates.AGENT_PENDING].includes(client?.contactState || '')
    ) {
      AgentClient.store()
        .dispatch('websocket/send', {
          action: ACTIONS.SET_AGENT_STATE,
          data: payload,
        })
        .then(() => Log.debug('agent state pushed'));
    }
    if (client) {
      client
        .heartbeat()
        .then(() => Log.debug('client heartbeat triggered by update'));
    }
    Sentry.setContext(
      AgentClient.entity,
      client?.$toJson() as Record<any, any>,
    );
  }

  static isStateOnline(state) {
    if (Object.values(ConnectionStates).includes(state)) {
      return AgentStates.ONLINE;
    }
    return [AgentStates.ONLINE, RouteStates.ROUTABLE].includes(state)
      ? AgentStates.ONLINE
      : AgentStates.OFFLINE;
  }

  static isStateRoutable(state) {
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

  static getFriendlyState(state): string {
    let contactState = state;
    if (state.includes('#')) {
      [, , contactState] = state.split('#');
    }
    return _.get(AgentClient.friendlyStateMap, contactState, 'offline');
  }

  get contactState(): string {
    if (
      !_.isEmpty(this.connections) &&
      !_.isNil(this.currentContact) &&
      _.get(this.currentContact, 'action', null) !== ContactActions.DESTROYED
    ) {
      const initConnection = this.connections[0];
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
      ConnectionStates.AGENT_CALLING,
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

  get user() {
    return User.query().whereId(this.userId).first();
  }

  get currentContact(): Contact | null {
    const contact = Contact.query().where('agentId', this.agentId);
    if (!contact.exists()) return null;
    return contact.last();
  }

  get localeMap(): string {
    return this.locale ? this.locale.map((l) => l.subtag).join('#') : '';
  }

  get fullState(): string {
    return [this.state, this.routeState, this.contactState].join('#');
  }

  getAcwDuration(): number {
    if (this.contactState !== ConnectionStates.PAUSED) {
      return 0;
    }
    const conAgent = new connect.Agent();
    if (conAgent) {
      return conAgent.getStateDuration();
    }
    return 0;
  }

  get connectConfig(): connect.AgentConfiguration | null {
    const conAgent = new connect.Agent();
    if (conAgent) {
      return conAgent.getConfiguration();
    }
    return null;
  }

  /**
   * Ensure requested state is reached by retrying.
   * @param newState - target state.
   * @param retries - max num of times to retry.
   * @private
   */
  _ensureState(newState: boolean, retries: number = 80) {
    const reAttempt = (agent, targState, retry, maxRetry) => {
      Log.info(
        `Retrying agent state: (${retry}/${maxRetry}) [${
          agent().isOnline
        } -> ${targState}] `,
      );
      ACS.setAgentState(targState);
      if (targState !== agent().isOnline && retry < maxRetry) {
        return _.delay(reAttempt, 250, agent, newState, retry + 1, maxRetry);
      }
      return targState;
    };
    ACS.setAgentState(newState);
    reAttempt(() => AgentClient.query().first(), newState, 0, retries);
  }

  toggleOnline(
    connected?: boolean,
    userInitiated: boolean = false,
  ): void | boolean {
    if (this.contactState === ConnectionStates.PAUSED && this.currentContact) {
      Contact.delete(this.currentContact.contactId).then(() => {
        Log.info('Agent exiting ACW!');
        this._ensureState(userInitiated);
      });
      return this._ensureState(userInitiated);
    }
    if (typeof connected === 'boolean') {
      Log.debug(`Setting agent state: ${connected}`);
      return this._ensureState(connected);
    }
    Log.debug(`Toggling agent state: ${!this.isOnline}`);
    return this._ensureState(!this.isOnline);
  }

  async heartbeat() {
    Log.info('Ping!');
    await AgentClient.store().dispatch('websocket/send', {
      action: ACTIONS.CLIENT_HEARTBEAT,
      data: {
        userId: this.userId,
        type: this.user?.isAdmin ? 'admin' : 'user',
        agentId: this.agentId,
      },
    });
    await AgentClient.store().dispatch('phone.streams/setHeartbeatTime');
    if (this.currentContact) {
      if (!this.currentContact.isReady) {
        Contact.syncAttributes(this.currentContact.contactId, null);
      }
    }
  }
}
