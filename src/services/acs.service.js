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
  loginUrl: `${process.env.VUE_APP_BASE_URL}/sp/acs`,
};

export const initConnect = ({
  htmlEl,
  config,
  onAuth,
  onTerminate,
  onTimeout,
}) => {
  // Bind and initialize connect
  const finalConf = { ...ConnectConfig, ...config };
  Log.debug('initializing ACS service with config:');
  Log.debug(finalConf);
  connect.core.initCCP(htmlEl, finalConf);
  connect.core.initSoftphoneManager({ allowFramedSoftphone: true });
  const eventBus = connect.core.getEventBus();
  const upstream = connect.core.getUpstream();
  if (onAuth) {
    const handleOnAuth = e => {
      Log.debug(`got authentication event: ${e}`);
      return onAuth();
    };
    eventBus.subscribe(connect.EventType.INIT, () =>
      handleOnAuth(connect.EventType.INIT),
    );
    eventBus.subscribe(connect.EventType.ACKNOWLEDGE, () =>
      handleOnAuth(connect.EventType.ACKNOWLEDGE),
    );
    eventBus.subscribe(connect.AgentEvents.INIT, () =>
      handleOnAuth(connect.AgentEvents.INIT),
    );
    upstream.onUpstream(connect.EventType.ACKNOWLEDGE, () =>
      handleOnAuth(connect.EventType.ACKNOWLEDGE),
    );
  }
  if (onTerminate) {
    // Bind handler to session terminiation
    eventBus.subscribe(connect.EventType.TERMINATED, () => {
      Log.info('session has terminated!');
      return onTerminate();
    });
  }
  if (onTimeout) {
    // Bind handler to ACK timeout (need login refresh)
    eventBus.subscribe(connect.EventType.ACK_TIMEOUT, () => {
      Log.info('ACK timeout!');
      return onTimeout();
    });
  }
};

export const initAgent = ({ onRefresh, onAuth }) => {
  Log.info('waiting on agent... ');
  connect.agent(agent => {
    Log.info('agent initialized!');
    agent.onRefresh(onRefresh);
    agent.onRoutable(onAuth);
    Log.debug('trying to get agent config...');
    const agentStates = agent.getConfiguration();
    Log.debug(agentStates);
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
