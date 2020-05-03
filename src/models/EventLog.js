import { Model } from '@vuex-orm/core';

export default class EventLog extends Model {
  static entity = 'event_logs';

  static fields() {
    return {
      attr: this.attr(),
      incident: this.attr(),
      url: this.attr(),
      event_key: this.attr(),
    };
  }

  static apiConfig = {
    actions: {
      create(key, incident, url, attr) {
        return this.post(
          `/event_logs`,
          {
            event_key: key,
            incident,
            url,
            attr,
          },
          { save: false },
        );
      },
    },
  };
}
