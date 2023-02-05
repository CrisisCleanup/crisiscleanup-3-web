import moment from 'moment';
import { store } from '@/store';

export default () => {
  const logEvent = (eventKey: string) => {
    store.commit('events/addEvent', {
      event_key: eventKey,
      created_at: moment().toISOString(),
    });
  };

  return {
    logEvent,
  };
};
