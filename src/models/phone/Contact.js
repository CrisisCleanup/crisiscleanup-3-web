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
