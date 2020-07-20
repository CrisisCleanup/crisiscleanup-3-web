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

import { initAuthGateway } from '@/services/connect.service';

/**
 * Enum of possible controller pages.
 * @param DASHBOARD - Dashboard page (Standby).
 * @param CONTROLLER - Controller page (Active call).
 * @readonly
 * @enum {string}
 * @type {*|{CONTROLLER: string, DASHBOARD: string}}
 */
export const ControllerPages = Object.freeze({
  DASHBOARD: 'dashboard',
  CONTROLLER: 'controller',
});

/**
 * Enum of possible controller action tabs.
 * @param RESOURCES - Resource tab view.
 * @param CASE - Case form tab view.
 * @readonly
 * @enum {string}
 * @type {any | {RESOURCES: string, CASE: string}}
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
    if (this.currentCase === null) {
      this.currentCase = newCase;
    } else {
      this.currentCase = { ...this.currentCase, ...newCase };
    }
  }

  @Action
  async init() {
    const streamsStore = getModule(StreamsStore, this.$store);
    if (!streamsStore.connected) {
      const htmlEl = document.getElementById('ccp-embed');
      await streamsStore.init(htmlEl);
    }
  }
}

export default ControllerStore;
