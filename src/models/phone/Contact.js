// @flow

/**
 * Phone Contact model.
 */

import { Model } from '@vuex-orm/core';
import type {
  ConnectionType,
  ContactType,
  ConnectionState,
  RawContactAttributes,
  RawContactAttribute,
  ContactAttributesType,
} from '@/models/phone/types';
import Connection, { ConnectionStates } from '@/models/phone/Connection';
import * as ACS from '@/services/connect.service';
import Logger from '@/utils/log';
import _ from 'lodash';
import Worksite from '@/models/Worksite';
import CCUModel from '@/models/model';
import Pda from '@/models/Pda';
import PhoneOutbound from '@/models/PhoneOutbound';
import PhoneDnis from '@/models/PhoneDnis';
import Language from '@/models/Language';
import type { CaseType } from '@/use/worksites/useCaseCards';
import PhoneInbound from '@/models/PhoneInbound';

/**
 * Enum of possible contact states.
 * @prop QUEUED - Currently waiting in the primary queue.
 * @prop ROUTED - Currently has a target agent (*Does NOT imply an active connection!)
 * @readonly
 * @enum {string}
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

export const ContactConnectionMap = Object.freeze({
  [ContactActions.CONNECTED]: ConnectionStates.BUSY,
  [ContactActions.ENDED]: ConnectionStates.PAUSED,
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
      attributes: this.attr(null),
    }: ContactType);
  }

  static afterCreate(model: Contact): void {
    const initConnection: ConnectionType = {
      connectionId: `connection#${model.contactId}`,
      state: model.initConnectionState,
      contactId: model.contactId,
    };
    Log.debug('Creating initial connection for contact:', initConnection);
    Connection.insertOrUpdate({ data: initConnection }).then((c) => c);
  }

  static beforeUpdate(model: ContactType): void {
    const connectContact = ACS.getContactById(model.contactId);
    if (connectContact) {
      model.attributes = connectContact.getAttributes();
    }
  }

  static afterUpdate(model: Contact): void {
    const connection: Connection = Connection.query()
      .where('contactId', model.contactId)
      .first();
    const voiceConnection = ACS.getConnectionByContactId(model.contactId);
    // Handle agent pending -> contact connecting
    if (
      voiceConnection !== null &&
      model.state === ContactStates.ROUTED &&
      _.isEmpty(connection.streamsConnectionId)
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
      }).then((c) => Log.debug('connection updated => ', c));
    }
    // Handle connection states on and after actual connection.
    if (
      model.state === ContactStates.ROUTED &&
      !_.isEmpty(connection.streamsConnectionId)
    ) {
      const newState = _.get(
        ContactConnectionMap,
        model.action,
        connection.state,
      );
      connection
        .$update({
          state: newState,
        })
        .then(() => Log.info(`Connection state => ${newState}`))
        .catch((e) => Log.error(`failed to update connection state!`, e));
    }
  }

  static parseAttributes(
    rawAttrs: RawContactAttributes,
  ): ContactAttributesType {
    const idAttrs = [
      ContactAttributes.WORKSITES,
      ContactAttributes.INCIDENT,
      ContactAttributes.PDAS,
      ContactAttributes.OUTBOUND_IDS,
    ];
    return _.transform(
      rawAttrs,
      (result, value: RawContactAttribute, key) => {
        const _val = value.value;
        result[key] = _val; // string values
        if (_.includes(idAttrs, key)) {
          result[key] = [];
          if (!_.isEmpty(_val)) {
            const ids = _.forEach(value.value.split(','), _.trim);
            result[key] = _.reject(_.map(ids, _.parseInt), _.isNaN); // number[] values
          }
        }
        if (_.isNumber(_val) && !_.isArray(result[key])) {
          result[key] = _.parseInt(_val); // number values
        }
      },
      {},
    );
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

  get contactAttributes(): ContactAttributesType {
    return Contact.parseAttributes(this.attributes);
  }

  resolveAttributeModels<T>(
    attribute: ContactAttribute,
    model: CCUModel<T>,
  ): Promise<T[]> {
    const itemIds = _.get(this.contactAttributes, attribute, []);
    Log.debug(`resolving <${model.entity}> @ [${itemIds}]`);
    return model.fetchOrFindId(itemIds);
  }

  async getCallDuration() {
    const connectContact = ACS.getContactById(this.contactId);
    if (connectContact) {
      return connectContact.getStateDuration();
    }
    return 0;
  }

  async getWorksites(): Promise<Worksite[]> {
    return this.resolveAttributeModels<Worksite>(
      ContactAttributes.WORKSITES,
      Worksite,
    );
  }

  async getPdas(): Promise<Pda[]> {
    return this.resolveAttributeModels<Pda>(ContactAttributes.PDAS, Pda);
  }

  async getOutbounds(): Promise<PhoneOutbound[]> {
    return this.resolveAttributeModels<PhoneOutbound>(
      ContactAttributes.OUTBOUND_IDS,
      PhoneOutbound,
    );
  }

  async getDnis(): Promise<PhoneDnis | null> {
    const _number = _.get(
      this.contactAttributes,
      ContactAttributes.INBOUND_NUMBER,
      null,
    );
    if (!_number) return null;
    const parsed = parsePhoneNumberFromString(_number);
    if (!parsed) return null;
    const rawNumber = Number(String(parsed.number).slice(1));
    let dnis = await PhoneDnis.query().where('dnis', rawNumber);
    if (dnis.exists()) {
      dnis = dnis.first();
    } else {
      await PhoneDnis.fetchByDnis(parsed.number);
      dnis = await PhoneDnis.query().where('dnis', rawNumber).first();
    }
    return dnis;
  }

  async getLocale(): Promise<Language> {
    let _locale = _.get(
      this.contactAttributes,
      ContactAttributes.LOCALE,
      'en_US',
    );
    _locale = _locale.replace('_', '-');
    return Language.query().where('subtag', _locale).first();
  }

  get callerId(): string {
    const _number = _.get(
      this.contactAttributes,
      ContactAttributes.CALLER_ID,
      null,
    );
    if (!_number) return '';
    const number = parsePhoneNumberFromString(_number);
    return number.formatNational();
  }

}
