/**
 * Event Component Model
 */

import Logger from '@/utils/log';
import CCUModel from '@/models/model';
import { Localized } from '@/models/decorators';

/**
 * Enum of different event component types.
 * @readonly
 * @enum {string}
 * @type {*|{UI_ACTION: string, ACTION: string, OBJECT: string, SUB_ACTION: string, ATTR: string}}
 */
export const EventComponentTypes = Object.freeze({
  ACTION: 'action',
  UI_ACTION: 'uiaction',
  OBJECT: 'object',
  ATTR: 'attr',
  ATTR_ALIAS: 'attr_alias',
  SUB_ACTION: 'subaction',
});

type EventComponentTypeT = typeof EventComponentTypes;

/**
 * EventPartDef
 * Event Part Definition
 * name - string
 *
 */
type EventPartT = {
  name: string;
  type: EventComponentTypeT;
  description: string;
  dataType?: any;
};

export const EventParts = Object.freeze({
  ACTOR: {
    name: 'actor',
    type: EventComponentTypes.OBJECT,
    description: 'Jack',
  },
  SUB_ACTION: {
    name: 'subaction',
    type: EventComponentTypes.SUB_ACTION,
    description: 'tries to',
  },
  ACTION: {
    name: 'action',
    type: EventComponentTypes.ACTION,
    description: 'Kick',
  },
  PATIENT: {
    name: 'patient',
    type: EventComponentTypes.OBJECT,
    description: 'the ball',
  },
  RECIPIENT: {
    name: 'recipient',
    type: EventComponentTypes.OBJECT,
    description: 'to Jill',
  },
});

type EventPart = typeof EventParts;

type EventComponentType = {
  id: number;
  key: string;
  type: EventComponentTypeT;
  preposition: string | null;
  name_t: string;
  description_t: string;
  model: string | null;
  column: string | null;
  parent_key: string | null;
  points: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
};

type SuggestedComponentItem = {
  text: string;
  _score: number;
  _source: EventComponentType;
};

type SuggestedComponent = {
  /* input text */
  text: string;
  length: number;
  offset: number;
  options: SuggestedComponentItem[];
};

type SuggestedComponentResponse = {
  key_suggest: SuggestedComponent[];
};

type EventComponentCompletionArgs = {
  /* Partial key to search by */
  partial: string;
  /* Type to limit completions to */
  type: EventComponentTypeT;
};

const Log = Logger({ name: 'event_components.store' });

@Localized
class EventComponent extends CCUModel<EventComponent> {
  static entity = 'event_components';

  static fields() {
    return {
      id: this.number(''),
      key: this.string(''),
      type: this.string(''),
      preposition: this.string('').nullable(),
      name_t: this.string(''),
      description_t: this.string(''),
      model: this.string('').nullable(),
      column: this.string('').nullable(),
      parent_key: this.string('').nullable(),
      points: this.number(0),
      created_at: this.attr('', (value) => Date.parse(value)),
      updated_at: this.attr('', (value) => Date.parse(value)),
      created_by: this.number(''),
      updated_by: this.number(''),
    };
  }

  static fetchById(id: number) {
    return this.api().get(`/event_components/${id}`);
  }

  static async fetchOrFindId(id: number) {
    const exists = await this.query().whereId(id).exists();
    if (!exists) {
      await this.fetchById(id);
    }
    return this.find(id);
  }

  /**
   * Fetch all components by type.
   * @param type - type of component.
   * @param limit - limit results.
   * @returns {Promise<Query<InstanceOf<EventComponent>>>}
   */
  static async fetchAllByType(
    type: EventComponentTypeT,
    limit: number = 100,
  ): Promise<EventComponent[]> {
    const query = this.query().where('type', type);
    if (query.count()) {
      return query.all();
    }
    await this.api().get(`/event_components`, {
      dataKey: 'results',
      params: {
        type,
        limit,
      },
    });
    return this.query().where('type', type).all();
  }

  /**
   * Fetch completions by partial key and type.
   * @param partial
   * @param type
   * @returns {Promise<Array<$Shape<EventComponentType>>>}
   */
  static async getKeyCompletions({
    partial,
    type,
  }: EventComponentCompletionArgs) {
    Log.debug(`searching for component: ${partial} of type ${type}`);
    const {
      response: { data },
    }: {
      response: { data: SuggestedComponentResponse };
    } = await this.api().get('/event_components_search/suggest', {
      save: false,
      params: {
        key_suggest: partial,
        key_suggest_type: type,
      },
    });
    const resp = data.key_suggest.pop();
    return resp?.options.map((o) => ({
      id: o._source.id,
      key: o._source.key,
      model: o._source.model,
      column: o._source.column,
    }));
  }
}

export default EventComponent;
