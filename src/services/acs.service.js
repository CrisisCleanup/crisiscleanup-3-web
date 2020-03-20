/**
 * acs.service.js
 * Amazon Connect Streams Service
 *
 */

import VueLog from '@dreipol/vue-log';
import Vue from 'vue';

Vue.use(VueLog, {
  name: 'acs.service',
  middlewares: [
    result => {
      result.unshift('[ACS] ');
      return result;
    },
  ],
});
const Log = Vue.log();

export const ConnectConfig = {
  ccpUrl: process.env.VUE_APP_AWS_CCP_URL,
  region: process.env.VUE_APP_AWS_CCP_REGION,
  allowFramedSoftphone: false,
  loginPopup: false,
};

export const initConnect = ({ htmlEl, config, onAuth, onTerminate }) => {
  // Bind and initialize connect
  const finalConf = { ...ConnectConfig, ...config };
  Log.info('initializing ACS service with config:');
  Log.info(finalConf);
  connect.core.initCCP(htmlEl, finalConf);
  connect.core.initSoftphoneManager();
  const eventBus = connect.core.getEventBus();
  if (onAuth) {
    eventBus.subscribe(connect.EventType.INIT, () => {
      // Bind handler to auth event
      Log.info(`got authentication event [handler: ${onAuth}]`);
      return onAuth();
    });
  }
  if (onTerminate) {
    // Bind handler to session terminiation
    Log.info('session has terminated!');
    eventBus.subscribe(connect.EventType.TERMINATED, onTerminate);
  }
};

export const initAgent = ({ onRefresh }) => {
  Log.info('waiting on agent... ');
  connect.agent(agent => {
    Log.info('agent initialized!');
    agent.onRefresh(onRefresh);
    Log.info('trying to get agent config...');
    const agentStates = agent.getConfiguration();
    Log.info(agentStates);
  });
};

export const setPopup = ({ open } = { open: true }) => {
  const loginUrl = `https://cchotline.awsapps.com/auth?client_id=06919f4fd8ed324e&redirect_uri=${global.encodeURIComponent(
    'https://cchotline.awsapps.com/connect/auth/code',
  )}`;
  if (!open) {
    // clear state (kept in localStorage)
    Log.debug('closing popup manager...');
    connect.core.getPopupManager().clear(connect.MasterTopics.LOGIN_POPUP);
    return connect.core.getPopManager().close();
  }
  return connect.core
    .getPopupManager()
    .open(loginUrl, connect.MasterTopics.LOGIN_POPUP);
};
