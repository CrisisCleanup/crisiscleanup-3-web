// @flow

/**
 * AWS Connect Service
 */

import type { ACSEventTopic, ACSCallback } from '@/services/types';

export const EventTopics = Object.freeze({
  AGENT: 'agent',
  CONTACT: 'contact',
});

export const AgentEvents = Object.freeze({
  ON_ROUTABLE: 'onRoutable',
  ON_NOT_ROUTABLE: 'onNotRoutable',
  ON_OFFLINE: 'onOffline',
  ON_ERROR: 'onError',
  ON_CONNECTION_LOST: 'onWebSocketConnectionLost',
  ON_CONNECTION_GAINED: 'onWebSocketConnectionGained',
  ON_ACW: 'OnAfterCallWork',
});

export const ContactEvents = Object.freeze({
  ON_PENDING: 'onPending',
});

export const bindEvents = <T>(
  topic: ACSEventTopic,
  handler: { [T]: ACSCallback },
) => {
  Object.keys(handler).forEach((key) => {
    connect[topic]((item) => item[key](connect.hitch(handler, handler[key])));
  });
};
