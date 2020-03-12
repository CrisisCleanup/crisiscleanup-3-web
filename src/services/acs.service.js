/**
 * acs.service.js
 * Amazon Connect Streams Service
 *
 */

export const ConnectConfig = {
  ccpUrl: process.env.VUE_APP_AWS_CCP_URL,
  region: process.env.VUE_APP_AWS_CCP_REGION,
  loginPopup: true,
};

export const initConnect = ({ htmlEl, config, onAuth, onTerminate }) => {
  // Bind and initialize connect
  const finalConf = { ...ConnectConfig, ...config };
  connect.core.initCCP(htmlEl, finalConf);
  console.table();
  const eventBus = connect.core.getEventBus();
  if (onAuth) {
    // Bind handler to auth event
    eventBus.subscribe(connect.EventType.INIT, onAuth);
  }
  if (onTerminate) {
    // Bind handler to session terminiation
    eventBus.subscribe(connect.EventType.TERMINATED, onTerminate);
  }
};

export const initAgent = ({ onStateChange, onRefresh }) => {
  return connect.agent(agent => {
    agent.onStateChange(onStateChange);
    agent.onRefresh(onRefresh);
  });
};
