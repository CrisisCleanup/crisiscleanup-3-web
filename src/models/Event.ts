/**
 * Event Model
 */
import Logger from '@/utils/log';
import CCUModel from '@/models/model';
import { Localized } from '@/models/decorators';
type EventType = {
  id: number;
  key: string;
  actor_model: string;
  patient_model: string;
  recipient_model: string;
  name_t: string;
  description_t: string;
  past_tense_t: string;
  present_progressive_t: string;
  required_attr: string[];
  points: number;
  badge_key: string;
  total_uses: number;
  last_used_at: Date;
  actor_key: string;
  action_key: string;
  subaction_key: string | null;
  recipient_key: string | null;
  invalidated_at: Date | null;
  created_at: Date;
  updated_at: Date;
};
type EventValidationResponse = {
  errors: Record<string, string[]>;
  data: EventType & {
    attr: Record<string, string>;
  };
};
type SuggestedEventItem = {
  text: string;
  length: number;
  offset: number;
  _score: number;
  _source: {
    id: number;
    key: string;
  };
};
type SuggestedEvent = {
  /* Input Text */
  text: string;
  options: SuggestedEventItem[];
};
type SuggestedEventResponse = {
  key_suggest?: SuggestedEvent[];
  badge_key_suggest?: SuggestedEvent[];
};
type EventSearchResult = {
  id: number;
  key: string;
  name: string;
};
type EventSearchQueryT = {
  count: number;
  next: string | null;
  previous: string | null;
  facets: any;
  results: EventSearchResult[];
};
const Log = Logger({
  name: 'events.store',
});

@Localized
class Event extends CCUModel<EventType> {
  static entity = 'events';

  static fields() {
    return {
      id: this.number(0),
      key: this.string(''),
      actor_model: this.string(''),
      patient_model: this.string(''),
      recipient_model: this.string(''),
      name_t: this.string(''),
      description_t: this.string(''),
      past_tense_t: this.string(''),
      present_progressive_t: this.string(''),
      required_attr: this.attr([]),
      points: this.number(0),
      badge_key: this.string(''),
      total_uses: this.number(0),
      last_used_at: this.attr('', (value) => Date.parse(value)),
      actor_key: this.string(''),
      action_key: this.string(''),
      subaction_key: this.string(''),
      recipient_key: this.string(''),
      invalidated_at: this.attr('', (value) => Date.parse(value)),
      created_at: this.attr('', (value) => Date.parse(value)),
      updated_at: this.attr('', (value) => Date.parse(value)),
    };
  }

  /**
   * Fetch auto completions from partial key.
   * @param partialKey - key to fetch suggestions for.
   * @param field - field to search for.
   * @returns {Promise<Array<{ id: number, value: string, ... }>>}
   */
  static async getCompletions(
    partialKey: string,
    field: string,
  ): Promise<
    Array<{
      id: number;
      value: string;
    }>
  > {
    Log.debug(`fetching completions for: ${partialKey} in field: ${field}`);
    const {
      response: { data },
    }: {
      response: {
        data: SuggestedEventResponse;
      };
    } = await this.api().get(`/events_search/functional_suggest`, {
      save: false,
      params: {
        [`${field}_suggest`]: partialKey,
      },
    });
    const resp: SuggestedEvent = data[`${field}_suggest`].pop();
    return resp.options.map<{
      id: number;
      value: string;
    }>((o: SuggestedEventItem) => ({
      id: o._source.id,
      value: o.text,
    }));
  }

  /**
   * Perform a compound search of events by key and name.
   * @param query - query to search by.
   * @param limit - limit return count. Defaults to 10.
   * @returns {Promise<[EventSearchResult]>}
   */
  static async search(query: string, limit: number = 10) {
    const {
      response: { data },
    }: {
      response: {
        data: EventSearchQueryT;
      };
    } = await this.api().get('/events_search', {
      save: false,
      params: {
        search: query,
        limit,
      },
    });
    return data.results;
  }

  /**
   * Validate partial event item against api.
   * @param query - partial event item.
   * @returns {Promise<EventValidationResponse>} - Broken constrains and completions.
   */
  static async validate(query: EventType): Promise<EventValidationResponse> {
    const {
      response: { data },
    }: {
      response: {
        data: EventValidationResponse;
      };
    } = await this.api().post('/events/validate', query, {
      save: false,
    });
    return data;
  }

  /**
   * Publish new event to api.
   * @param payload - event payload.
   * @returns {Promise<*>}
   */
  static async createNew(payload: EventType) {
    return this.api().post('/events', payload);
  }
}

export default Event;
