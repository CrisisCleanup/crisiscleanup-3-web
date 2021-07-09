// @flow

/**
 * Phone Contact model.
 */

import { Fields, Model } from '@vuex-orm/core';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type {
  ConnectionState,
  ConnectionType,
  ContactAction,
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
import type { CaseType } from '@/store/modules/phone/types';
import Incident from '@/models/Incident';
import * as Sentry from '@sentry/browser';

/**
 * Enum of possible contact states.
 * @param QUEUED - Currently waiting in the primary queue.
 * @param ROUTED - Currently has a target agent (*Does NOT imply an active connection!)
 * @readonly
 * @enum {string}
 */
export const ContactStates = Object.freeze({
  QUEUED: 'queued',
  ROUTED: 'routed',
});

/**
 * Enum of possible contact actions.
 * @param ENTER - Contact has entered primary queue.
 * @param CONNECTING - Contact has been accepted by an agent.
 * @param CONNECTED - Contact has an active connection with at least 1 agent.
 * @param ENDED - Contact connection has been terminated.
 * @param DESTROYED - Contact completely closed (post ACW).
 * @param ERROR - An exception occured at some point.
 * @param MISSED - Agent failed to answer inbound, or contact failed to answer outbound.
 * @param PENDING - Agent is calling contact (outbound).
 * @param ABANDON - Contact abandoned the call (inbound).
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
  ABANDON: 'abandon',
});

/**
 * Enum of possible contact attributes.
 * @param CALLER_ID - Deprecated: Contact's Caller Id.
 * @param PDAS - PDAs associated with contact.
 * @param WORKSITES - Worksites associated with contact.
 * @param OUTBOUND_IDS - Outbounds associated with contact.
 * @param LOCALE - Contact's selected locale.
 * @param INCIDENT - Incident associated with hotline.
 * @param CALLBACK_NUMBER - Contact's caller Id (only present in callbacks!)
 * @param INBOUND_NUMBER - Contact's caller Id (only present in inbound calls!)
 * @param CALL_TYPE - Type of call.
 * @param INBOUND_ID - ID of associated inbound object.
 * @param OUTBOUND_TYPE - Type of outbound (calldown/callback).
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
  OUTBOUND_TYPE: 'OUTBOUND_TYPE',
  PROMPT_STATUS: 'PROMPT_STATUS',
});

export const ContactConnectionMap: {
  [ContactAction]: ConnectionState,
} = Object.freeze({
  [ContactActions.PENDING]: ConnectionStates.AGENT_CALLING,
  [ContactActions.CONNECTING]: ConnectionStates.PENDING_CALL,
  [ContactActions.CONNECTED]: ConnectionStates.BUSY,
  [ContactActions.ENDED]: ConnectionStates.PAUSED,
});

export const CallType = Object.freeze({
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
  CALLDOWN: 'CALLDOWN',
});

const Log = Logger({ name: 'phone.contact' });

export default class Contact extends Model {
  static entity: string = 'phone/contact';

  static primaryKey: string = 'contactId';

  static fields(): typeof Fields {
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
      resolveRequested: false,
      resolveTask: '',
      dnis: null,
      worksites: [],
      pdas: [],
      locale: null,
      incident: null,
      outbounds: [],
      inbound: null,
      outbound: null,
    };
  }

  get worksites(): typeof Worksite[] {
    const { worksites } = Contact.store().state.entities['phone/contact'];
    return worksites;
  }

  get outbound(): typeof PhoneOutbound {
    const { outbound } = Contact.store().state.entities['phone/contact'];
    return outbound;
  }

  get inbound(): typeof PhoneInbound {
    const { inbound } = Contact.store().state.entities['phone/contact'];
    return inbound;
  }

  get dnis(): typeof PhoneDnis {
    const { dnis } = Contact.store().state.entities['phone/contact'];
    return dnis;
  }

  get incident(): typeof Incident {
    const { incident } = Contact.store().state.entities['phone/contact'];
    return incident;
  }

  get isInbound(): boolean {
    const callType = _.get(
      this.contactAttributes,
      ContactAttributes.CALL_TYPE,
      CallType.INBOUND,
    );
    return callType.toLowerCase() === CallType.INBOUND.toLowerCase();
  }

  get callType(): $Values<typeof CallType> {
    const _ctype = _.get(
      this.contactAttributes,
      ContactAttributes.CALL_TYPE,
      CallType.INBOUND,
    ).toUpperCase();
    if (_ctype === CallType.OUTBOUND) {
      return _.get(
        this.contactAttributes,
        ContactAttributes.OUTBOUND_TYPE,
        CallType.OUTBOUND,
      );
    }
    return _ctype;
  }

  get hasResolvedCases() {
    return Object.keys(this.contactAttributes).includes(
      ContactAttributes.WORKSITES,
    );
  }

  get mostRecentWorksite(): typeof Worksite | null {
    return _.maxBy(this.worksites, (wk) => Date.parse(wk.updated_at));
  }

  static syncAttributes(contactId: string, externalAttrs: any) {
    const contact: typeof Contact = Contact.query()
      .withAllRecursive()
      .find(contactId);
    if (!contact) {
      Log.info('no contact found! cannot sync attributes.');
      return externalAttrs || {};
    }
    if (externalAttrs) {
      Contact.commit(() => {
        contact.attributes = _.merge(contact.attributes, externalAttrs);
      });
    }
    const connectContact = ACS.getContactById(contact.contactId);
    if (connectContact) {
      const attrs = connectContact.getAttributes();
      Log.info('got connect attributes:', attrs);
      if (!_.isNil(attrs)) {
        Contact.commit(() => {
          contact.attributes = _.merge(contact.attributes, attrs);
        });
      }
    }
    const resolvedAttr = Contact.resolveAttributes(contact);
    if (resolvedAttr) {
      Contact.commit(() => {
        contact.attributes = _.merge(contact.attributes, resolvedAttr);
      });
    }
    return contact.attributes;
  }

  static beforeCreate(model: Contact): void | boolean {
    if (model.contactId.includes('$')) {
      Log.error('Invalid contact!', model);
      return false;
    }
    return true;
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
    if (model.action === ContactActions.DESTROYED) {
      Log.debug(
        'Avoided creating connection for contact b/c its been deleted!',
      );
      return;
    }
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
    Contact.syncAttributes(model.contactId);
    Sentry.setContext(Contact.entity, model.$toJson());
  }

  static beforeUpdate(model: Contact): void | boolean {
    if (
      ![
        ContactActions.DESTROYED,
        ContactActions.MISSED,
        ContactActions.ABANDON,
      ].includes(model.action)
    ) {
      model.attributes = Contact.syncAttributes(
        model.contactId,
        model.attributes,
      );
    }
    if (model.action === ContactActions.ABANDON) {
      window.vue.$toasted.error(
        window.vue.$t('phoneDashboard.survivor_ended_call'),
      );
    }
    if ([ContactActions.DESTROYED].includes(model.action)) {
      const isCallActive =
        Contact.store().getters['phone.controller/isCallActive'];
      if (isCallActive) {
        Log.info('Agent has not closed contact! Preventing ACW exit...');
        return false;
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
    if (
      [
        ContactActions.MISSED,
        ContactActions.ENTER,
        ContactActions.ABANDON,
      ].includes(model.action)
    ) {
      // If contact is deleted while it was connecting,
      // then it failed to connect (agent or contact didn't answer)
      Log.info('agent missed contact! placing offline!');
      agentClient.toggleOnline(false);
    }
    Contact.store()
      .dispatch('phone.controller/clearState', {
        agentId: agentClient.agentId,
      })
      .then(() => {
        Log.debug('clearing contact state!');
        Contact.commit((state) => {
          state.dnis = null;
          state.worksites = [];
          state.pdas = [];
          state.locale = null;
          state.outbounds = [];
          state.inbound = null;
          state.outbound = null;
          state.incident = null;
          state.resolveRequested = false;
          state.resolveTask = '';
          Sentry.setContext(`${Contact.entity}-state`, null);
        });
      });
    Sentry.setContext(Contact.entity, null);
  }

  static afterUpdate(model: Contact): void | boolean {
    Sentry.setContext(Contact.entity, model.$toJson());
    if (
      [
        ContactActions.DESTROYED,
        ContactActions.MISSED,
        ContactActions.ABANDON,
      ].includes(model.action)
    ) {
      Log.info(`Contact is: ${model.action}, destroying!`);
      Contact.delete(model.contactId).then(() =>
        Log.info('Contact => DELETED'),
      );
      return false;
    }
    const connection: Connection = Connection.query()
      .where('contactId', model.contactId)
      .withAllRecursive()
      .first();
    const voiceConnection = ACS.getConnectionByContactId(model.contactId);
    // Handle agent pending -> contact connecting
    if (
      voiceConnection !== null &&
      model.state === ContactStates.ROUTED &&
      (!connection || _.isEmpty(connection.streamsConnectionId))
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
      (model.action !== ContactActions.DESTROYED &&
        model.state === ContactStates.ROUTED &&
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
    Sentry.setContext(Contact.entity, model.$toJson());
    return true;
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
    if (this.action === ContactActions.DESTROYED) {
      Log.debug('not updating attributes cause destroyed!');
      return;
    }
    const wrkSites = await this.getWorksites();
    const pdas = await this.getPdas();
    const outbounds = await this.getOutbounds();
    const _state = Contact.store().state.entities['phone/contact'];
    let { dnis, locale, outbound, inbound, incident } = _state;
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
    if (!incident) {
      const incidents = await this.getIncidents();
      incident = _.maxBy(incidents, 'id');
    }
    Contact.commit((state) => {
      if (dnis && !_.isEmpty(dnis)) {
        state.dnis = _.isArray(dnis) ? _.first(dnis) : dnis;
      }
      state.worksites = _.isEmpty(wrkSites)
        ? state.worksites
        : _.unionBy(state.worksites, wrkSites, 'id');
      state.pdas = _.isEmpty(state.pdas)
        ? state.pdas
        : _.unionBy(state.pdas, pdas, 'id');
      state.locale = locale || state.locale;
      state.outbounds = _.isEmpty(outbounds)
        ? state.outbounds
        : _.unionBy(state.outbounds, outbounds, 'id');
      state.incident = incident || state.incident;
      state.inbound = inbound || state.inbound;
      state.outbound = outbound || state.outbound;
      Sentry.setContext(`${Contact.entity}-state`, state);
    });
  }

  static resolveAttributes(contact: typeof Contact) {
    const {
      currentOutbound,
    }: { currentOutbound: null | typeof PhoneOutbound } =
      Contact.store().state['phone.controller'];
    const { resolveRequested, resolveTask } =
      Contact.store().state.entities['phone/contact'];
    if (resolveRequested) {
      Log.debug('case resolution already requested, checking for updates...');
      const connectContact = ACS.getContactById(contact.contactId);
      if (connectContact) {
        const attrs = connectContact.getAttributes();
        Log.debug('got resolved attributes!', attrs);
        if (!_.isNil(attrs) && contact.hasResolvedCases) {
          return attrs;
        }
      }
      if (!_.isEmpty(resolveTask)) {
        Contact.api()
          .get('phone_connect/resolve_cases', {
            save: false,
            params: {
              task_id: resolveTask,
            },
          })
          .then(({ response }) => {
            Log.info('case resolution task response:', response);
            const {
              data: { status, results },
            } = response;
            if (status === 'SUCCESS') {
              Log.info('success! cases have been resolved from api.', response);
              Contact.commit(() => {
                contact.attributes = _.merge(contact.attributes || {}, results);
              });
              contact
                .updateAttributes()
                .then(() =>
                  Log.info(
                    'updated attributes =>',
                    Contact.store().state.entities['phone/contact'],
                  ),
                );
            }
          });
      }
    }
    if (contact.hasResolvedCases) {
      return {};
    }
    if (!resolveRequested) {
      let payload = {
        phone_number: _.get(
          this.contactAttributes,
          ContactAttributes.INBOUND_NUMBER,
          currentOutbound ? currentOutbound.phone_number : null,
        ),
      };
      if (contact.isInbound) {
        payload = { ...payload, contact_id: contact.contactId };
        if (payload.phone_number === null && contact.dnis) {
          payload.phone_number = contact.dnis.dnis;
        }
      }
      Log.debug('resolve payload:', payload);
      if (payload.phone_number) {
        Contact.commit((state) => {
          state.resolveRequested = true;
        });
        Contact.api()
          .post('phone_connect/resolve_cases', payload, { save: false })
          .then((resp) => {
            Log.info('requested api to resolve cases!', payload, resp);
            const {
              response: {
                data: { task_id },
              },
            } = resp;
            Contact.commit((state) => {
              state.resolveTask = task_id;
            });
          });
      }
    }
    if (currentOutbound) {
      Log.info('found current outbound!');
      return {
        [ContactAttributes.INBOUND_NUMBER]: currentOutbound.phone_number,
        [ContactAttributes.INCIDENT]: String(
          _.max(currentOutbound.incident_id),
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

  get connectContactId(): string | null {
    const connectContact = ACS.getContactById(this.contactId);
    if (connectContact) {
      return connectContact.getContactId();
    }
    return null;
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

  async getWorksites(): Promise<typeof Worksite[]> {
    return this.resolveAttributeModels<typeof Worksite>(
      ContactAttributes.WORKSITES,
      Worksite,
    );
  }

  async getPdas(): Promise<typeof Pda[]> {
    return this.resolveAttributeModels<typeof Pda>(ContactAttributes.PDAS, Pda);
  }

  async getOutbounds(): Promise<typeof PhoneOutbound[]> {
    const {
      currentOutbound,
    }: { currentOutbound: null | typeof PhoneOutbound } =
      Contact.store().state['phone.controller'];
    if (currentOutbound) {
      return [currentOutbound];
    }
    return this.resolveAttributeModels<typeof PhoneOutbound>(
      ContactAttributes.OUTBOUND_IDS,
      PhoneOutbound,
    );
  }

  async getInbound(): Promise<typeof PhoneInbound> {
    return this.resolveAttributeModels<typeof PhoneInbound>(
      ContactAttributes.INBOUND_ID,
      PhoneInbound,
    );
  }

  async getIncidents(): Promise<typeof Incident[]> {
    return this.resolveAttributeModels<typeof Incident>(
      ContactAttributes.INCIDENT,
      Incident,
    );
  }

  async getDnis({
    inbound,
    outbound,
  }: {
    inbound: typeof PhoneInbound | null,
    outbound: typeof PhoneOutbound | null,
  } = {}): Promise<PhoneDnis | null> {
    // check for DNIS id in attr
    const _dnis = _.get(
      this.contactAttributes,
      ContactAttributes.CALLER_DNIS_ID,
      null,
    );
    if (_dnis !== null) {
      Log.debug('resolving DNIS using dnis attribute!', _dnis);
      return PhoneDnis.fetchOrFindId(_dnis);
    }
    // first check for contact attr.
    let _number = _.get(
      this.contactAttributes,
      ContactAttributes.INBOUND_NUMBER,
      null,
    );
    if (outbound) {
      // if an outbound was found, use
      // the dnis1 id to resolve
      Log.debug('resolving DNIS using current outbound!', outbound.dnis1);
      const outDnis = await PhoneDnis.fetchOrFindId(outbound.dnis1);
      if (!outDnis || _.isEmpty(outDnis)) {
        Log.info('failed to resolve dnis from outbound!', outDnis);
      }
    }
    if (inbound) {
      // if an inbound was found
      // use the dnis raw number to resolve.
      _number = inbound.dnis;
      Log.debug('resolving DNIS using current current!', inbound.dnis);
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
    if (this.dnis) {
      return this.dnis.dnisNational;
    }
    return '';
  }

  get fullState(): string {
    return [this.state, this.action].join('#');
  }

  async addCases(cases: CaseType[]) {
    const wrksites = cases.filter((c) => c instanceof Worksite);
    const pdas = cases.filter((c) => c instanceof Pda);
    Contact.commit((state) => {
      state.worksites = _.unionBy(wrksites, state.worksites, 'id');
      state.pdas = _.unionBy(pdas, state.pdas, 'id');
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
