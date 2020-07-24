// @flow

/**
 * Websocket Store
 */

import { Module, MutationAction, VuexModule } from 'vuex-module-decorators';
import Logger from '@/utils/log';
import _ from 'lodash';

const Log = Logger({ name: 'WS' });

/**
 * Actions that are defined in the WS Api that can be invoked
 * by this client.
 * @prop CLIENT_HEARTBEAT - Client Heartbeat endpoint.
 * @prop SET_AGENT_STATE - Update agent state endpoint.
 * @enum {string}
 * @readonly
 */
export const ACTIONS = {
  CLIENT_HEARTBEAT: 'CLIENT_HEARTBEAT',
  SET_AGENT_STATE: 'SET_AGENT_STATE',
};

type SocketAction = $Keys<typeof ACTIONS>;

type SocketActionOptions = {|
  includeMeta: boolean,
|};

type SocketPayload = {|
  action: SocketAction,
  options: SocketActionOptions,
  data: any,
|};

@Module({
  name: 'websocket',
  persist: false,
  namespaced: true,
})
class WebsocketStore extends VuexModule {
  // Connection status
  connected: boolean = false;

  // Snapshot of the most recent payload sent.
  lastSent: SocketPayload | null = null;

  get isConnected(): boolean {
    return this.connected;
  }

  @MutationAction({ mutate: ['connected'] })
  async setConnected(isConnected: boolean) {
    return { connected: isConnected };
  }

  /**
   * Publish a message upstream to the websocket api
   * via a channel determined by the provided action.
   * @param action - action to invoke.
   * @param data - payload to provide.
   * @param options - configuration options.
   * @returns {Promise<{lastSent: SocketPayload}>}
   */
  @MutationAction({ mutate: ['lastSent'] })
  async send({
    action,
    data,
    options,
  }: {
    action: SocketAction,
    data: {},
    options?: SocketActionOptions,
  }) {
    const payload: SocketPayload = {
      action,
      data: _.omitBy(data, _.isNil),
      options: (_.defaultTo((options: any), {
        includeMeta: true,
      }): SocketActionOptions),
    };
    Log.debug('SEND:', payload);
    await window.vue.$socket.sendObj(payload);
    return { lastSent: payload };
  }
}

export default WebsocketStore;
