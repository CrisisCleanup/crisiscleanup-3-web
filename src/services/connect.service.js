// @flow

/**
 * AWS Connect Service
 */

import type { ACSEventTopic, ACSCallback, ACSConfig } from '@/services/types';

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
  ON_PENDING: 'onPending',
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
