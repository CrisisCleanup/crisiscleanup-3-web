/**
 * acs.service.js
 * Amazon Connect Streams Service
 *
 */

import Logger from '@/utils/log';
const Log = Logger({
  name: 'acs.service',
  middlewares: [
    (result) => {
      result.unshift('[ACS] ');
      return result;
    },
  ],
});

export const EVENTS = (() => {
  const ev = (e) => `acs:${e}`;
  const st = (e) => `${ev('status')}:${e}`;
  return {
    REQUEST: ev('requestAgent'),
    INBOUND: ev('inbound'),
    AVAILABLE: st('available'),
    ON_CALL: st('oncall'),
    PAUSED: st('paused'),
    OFF_CALL: st('offcall'),
    CASE_SAVED: ev('caseSaved'),
  };
})();

export const ConnectConfig = {
  // reference @crisiscleanup/amazon-connect-streams
  // for custom options
  ccpUrl: process.env.VUE_APP_AWS_CCP_URL,
  region: process.env.VUE_APP_AWS_CCP_REGION,
  allowFramedSoftphone: false,
  loginPopup: {
    autoOpen: false,
    autoClose: true,
    forceWindow: true,
  },
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
    const handleOnAuth = (e) => {
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

export const setPopup = ({ open } = { open: true }) => {
  const loginUrl = `https://cchotline.awsapps.com/auth?client_id=06919f4fd8ed324e&redirect_uri=${global.encodeURIComponent(
    'https://cchotline.awsapps.com/connect/auth/code',
  )}`;
  if (!open) {
    // clear state (kept in localStorage)
    Log.debug('closing popup manager...');
    connect.core.getPopupManager().clear(connect.MasterTopics.LOGIN_POPUP);
    if (connect.core.loginWindow) {
      connect.core.loginWindow.close();
      connect.core.loginWindow = null;
    }
    return false;
  }
  connect.core.getPopupManager().clear(connect.MasterTopics.LOGIN_POPUP);
  connect.core.loginWindow = connect.core
    .getPopupManager()
    .open(loginUrl, connect.MasterTopics.LOGIN_POPUP, ConnectConfig.loginPopup);
  return true;
};

export const STATES = {
  OFFLINE: connect.AgentStateType.OFFLINE,
  ROUTABLE: connect.AgentStateType.ROUTABLE,
  INCOMING: connect.ContactStateType.INCOMING,
  CONNECTING: connect.ContactStateType.CONNECTING,
  CONNECTED: connect.ContactStateType.CONNECTED,
  AGENT_PENDING: connect.ContactStateType.PENDING,
  AGENT_CALLING: 'CallingCustomer',
  DISCONNECTED: connect.ContactStateType.DISCONNECTED,
  PENDING_CALL: 'PendingBusy',
  POLLING: 'polling',
  ON_CALL: 'Busy',
  PAUSED: 'AfterCallWork',
};

export const METRICS = {
  ONLINE: 'agentsOnline',
  STAFFED: 'agentsStaffed',
  CONTACTS_QUEUED: 'contactsInQueue',
  CALLBACKS_QUEUED: 'contactsInQueueOutbound',
  AGENTS_ON_CONTACT: 'agentsOnContact',
  AVAILABLE: 'agentsAvailable',
  AGENTS_ON_CALL: 'agentsOnCall',
  NEEDED: 'agentsNeeded',
  TOTAL_WAITING: 'totalWaiting',
};

export const getAgent = () => new connect.Agent();

export const setAgentState = (state) => {
  const agent = getAgent();
  const stateDef = agent.getAgentStates().find((s) => s.type === state);
  agent.setState(stateDef);
  return state;
};

export const parseAgentState = (stateEvent) => {
  const state = Object.values(STATES).filter((val) => {
    let stateType = stateEvent;
    if (typeof stateEvent === 'object') {
      stateType = stateEvent.type;
      if (['system', 'not_routable'].includes(stateType.toLowerCase())) {
        stateType = stateEvent.name;
      }
    }
    if (val) {
      return val.toLowerCase() === stateType.toLowerCase();
    }
    return false;
  });
  return state.length >= 1 ? state[0] : null;
};

export const bindAgentEvents = (handler) => {
  connect.agent((agent) => {
    agent.onRefresh(connect.hitch(handler, handler.onRefresh));
  });
};

export const bindContactEvents = (handler) => {
  Object.keys(handler).forEach((key) => {
    connect.contact((contact) => {
      contact[key](connect.hitch(handler, handler[key]));
    });
  });
};

export const endContactCall = () => {
  const agent = getAgent();
  const contact = agent.getContacts()[0];
  const initCon = contact.getInitialConnection();
  initCon.destroy();
};

export const getCurrentContact = () => {
  const agent = getAgent();
  const contacts = agent.getContacts();
  if (contacts.length >= 1) {
    return contacts[0];
  }
  return null;
};
