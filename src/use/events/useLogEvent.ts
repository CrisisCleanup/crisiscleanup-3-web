import { useMutations } from '@u3u/vue-hooks';
import moment from 'moment';

export default () => {
  const { addEvent } = useMutations('events', ['addEvent']);

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
