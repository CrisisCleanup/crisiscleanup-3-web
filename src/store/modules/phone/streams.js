// @flow

/**
 * Phone ACS Streams Store
 */

import { VuexModule, Mutation, Module, Action } from 'vuex-module-decorators';
import type { AuthState } from '@/store/modules/phone/types';
import * as ACS from '@/services/connect.service';
import Logger from '@/utils/log';
import * as SSO from '@/services/sso.service';
import type { ACSAgentEvent, ACSCoreEvent } from '@/services/types';
import store from '@/store';

/**
 * Enum of different Connect authentication states.
 * @type {*|{IN_PROGRESS: string, SUCCESS: string, FAIL: string}}
 */
export const AuthStates = Object.freeze({
  FAIL: 'unauthenticated',
  SUCCESS: 'authenticated',
  IN_PROGRESS: 'in_progress',
  ERROR: 'error',
});

const Log = Logger({ name: 'phone.streams' });

@Module({
  store,
  name: 'phone/streams',
  persist: false,
  namespaced: true,
  dynamic: true,
})
class StreamsStore extends VuexModule {
  // streams socket connection status
  connected: boolean = false;

  // streams authentication status
  authed: AuthState = AuthStates.FAIL;

  @Mutation
  setConnected(isConnected: boolean) {
    this.connected = isConnected;
  }

  @Mutation
  setAuthed(authState: AuthState) {
    this.authed = authState;
  }

  @Action
  async init({ element }: { element: HTMLElement }) {
    Log.info('Initializing ACS streams store!');
    const ssoPortalUrl: string = await SSO.authenticate(
      this.context.rootGetters['auth/userToken'],
    );
    ACS.initConnect({
      htmlEl: element,
      config: { loginUrl: ssoPortalUrl },
    });
    // Bind core events
    ACS.bindEvents<ACSCoreEvent>(ACS.EventTopics.CORE, {
      [ACS.CoreEvents.ON_AUTH_FAIL]: () => {
        Log.warn('Connect authentication failed!');
        this.context.commit('setAuthed', AuthStates.FAIL);
      },
    });
    // Bind agent events
    ACS.bindEvents<ACSAgentEvent>(ACS.EventTopics.AGENT, {
      [ACS.AgentEvents.ON_CONNECTION_GAINED]: () => {
        Log.info('ACS successfully connected!');
        this.setConnected(true);
      },
      [ACS.AgentEvents.ON_CONNECTION_LOST]: () => {
        Log.warn('ACS lost connection!');
        this.setConnected(false);
      },
    });
  }
}

export default StreamsStore;
