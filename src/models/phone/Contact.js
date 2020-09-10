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
  PDAS: 'PDAS',
  WORKSITES: 'WORKSITES',
  OUTBOUND_IDS: 'OUTBOUND_IDS',
  LOCALE: 'USER_LANGUAGE',
  INCIDENT: 'INCIDENT_ID',
  CALLBACK_NUMBER: 'CALLBACK_NUMBER',
  INBOUND_NUMBER: 'InboundNumber',
  CALL_TYPE: 'CALL_TYPE',
  INBOUND_ID: 'TARGET_INBOUND_ID',
  CALLER_DNIS_ID: 'DNIS_ID',
  OUTBOUNDS_OLD: 'ids',
});

export const ContactConnectionMap = Object.freeze({
  [ContactActions.PENDING]: ConnectionStates.AGENT_CALLING,
  [ContactActions.CONNECTING]: ConnectionStates.PENDING_CALL,
  [ContactActions.CONNECTED]: ConnectionStates.BUSY,
  [ContactActions.ENDED]: ConnectionStates.PAUSED,
});

export const CallType = Object.freeze({
  INBOUND: 'inbound',
  OUTBOUND: 'OUTBOUND',
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

  get dnis(): PhoneDnis {
    const { dnis } = Contact.store().state.entities['phone/contact'];
    return dnis;
  }

  get isInbound(): boolean {
    const callType = _.get(
      this.contactAttributes,
      ContactAttributes.CALL_TYPE,
      CallType.INBOUND,
    );
    return callType.toLowerCase() === CallType.INBOUND;
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

  static beforeUpdate(model: Contact): void | boolean {
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
      const attrs = connectContact.getAttributes();
      Log.info('got connect attributes:', attrs);
      if (!_.isNil(attrs)) {
        model.attributes = _.merge(model.attributes, attrs);
      }
    }
    if (!model.isInbound) {
      const outboundAttrs = Contact.getOutboundAttributes(model);
      if (outboundAttrs) {
        model.attributes = _.merge(model.attributes, outboundAttrs);
      }
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
      (model.state === ContactStates.ROUTED &&
        !_.isEmpty(connection.streamsConnectionId)) ||
      (model.action === ContactActions.CONNECTED && !model.isInbound)
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
      ContactAttributes.OUTBOUNDS_OLD,
      ContactAttributes.CALLER_DNIS_ID,
      ContactAttributes.INBOUND_ID,
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
    let { dnis, locale, outbound, inbound } = _state;
    if (!locale) {
      locale = await this.getLocale();
    }
    if (!outbound) {
      outbound = _.first(outbounds);
    }
    if (!inbound) {
      inbound = await this.getInbound();
      inbound = _.isArray(inbound) ? _.first(inbound) : inbound;
    }
    if (!dnis) {
      dnis = await this.getDnis({ inbound, outbound });
    }
    Contact.commit((state) => {
      state.dnis = _.isArray(dnis) ? _.first(dnis) : dnis;
      state.worksites = _.unionBy(state.worksites, wrkSites, 'id');
      state.pdas = _.unionBy(state.pdas, pdas, 'id');
      state.locale = locale;
      state.outbounds = _.unionBy(state.outbounds, outbounds, 'id');
      state.inbound = inbound;
      state.outbound = outbound;
    });
  }

  static getOutboundAttributes(contact: Contact) {
    const {
      currentOutbound,
    }: { currentOutbound: null | PhoneOutbound } = Contact.store().state[
      'phone.controller'
    ];
    if (currentOutbound) {
      const conContact = ACS.getContactById(contact.contactId);
      if (conContact) {
        const payload = {
          phone_number: _.get(
            conContact.getAttributes(),
            ContactAttributes.INBOUND_NUMBER,
          ),
          contact_id: conContact.getContactId(),
        };

        Contact.api()
          .post('phone_connect/resolve_cases', payload)
          .then((resp) =>
            Log.info('requested api to resolve cases!', payload, resp),
          );
      }
      Log.info('found current outbound!');
      return {
        [ContactAttributes.INBOUND_NUMBER]: currentOutbound.phone_number,
        [ContactAttributes.INCIDENT]: String(
          _.first(currentOutbound.incident_id),
        ),
        [ContactAttributes.OUTBOUND_IDS]: String(currentOutbound.id),
        [ContactAttributes.CALL_TYPE]: CallType.OUTBOUND,
        [ContactAttributes.CALLER_DNIS_ID]: String(currentOutbound.dnis1),
      };
    }
    return {};
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

  async getInbound(): Promise<PhoneInbound> {
    return this.resolveAttributeModels<PhoneInbound>(
      ContactAttributes.INBOUND_ID,
      PhoneInbound,
    );
  }

  async getDnis({
    inbound,
    outbound,
  }: {
    inbound: PhoneInbound | null,
    outbound: PhoneOutbound | null,
  } = {}): Promise<PhoneDnis | null> {
    // check for DNIS id in attr
    const _dnis = _.get(
      this.contactAttributes,
      ContactAttributes.CALLER_DNIS_ID,
      null,
    );
    if (_dnis) {
      return PhoneDnis.fetchOrFindId(_dnis);
    }
    // first check for contact attr.
    let _number = _.get(
      this.contactAttributes,
      ContactAttributes.INBOUND_NUMBER,
      null,
    );
    if (!_number && outbound) {
      // if an outbound was found, use
      // the dnis1 id to resolve
      return PhoneDnis.fetchOrFindId(outbound.dnis1);
    }
    if (!_number && inbound) {
      // if an inbound was found
      // use the dnis raw number to resolve.
      _number = inbound.dnis;
    }
    if (!_number) return null;
    const parsed = parsePhoneNumberFromString(_number);
    if (!parsed) return null;
    let rawNumber = String(parsed.number);
    if (rawNumber.startsWith('+')) {
      rawNumber = Number(rawNumber.slice(1));
    }
    const noCountry = Number(String(rawNumber).slice(1));
    let dnis = await PhoneDnis.query()
      .where('dnis', rawNumber)
      .orWhere('dnis', noCountry);
    if (dnis.exists()) {
      dnis = dnis.first();
    } else {
      await PhoneDnis.fetchByDnis(parsed.number);
      dnis = await PhoneDnis.query()
        .where('dnis', rawNumber)
        .orWhere('dnis', noCountry)
        .first();
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
      ContactAttributes.INBOUND_NUMBER,
      null,
    );
    if (!_number) return '';
    const number = parsePhoneNumberFromString(_number);
    return number.formatNational();
  }

  get fullState(): string {
    return [this.state, this.action].join('#');
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
