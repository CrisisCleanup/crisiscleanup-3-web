import type { Config, Request } from '@vuex-orm/plugin-axios';
import CCUModel from '@/models/base';

// Note: Api model of EventLog contains a lot of fields not being used in the web model.
// To be updated by auto generated sdk in the future.
export default class EventLog extends CCUModel {
  static entity = 'event_logs';

  static apiConfig: Config = {
    actions: {
      async create(
        key: string,
        incident: string,
        url: string,
        attr: Record<string, any>,
      ) {
        return (this as Request).post(
          `/event_logs`,
          {
            event_key: key,
            incident,
            url,
            attr,
          },
          {
            save: false,
          },
        );
      },
    },
  };

  static fields() {
    return {
      attr: this.attr(''),
      incident: this.attr(''),
      url: this.attr(''),
      event_key: this.attr({}),
    };
  }

  event_key!: string;
  incident!: number;
  event_last_event_log!: EventLog;
  event_seconds_since_last_event!: number;
  actor_key!: string;
  actor_id!: number;
  actor_model!: string;
  actor_external_id!: string;
  actor_external_resource!: string;
  actor_last_event_log!: EventLog;
  actor_seconds_since_last_event!: number;
  actor_timer_is_active!: boolean;
  actor_location!: string;
  actor_location_name!: string;
  actor_location_area!: string;
  actor_blurred_location!: string;
  actor_organization!: string;
  action_key!: string;
}
