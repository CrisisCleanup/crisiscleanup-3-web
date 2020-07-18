// @flow

/**
 * websocket.js
 * WebSocket Store
 */

import { Module, MutationAction, VuexModule } from 'vuex-module-decorators';
import Logger from '@/utils/log';
import _ from 'lodash';

const Log = Logger({ name: 'WS' });

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
  connected: boolean = false;

  lastSent: SocketPayload | null = null;

  get isConnected(): boolean {
    return this.connected;
  }

  @MutationAction({ mutate: ['connected'] })
  async setConnected(isConnected: boolean) {
    return { connected: isConnected };
  }

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
      options: _.defaultTo(options, { includeMeta: true }),
    };
    Log.debug('SEND:', payload);
    await window.vue.$socket.sendObj(payload);
    return { lastSent: payload };
  }
}

export default WebsocketStore;
