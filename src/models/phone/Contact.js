// @flow

/**
 * Phone Contact model.
 */

import { Model } from '@vuex-orm/core';
import type {
  ConnectionType,
  ContactType,
  ConnectionState,
} from '@/models/phone/types';
import Connection, { ConnectionStates } from '@/models/phone/Connection';

/**
 * Enum of possible contact states.
 * @type {{QUEUED: string, ROUTED: string}|*}
 */
export const ContactStates = Object.freeze({
  QUEUED: 'queued', // Currently waiting in the primary queue.
  ROUTED: 'routed', // Currently has a target agent. (*Does NOT imply an active connection!)
});

/**
 * Enum of possible contact actions.
 * Primarily used for metric purpose.
 * @type {{CONNECTING: string, ENTER: string, ENDED: string, ERROR: string, CONNECTED: string}|*}
 */
export const ContactActions = Object.freeze({
  ENTER: 'enter_ivr', // Contact has entered primary queue.
  CONNECTING: 'connecting', // Contact has been accepted by an agent.
  CONNECTED: 'connected', // Contact has an active connection with at least 1 agent.
  ENDED: 'ended', // Contact has been terminated.
  ERROR: 'error', // An exception occurred at some point.
});

export default class Contact extends Model {
  static entity = 'phone_contact';

  static primaryKey = 'contactId';

  static fields() {
    return ({
      contactId: this.string(),
      agentId: this.string(),
      state: this.string(),
      action: this.string(),
      connection: this.hasOne(Connection, 'contactId'),
    }: ContactType);
  }

}
