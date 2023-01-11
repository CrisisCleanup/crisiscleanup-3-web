import { Model } from '@vuex-orm/core';

export default class EventLog extends Model {
  static entity = 'event_logs';

  static fields() {
    return {
      attr: this.attr(''),
      incident: this.attr(''),
      url: this.attr(''),
      event_key: this.attr({}),
    };
  }

  static apiConfig = {
    actions: {
      create(
        key: string,
        incident: string,
        url: string,
        attr: Record<string, any>,
      ) {
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
    } as any,
  };
}
