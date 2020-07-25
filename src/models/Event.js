// @flow

/**
 * Event Model
 */

import Logger from '@/utils/log';
import { Model } from '@vuex-orm/core';
import _ from 'lodash';

export type EventType = {|
  id: number,
  key: string,
  actor_model: string,
  patient_model: string,
  recipient_model: string,
  name_t: string,
  description_t: string,
  past_tense_t: string,
  present_progressive_t: string,
  required_attr: string[],
  points: number,
  badge_key: string,
  total_uses: number,
  last_used_at: Date,
  actor_key: string,
  action_key: string,
  subaction_key: string | null,
  recipient_key: string | null,
  invalidated_at: Date | null,
  created_at: Date,
  updated_at: Date,
|};

export type SuggestedEventItem = {
  text: string,
  length: number,
  offset: number,
  _score: number,
  _source: {
    id: number,
    key: string,
  },
};

export type SuggestedEvent = {
  /* Input Text */
  text: string,
  options: SuggestedEventItem[],
};

export type SuggestedEventResponse = {|
  key_suggest_match: SuggestedEvent[],
|};

const Log = Logger({ name: 'events.store' });

export default class Event extends Model {
  static entity = 'event';

  static fields() {
    return ({
      id: this.number(),
      key: this.string(),
      actor_model: this.string(),
      patient_model: this.string(),
      recipient_model: this.string(),
      name_t: this.string(),
      description_t: this.string(),
      past_tense_t: this.string(),
      present_progressive_t: this.string(),
      required_attr: this.attr([]),
      points: this.number(),
      badge_key: this.string(),
      total_uses: this.number(),
      last_used_at: this.attr('', (value) => Date.parse(value)),
      actor_key: this.string(),
      action_key: this.string(),
      subaction_key: this.string(),
      recipient_key: this.string(),
      invalidated_at: this.attr('', (value) => Date.parse(value)),
      created_at: this.attr('', (value) => Date.parse(value)),
      updated_at: this.attr('', (value) => Date.parse(value)),
    }: EventType);
  }

  static fetchById(id: number) {
    return this.api().get(`/events/${id}`);
  }

  /**
   * Fetch auto completions from partial key.
   * @param partialKey - key to fetch suggestions for.
   * @returns {Promise<Array<{ id: number, key: string, ... }>>}
   */
  static async getCompletions(
    partialKey: string,
  ): Promise<Array<{ id: number, key: string, ... }>> {
    const parsedPartial = partialKey.toLowerCase().replace(' ', '_');
    Log.debug('searching for:', parsedPartial);
    const {
      response: { data },
    }: { response: { data: SuggestedEventResponse } } = await this.api().get(
      `/events_search/functional_suggest`,
      {
        save: false,
        params: {
          key_suggest_match: parsedPartial,
        },
      },
    );
    const resp = data.key_suggest_match.pop();
    return resp.options.map<{ id: number, key: string }>(
      (o: SuggestedEventItem) => ({
        id: o._source.id,
        key: o._source.key,
      }),
    );
  }

  /**
   * Returns event object with pre-translated values.
   * @returns {EventType}
   */
  withTrans(): EventType {
    return _.transform(
      this,
      (result, value, key: string) => {
        result[key] = value;
        if (key.includes('_t')) {
          result[key] = window.vue.$t(value);
        }
      },
      {},
    );
  }
}
