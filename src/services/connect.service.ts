/**
 * AWS Connect Service
 */

import _ from 'lodash';
import Logger from '@/utils/log';

const Log = Logger({ name: 'connect.service' });

/**
 * Enum of Connect Event Topics.
 * @param AGENT - Agent related  topics.
 * @param CONTACT - Contact related topics.
 * @param CORE - Core topics.
 * @enum {string}
 * @readonly
 */
export const EventTopics = Object.freeze({
  AGENT: 'agent',
  CONTACT: 'contact',
  CORE: 'core',
});

/**
 * Enum of bindable Connect Agent events.
 * @readonly
 * @enum {string}
 */
export const AgentEvents = Object.freeze({
  ON_ROUTABLE: 'onRoutable',
  ON_NOT_ROUTABLE: 'onNotRoutable',
  ON_OFFLINE: 'onOffline',
  ON_ERROR: 'onError',
  ON_CONNECTION_LOST: 'onWebSocketConnectionLost',
  ON_CONNECTION_GAINED: 'onWebSocketConnectionGained',
  ON_ACW: 'OnAfterCallWork',
});

/**
 * Enum of bindable Connect Contact events.
 * @param ON_PENDING - Occurs before connecting.
 * @param ON_CONNECTING - Contact is connecting to agent.
 * @param ON_CONNECTED - Contact is live with agent.
 * @param ON_MISSED - Agent fails to answer or rejects.
 * @param ON_ENDED - Agent ends call or contact is missed (outbound).
 * @param ON_ACW - Call has been ended, agent & contact -> ACW.
 * @param ON_DESTROY - Contact is completely closed.
 * @param ON_INCOMING - Outbound callback contact is incoming.
 * @enum {string}
 * @readonly
 */
export const ContactEvents = Object.freeze({
  ON_PENDING: 'onPending',
  ON_CONNECTING: 'onConnecting',
  ON_CONNECTED: 'onConnected',
  ON_MISSED: 'onMissed',
  ON_ENDED: 'onEnded',
  ON_ACW: 'onACW',
  ON_DESTROY: 'onDestroy',
  ON_INCOMING: 'onIncoming',
  ON_REFRESH: 'onRefresh',
});

/**
 * Enum of bindable Connect Core events.
 * @param ON_AUTH_FAIL - On SAML authenticaton failure/timeout.
 * @readonly
 * @enum {string}
 */
export const CoreEvents = Object.freeze({
  ON_AUTH_FAIL: 'onAuthFail',
});

/**
 * Bind events from the provided topic to an object of handlers.
 * @param topic - Topic to bind to.
 * @param handler - Object of handlers.
 */
export const bindEvents = (topic, handler) => {
  Object.keys(handler).forEach((key) => {
    if (topic === EventTopics.CORE) {
      connect[topic][key](connect.hitch(handler, handler[key]));
    } else {
      connect[topic]((item) => item[key](connect.hitch(handler, handler[key])));
    }
  });
};

const ConfigDefaults = {
  ccpUrl: process.env.VUE_APP_AWS_CCP_URL || '',
  region: process.env.VUE_APP_AWS_CCP_REGION || 'us-east-1',
  softphone: {
    allowFramedSoftphone: true,
  },
  loginPopup: true,
  loginPopupAutoClose: true,
  loginOptions: {
    autoClose: true,
    height: 600,
    width: 400,
    top: 0,
    left: 0,
  },
};

/**
 * Bind CCP and initialize connect.
 * @param htmlEl - Element to render CCP into.
 * @param config - Streams configuration.
 */
export const initConnect = ({
  htmlEl,
  config = {},
}: {
  htmlEl: HTMLElement;
  config;
}): void => {
  let finalConfig = ConfigDefaults;
  if (config !== null) {
    finalConfig = { ...finalConfig, ...config };
  }
  connect.core.initCCP(htmlEl, finalConfig);
};

/**
 * Retrieves a contact instance by id if it exists.
 * @param contactId - ID of contact to retrieve.
 * @returns {null|connect.Contact}
 */
export const getContactById = (contactId: string): connect.Contact | null => {
  const agent: connect.Agent = new connect.Agent();
  const contacts: connect.Contact[] = agent.getContacts();
  if (_.isEmpty(contacts)) {
    return null;
  }
  let targContact = contacts.find(
    (c: connect.Contact) => c.getInitialContactId() === contactId,
  );
  if (!targContact) {
    // In the case of an outbound call,
    // the contact ID changes due to a queue transfer
    // via the queued callback functionality.
    // So we will need the current contact ID, rather than the
    // initial.
    targContact = contacts.find(
      (c: connect.Contact) => c.getContactId() === contactId,
    );
    if (targContact) {
      return targContact;
    }
    // Finally, if the contact ID is provided over websocket
    // before connect (and its an outbound), then just use
    // the current contact who is an outbound.
    targContact = contacts.find((c: connect.Contact) => {
      const con = c.getInitialConnection();
      return con && con.getType() === 'outbound';
    });
    if (targContact) {
      return targContact;
    }

    return null;
  }
  return targContact;
};

