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
import * as ACS from '@/services/connect.service';
import Logger from '@/utils/log';

/**
 * Enum of possible contact states.
 * @prop QUEUED - Currently waiting in the primary queue.
 * @prop ROUTED - Currently has a target agent (*Does NOT imply an active connection!)
 * @readonly
 * @enum {string}
 * @type {any | {QUEUED: string, ROUTED: string}}
 */
export const ContactStates = Object.freeze({
  QUEUED: 'queued',
  ROUTED: 'routed',
});

/**
 * Enum of possible contact actions.
 * Primarily used for metric purpose.
 * @prop ENTER - Contact has entered primary queue.
 * @prop CONNECTING - Contact has been accepted by an agent.
 * @prop CONNECTED - Contact has an active connection with at least 1 agent.
 * @prop ENDED - Contact connection has been terminated.
 * @prop DESTROYED - Contact completely closed (post ACW).
 * @prop ERROR - An exception occured at some point.
 * @readonly
 * @enum {string}
 * @type {any | {CONNECTING: string, ENTER: string, ENDED: string, DESTROYED: string, ERROR: string, CONNECTED: string}}
 */
export const ContactActions = Object.freeze({
  ENTER: 'enter_ivr',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ENDED: 'ended',
  DESTROYED: 'destroyed',
  ERROR: 'error',
});

/**
 * Enum of possible contact attributes.
 * @prop CALLER_ID - Deprecated: Contact's Caller Id.
 * @prop PDAS - PDAs associated with contact.
 * @prop WORKSITES - Worksites associated with contact.
 * @prop OUTBOUND_IDS - Outbounds associated with contact.
 * @prop LOCALE - Contact's selected locale.
 * @prop INCIDENT - Incident associated with hotline.
 * @prop CALLBACK_NUMBER - Contact's caller Id (only present in callbacks!)
 * @prop INBOUND_NUMBER - Contact's caller Id (only present in inbound calls!)
 * @readonly
 * @enum {string}
 * @type {any | {PDAS: string, LOCALE: string, WORKSITES: string, INCIDENT: string, OUTBOUND_IDS: string, CALLBACK_NUMBER: string, CALLER_ID: string, INBOUND_NUMBER: string}}
 */
export const ContactAttributes = Object.freeze({
  CALLER_ID: 'callerID',
  PDAS: 'pdas',
  WORKSITES: 'worksites',
  OUTBOUND_IDS: 'ids',
  LOCALE: 'USER_LANGUAGE',
  INCIDENT: 'INCIDENT_ID',
  CALLBACK_NUMBER: 'CALLBACK_NUMBER',
  INBOUND_NUMBER: 'InboundNumber',
});

const Log = Logger({ name: 'phone.contact' });

export default class Contact extends Model {
  static entity = 'phone/contact';

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

  static afterCreate(model: Contact): void {
    const initConnection: ConnectionType = {
      connectionId: `connection#${model.contactId}`,
      state: model.initConnectionState,
      contactId: model.contactId,
    };
    Log.debug('Creating initial connection for contact:', initConnection);
    Connection.insertOrUpdate({ data: initConnection });
  }

  static afterUpdate(model: Contact): void {
    const connection: ConnectionType = Connection.query()
      .where('contactId', model.contactId)
      .first();
    const voiceConnection = ACS.getConnectionByContactId(model.contactId);
    if (
      voiceConnection !== null &&
      connection.connectionId !== voiceConnection.getConnectionId() &&
      model.state === ContactStates.ROUTED
    ) {
      // This occurs post verification, since we now have a 'real' connection.
      Log.info('Agent verified connection, updating!');
      Log.info(
        `${connection.connectionId} ==> ${voiceConnection.getConnectionId()}`,
      );
      Connection.update({
        where: connection.connectionId,
        data: ({
          connectionId: connection.connectionId,
          streamsConnectionId: voiceConnection.getConnectionId(),
          contactId: model.contactId,
          state: model.initConnectionState,
        }: ConnectionType),
      });
    }
  }

  get initConnectionState(): ConnectionState {
    const stateMap = {
      // Contact locked to an agent, awaiting agent acceptance.
      [ContactStates.QUEUED]: ConnectionStates.AGENT_PENDING,
      // Contact's agent accepted, they are now in route to agent.
      [ContactStates.ROUTED]: ConnectionStates.PENDING_CALL,
    };
    return stateMap[this.state];
  }
}
