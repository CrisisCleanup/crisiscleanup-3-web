// @flow

/**
 * Phone ACS Streams Store
 */

import { VuexModule, Module, Action } from 'vuex-module-decorators';
import type { AuthState } from '@/store/modules/phone/types';
import type { ACSAgentEvent } from '@/services/types';
import * as ACS from '@/services/connect.service';

export const AuthStates = Object.freeze({
  FAIL: 'unauthenticated',
  SUCCESS: 'authenticated',
  IN_PROGRESS: 'in_progress',
});

@Module({
  name: 'streams',
  persist: false,
  namespaced: true,
})
class StreamsStore extends VuexModule {
  // streams socket connection status
  connected: boolean = false;

  // streams authentication status
  authed: AuthState = AuthStates.FAIL;

  @Action
  async init() {
    ACS.bindEvents<ACSAgentEvent>(ACS.EventTopics.AGENT, {
      [ACS.AgentEvents.ON_ROUTABLE]: () => {
        // TODO
      },
    });
  }
}

export default StreamsStore;