/**
 * Retrieves the initial connection (contact => agent) by contact id
 * if it exists.
 * @param contactId
 * @returns {null|void|connect.ConnectionType}
 */
export const getConnectionByContactId = (contactId) => {
  const targContact = getContactById(contactId);
  if (targContact === null) return null;
  const targConnection: connect.BaseConnection =
    targContact.getInitialConnection();
  return targConnection || null;
};

/**
 * Initialize SAML authentication via connect popup.
 * @param open - To open or close.
 * @param loginUrl - SAML login url.
 * @returns {Promise<void>}
 */
export const initAuthGateway = async ({ open = true, loginUrl = '' } = {}) => {
  const { core }: { core: any } = connect;
  if (!open) {
    // @ts-ignore
    core.getPopupManager().clear(connect.MasterTopics.LOGIN_POPUP);
    if (core.loginWindow) {
      core.loginWindow.close();
      core.loginWindow = null;
    }
    return;
  }
  // @ts-ignore
  core.getPopupManager().clear(connect.MasterTopics.LOGIN_POPUP);

  core.loginWindow = core
    .getPopupManager()
    // @ts-ignore
    .open(loginUrl, connect.MasterTopics.LOGIN_POPUP);
};

/**
 * Set connect agent online/offline state.
 * @param online - online status.
 */
export const setAgentState = (online: boolean = true) => {
  const stateType = online
    ? connect.AgentStateType.ROUTABLE
    : connect.AgentStateType.OFFLINE;
  const agent = new connect.Agent();
  if (!agent) {
    Log.error('Cannot change agent state because there is no agent!');
    return;
  }
  const connectState = agent.getAgentStates().find((s) => s.type === stateType);
  if (connectState) {
    agent.setState(connectState, {
      success: () => {
        Log.debug(`agent state successfully updated!`);
        Log.debug(connectState);
      },
      failure: () => {
        Log.error('failed to update agent state!');
        Log.error(connectState);
      },
    });
  }
};

/**
 * Connect agent to a phone number via outbound flow.
 * @param phoneNumber - phone number to manually dial.
 */
export const connectEndpoint = (phoneNumber: string) => {
  const endpoint = connect.Endpoint.byPhoneNumber(phoneNumber);
  const agent = new connect.Agent();
  if (!agent) {
    Log.error('cannot dial number because there is no agent!');
    return;
  }

  // @ts-ignore
  const client = connect.core.getClient();
  const endpointOut = new connect.Endpoint();
  // @ts-ignore
  delete endpointOut.endpointId;
  const resp = client.call(
    // @ts-ignore
    connect.ClientMethods.CREATE_OUTBOUND_CONTACT,
    {
      // @ts-ignore
      endpoint: connect.assertNotNull(endpointOut, 'endpoint'),
      queueARN: agent.getRoutingProfile().defaultOutboundQueue.queueARN,
    },
    {
      success: (data) => {
        Log.info('outbound call placed successfully!');
        Log.info('ACS client call success resp:', data);
        Log.info('ACS client snapshot:', agent.toSnapshot());
        Log.info('ACS client contacts:', agent.getContacts());
      },
      failure: (e) => Log.error('failed to place outbound call:', e),
    },
  );
  Log.info('post ACS resp call resp:', resp);
};

/**
 * Add agent verification endpoint to current connection.
 * @param contact - contact of current connection.
 * @returns {*}
 */
export const getAgentVerificationEndpoint = (contact: connect.Contact) => {
  const agent = new connect.Agent();
  let eps;
  agent.getEndpoints(agent.getAllQueueARNs(), {
    success: (data) => {
      Log.info('retrieved agent endpoints!', data);
      Log.info('queues:', agent.getAllQueueARNs());
      const endpoint = data.endpoints.find((e) => e.name === 'VERIFYQUEUE');
      if (endpoint) {
        contact.addConnection(endpoint, {
          success: () => Log.info('successfully transferred!'),
          failure: () => Log.error('failed to transfer!'),
        });
      }

      eps = data.endpoints;
    },
    failure: (e) => Log.error('Failed to retrieve agent endpoints!', e),
  });
  if (eps) {
    return eps.find((e) => e.type === 'queue');
  }
  return null;
};
