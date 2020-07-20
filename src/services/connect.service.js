// @flow

/**
 * AWS Connect Service
 */

import type { ACSEventTopic, ACSCallback, ACSConfig } from '@/services/types';
import _ from 'lodash';

/**
 * Enum of Connect Event Topics.
 * @type {*|{AGENT: string, CONTACT: string}}
 */
export const EventTopics = Object.freeze({
  AGENT: 'agent',
  CONTACT: 'contact',
  CORE: 'core',
});

/**
 * Enum of bindable Connect Agent events.
 * @type {*|{ON_NOT_ROUTABLE: string, ON_OFFLINE: string, ON_ACW: string, ON_CONNECTION_LOST: string, ON_CONNECTION_GAINED: string, ON_ROUTABLE: string, ON_ERROR: string}}
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
 * @type {*|{ON_PENDING: string}}
 */
export const ContactEvents = Object.freeze({
  ON_PENDING: 'onPending', // Occurs before connecting.
  ON_CONNECTING: 'onConnecting', // Contact is connecting to agent.
  ON_CONNECTED: 'onConnected', // Contact is live with agent.
  ON_MISSED: 'onMissed', // Agent fails to answer or rejects.
  ON_ENDED: 'onEnded', // Agent ends call or contact is missed (outbound).
  ON_ACW: 'onACW', // Call has been ended, agent & contact -> ACW.
  ON_DESTROY: 'onDestroy', // Contact is completely closed.
});

/**
 * Enum of bindable Connect Core events.
 * @type {*|{ON_AUTH_FAIL: string}}
 */
export const CoreEvents = Object.freeze({
  ON_AUTH_FAIL: 'onAuthFail',
});

/**
 * Bind events from the provided topic to an object of handlers.
 * @param topic - Topic to bind to.
 * @param handler - Object of handlers.
 */
export const bindEvents = <T>(
  topic: ACSEventTopic,
  handler: { [T]: ACSCallback },
) => {
  Object.keys(handler).forEach((key) => {
    if (topic === EventTopics.CORE) {
      connect[topic][key](connect.hitch(handler, handler[key]));
    } else {
      connect[topic]((item) => item[key](connect.hitch(handler, handler[key])));
    }
  });
};

const ConfigDefaults: ACSConfig = {
  ccpUrl: process.env.VUE_APP_AWS_CCP_URL || '',
  region: process.env.VUE_APP_AWS_CCP_REGION || 'us-east-1',
  softphone: {
    allowFramedSoftphone: true,
  },
  loginPopup: false,
  loginPopupAutoClose: true,
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
  htmlEl: HTMLElement,
  config?: $Shape<ACSConfig>,
}): void => {
  let finalConfig: ACSConfig = ConfigDefaults;
  if (config !== null) {
    finalConfig = { ...finalConfig, ...config };
  }
  connect.core.initCCP(htmlEl, finalConfig);
};

/**
 * Retrieves the initial connection (contact => agent) by contact id
 * if it exists.
 * @param contactId
 * @returns {null|void|connect.ConnectionType}
 */
export const getConnectionByContactId = (
  contactId: string,
): connect.Connection | null => {
  const agent: connect.Agent = new connect.Agent();
  const contacts: connect.Contact[] = agent.getContacts();
  if (_.isEmpty(contacts)) {
    return null;
  }
  const targContact = contacts.find(
    (c: connect.Contact) => c.getInitialContactId() === contactId,
  );
  if (!targContact) {
    return null;
  }
  const targConnection: void | connect.ConnectionType = targContact.getInitialConnection();
  return targConnection || null;
};

/**
 * Initialize SAML authentication via connect popup.
 * @param open - To open or close.
 * @param loginUrl - SAML login url.
 * @returns {Promise<void>}
 */
export const initAuthGateway = async ({ open = true, loginUrl = '' } = {}) => {
  if (!open) {
    connect.core.getPopupManager().clear(connect.MasterTopics.LOGIN_POPUP);
    if (connect.core.loginWindow) {
      connect.core.loginWindow.close();
      connect.core.loginWindow = null;
    }
    return;
  }
  connect.core.getPopupManager().clear(connect.MasterTopics.LOGIN_POPUP);
  connect.core.loginWindow = connect.core
    .getPopupManager()
    .open(loginUrl, connect.MasterTopics.LOGIN_POPUP);
};
