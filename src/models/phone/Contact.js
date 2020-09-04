// @flow

/**
 * Phone Contact model.
 */

import { Model } from '@vuex-orm/core';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type {
  ConnectionState,
  ConnectionType,
  ContactAttribute,
  ContactAttributesType,
  ContactType,
  RawContactAttribute,
  RawContactAttributes,
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
 * @prop MISSED - Agent failed to answer inbound, or contact failed to answer outbound.
 * @prop PENDING - Agent is calling contact (outbound).
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
  MISSED: 'missed',
  PENDING: 'pending',
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
 * @prop CALL_TYPE - Type of call.
 * @prop INBOUND_ID - ID of associated inbound object.
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
  [ContactActions.PENDING]: ConnectionStates.AGENT_CALLING,
  [ContactActions.CONNECTING]: ConnectionStates.PENDING_CALL,
  [ContactActions.CONNECTED]: ConnectionStates.BUSY,
  [ContactActions.ENDED]: ConnectionStates.PAUSED,
});

export const CallType = Object.freeze({
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
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

  static state() {
    return {
      dnis: null,
      worksites: [],
      pdas: [],
      locale: null,
      outbounds: [],
      inbound: null,
      outbound: null,
    };
  }

  get outbound(): PhoneOutbound {
    const { outbound } = Contact.store().state.entities['phone/contact'];
    return outbound;
  }

  get inbound(): PhoneInbound {
    const { inbound } = Contact.store().state.entities['phone/contact'];
    return inbound;
  }

  static beforeCreate(model: Contact): boolean | vvoid {
    return ![ContactActions.ENDED, ContactActions.DESTROYED].includes(
      model.action,
    );
  }

  static afterCreate(model: Contact): void {
    const isNew = model.action === ContactActions.ENTER;
    const initConnection: ConnectionType = {
      connectionId: `connection#${model.contactId}`,
      state: isNew
        ? model.initConnectionState
        : ContactConnectionMap[model.action],
      contactId: model.contactId,
    };
    Log.debug('Creating initial connection for contact:', initConnection);
    Connection.insertOrUpdate({ data: initConnection }).then((c) => c);
    model
      .updateAttributes()
      .then(() =>
        Log.info(
          'updated attributes =>',
          Contact.store().state.entities['phone/contact'],
        ),
      );
    // handle hydrating existing contacts
    if (model.action === ContactActions.CONNECTED) {
      Contact.update({
        where: model.contactId,
        data: {
          connection: {
            state: ConnectionStates.BUSY,
          },
        },
      });
    }
  }

  static beforeUpdate(model: ContactType): void | boolean {
    if (
      [ContactActions.DESTROYED, ContactActions.MISSED].includes(model.action)
    ) {
      Log.info(`Contact is: ${model.action}, destroying!`);
      Contact.delete(model.contactId).then(() =>
        Log.info('Contact => DELETED'),
      );
      return false;
    }
    const connectContact = ACS.getContactById(model.contactId);
    if (connectContact) {
      model.attributes = connectContact.getAttributes();
    }
    return true;
  }

  static beforeDelete(model: Contact): void {
    Log.debug('contact has been deleted, attempting to clear connect contact.');
    const connection = Connection.query()
      .withAllRecursive()
      .where('contactId', model.contactId)
      .get();
    const connectContact = ACS.getContactById(model.contactId);
    if (connectContact) {
      connectContact.clear({
        success: () => Log.info('successfully cleared contact!'),
        failure: (e) => Log.error('failed to clear contact!', e),
      });
    }
    if (connection) {
      Connection.delete(connection.connectionId)
        .then(() => Log.info('Connection => DELETED'))
        .catch((e) => Log.error('failed to delete connection!', e));
    }
  }

  static afterDelete(model: Contact): void {
    // connect will already auto-put the agent back into a routable
    // state, but we also do it to trigger an upstream update.
    const agentModel = Contact.store().$db().model('phone/agent');
    const agentClient = agentModel
      .query()
      .withAllRecursive()
      .find(model.agentId);
    Log.info('forcing agent out of ACW! contact:', model);
    if (model.action === ContactActions.CONNECTING) {
      // If contact is deleted while it was connecting,
      // then it failed to connect (agent or contact didn't answer)
      Log.info('agent missed contact! placing offline!');
      agentClient.toggleOnline(false);
      return;
    }
    agentClient.toggleOnline(true);
  }

  static afterUpdate(model: Contact): void {
    const connection: Connection = Connection.query()
      .where('contactId', model.contactId)
      .withAllRecursive()
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
      const isNew = model.action === ContactActions.ENTER;
      Connection.update({
        where: connection.connectionId,
        data: ({
          connectionId: connection.connectionId,
          streamsConnectionId: voiceConnection.getConnectionId(),
          contactId: model.contactId,
          state: isNew
            ? model.initConnectionState
            : ContactConnectionMap[model.action],
        }: ConnectionType),
      }).then((c) => Log.debug('connection updated => ', c));
    }
    model
      .updateAttributes()
      .then(() =>
        Log.info(
          'updated attributes =>',
          Contact.store().state.entities['phone/contact'],
        ),
      );
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
      (result, value: RawContactAttribute | ContactAttribute, key) => {
        const _val = _.get(value, 'value', value);
        result[key] = _val; // string values
        if (_.includes(idAttrs, key)) {
          result[key] = [];
          if (!_.isEmpty(_val)) {
            const ids = _.forEach(
              _.get(value, 'value', value).split(','),
              _.trim,
            );
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

  async updateAttributes() {
    Log.debug('updating attributes...');
    const wrkSites = await this.getWorksites();
    const pdas = await this.getPdas();
    const outbounds = await this.getOutbounds();
    const _state = Contact.store().state.entities['phone/contact'];
    let { dnis, locale, inbound } = _state;
    if (!dnis) {
      dnis = await this.getDnis();
    }
    if (!locale) {
      locale = await this.getLocale();
    }
    if (!inbound) {
      inbound = await PhoneInbound.api().fetchBySessionId(this.contactId);
    }
    Contact.commit((state) => {
      state.dnis = dnis;
      state.worksites = _.unionBy(state.worksites, wrkSites, 'id');
      state.pdas = _.unionBy(state.pdas, pdas, 'id');
      state.locale = locale;
      state.outbounds = _.unionBy(state.outbounds, outbounds, 'id');
      state.inbound = inbound;
    });
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
    const itemIds = _.filter(
      _.get(this.contactAttributes, attribute, []),
      _.negate(_.isNil),
    );
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

  async addCases(cases: CaseType[]) {
    const wrksites = cases.filter((c) => c instanceof Worksite);
    const pdas = cases.filter((c) => c instanceof Pda);
    Contact.commit((state) => {
      state.worksites = _.unionBy(state.worksites, wrksites, 'id');
      state.pdas = _.unionBy(state.pdas, pdas, 'id');
    });
  }

  async disconnect() {
    if (this.action === ContactActions.CONNECTED) {
      Log.debug('agent still in call, hanging up...');
      const connection = ACS.getConnectionByContactId(this.contactId);
      if (connection) {
        connection.destroy({
          success: () => Log.info('connection has been destroyed!'),
          failure: (e) => Log.error('failed to destroy contact!', e),
        });
      }
    }
  }
}
