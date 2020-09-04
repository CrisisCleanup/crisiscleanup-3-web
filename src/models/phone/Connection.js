// @flow

/**
 * Connection model.
 */

import { Model } from '@vuex-orm/core';
import type { ConnectionType } from '@/models/phone/types';
import _ from 'lodash';
import * as ACS from '@/services/connect.service';
import Logger from '@/utils/log';

/**
 * Enum of states representing the current step or stage of a connection.
 * @param AGENT_CALLING - Agent -> Outbound Call.
 * @param AGENT_PENDING - Server -> Agent verification call.
 * @param PENDING_CALL - Agent -> Customer post verification transfer.
 * @param BUSY - Agent has at least 1 connected contact.
 * @param PAUSED - Agent has closed all open contacts. Rest period.
 * @readonly
 * @enum {string}
 */
export const ConnectionStates = Object.freeze({
  AGENT_CALLING: 'CallingCustomer',
  AGENT_PENDING: 'pending',
  PENDING_CALL: 'PendingBusy',
  BUSY: 'Busy',
  PAUSED: 'AfterCallWork',
});

const Log = Logger({ name: 'phone.connection' });

export default class Connection extends Model {
  static entity = 'phone/connection';

  static primaryKey = 'connectionId';

  static fields() {
    return ({
      connectionId: this.string(),
      contactId: this.string(),
      state: this.string(),
      streamsConnectionId: this.string(''),
    }: ConnectionType);
  }

  static afterUpdate(model: Connection) {
    if (_.isNil(model.streamsConnectionId)) {
      const voiceConnection = ACS.getConnectionByContactId(model.contactId);
      if (voiceConnection) {
        Log.info('recv streams connection ID during connection update!');
        model.streamsConnectionId = voiceConnection.getConnectionId();
      }
    }
  }
}
