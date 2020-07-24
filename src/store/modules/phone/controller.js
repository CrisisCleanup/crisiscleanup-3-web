// @flow

/**
 * Phone Controller Store
 */

import {
  VuexModule,
  Action,
  Module,
  MutationAction,
  getModule,
} from 'vuex-module-decorators';
import type { CaseType, ViewStateT } from '@/store/modules/phone/types';
import store from '@/store';
import Logger from '@/utils/log';
import StreamsStore from '@/store/modules/phone/streams';

/**
 * Enum of possible controller pages.
 * @property DASHBOARD - Dashboard page (Standby).
 * @property CONTROLLER - Controller page (Active call).
 * @readonly
 * @enum {string}
 */
export const ControllerPages = Object.freeze({
  DASHBOARD: 'dashboard',
  CONTROLLER: 'controller',
});

/**
 * Enum of possible controller action tabs.
 * @property RESOURCES - Resource tab view.
 * @property CASE - Case form tab view.
 * @readonly
 * @enum {string}
 */
export const ControllerActionTabs = Object.freeze({
  CASE: 'case',
  RESOURCES: 'resources',
});

const Log = Logger({ name: 'phone.controller' });

@Module({
  store,
  dynamic: true,
  name: 'phone.controller',
  persist: true,
  namespaced: true,
})
class ControllerStore extends VuexModule {
  // active case
  currentCase: CaseType | null = null;

  // user interface state
  view: ViewStateT = {
    page: ControllerPages.DASHBOARD,
    actionTab: ControllerActionTabs.CASE,
  };

  @MutationAction({ mutate: ['view'] })
  setView(newView: $Shape<ViewStateT>) {
    this.view = { ...this.view, ...newView };
  }

  @MutationAction({ mutate: ['currentCase'] })
  setCase(newCase: $Shape<CaseType>) {
    Log.debug('updating active case:', newCase);
    if (this.currentCase === null) {
      this.currentCase = newCase;
    } else {
      this.currentCase = { ...this.currentCase, ...newCase };
    }
  }

  @Action
  async init() {
    Log.debug('init controller!');
    const streamsStore = getModule(StreamsStore, this.$store);
    if (!streamsStore.connected) {
      const htmlEl = document.getElementById('ccp-embed');
      await streamsStore.init(htmlEl);
    }
  }
}

export default ControllerStore;
