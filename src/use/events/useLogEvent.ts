import { mapMutations } from 'vuex';
import moment from 'moment';

export default () => {
  // maybe replaced by:
  // const addEvent = (event: Record<string, unknown>) => store.commit('events/addEvent', event);
  const { addEvent } = mapMutations('events', ['addEvent']);

  const logEvent = (eventKey: string) => {
    addEvent({
      event_key: eventKey,
      created_at: moment().toISOString(),
    });
  };

  return {
    logEvent,
  };
};
