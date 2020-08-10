// @flow

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
  SUB_ACTION: 'subaction',
});

export type EventComponentTypeT = $Values<typeof EventComponentTypes>;

export type EventComponentType = {|
  id: number,
  key: string,
  type: EventComponentTypeT,
  preposition: string | null,
  name_t: string,
  description_t: string,
  model: string | null,
  column: string | null,
  parent_key: string | null,
  points: number,
  created_at: Date,
  updated_at: Date,
  created_by: number,
  updated_by: number,
|};

export type SuggestedComponentItem = {
  text: string,
  _score: number,
  _source: $Shape<EventComponentType>,
};

export type SuggestedComponent = {
  /* input text */
  text: string,
  length: number,
  offset: number,
  options: SuggestedComponentItem[],
};

export type SuggestedComponentResponse = {
  key_suggest: SuggestedComponent[],
};

export type EventComponentCompletionArgs = {|
  /* Partial key to search by */
  partial: string,
  /* Type to limit completions to */
  type: EventComponentTypeT,
|};

const Log = Logger({ name: 'event_components.store' });

@Localized
class EventComponent extends CCUModel<EventComponentType> {
  static entity = 'event_components';

  static fields() {
    return ({
      id: this.number(),
      key: this.string(),
      type: this.string(),
      preposition: this.string().nullable(),
      name_t: this.string(),
      description_t: this.string(),
      model: this.string().nullable(),
      column: this.string().nullable(),
      parent_key: this.string().nullable(),
      points: this.number(),
      created_at: this.attr('', (value) => Date.parse(value)),
      updated_at: this.attr('', (value) => Date.parse(value)),
      created_by: this.number(),
      updated_by: this.number(),
    }: EventComponentType);
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
   * @returns {Promise<Query<InstanceOf<EventComponent>>>}
   */
  static async fetchAllByType(
    type: EventComponentTypeT,
  ): Promise<EventComponentType[]> {
    const query = this.query().where('type', type);
    if (query.exists()) {
      return query.all();
    }
    await this.api().get(`/event_components`, {
      dataKey: 'results',
      params: {
        type,
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
  }: EventComponentCompletionArgs): Promise<Array<$Shape<EventComponentType>>> {
    Log.debug(`searching for component: ${partial} of type ${type}`);
    const {
      response: { data },
    }: {
      response: { data: SuggestedComponentResponse },
    } = await this.api().get('/event_components_search/suggest', {
      save: false,
      params: {
        key_suggest: partial,
        key_suggest_type: type,
      },
    });
    const resp = data.key_suggest.pop();
    return resp.options.map<$Shape<EventComponentType>>((o) => ({
      id: o._source.id,
      key: o._source.key,
      model: o._source.model,
      column: o._source.column,
    }));
  }
}

export default EventComponent;
