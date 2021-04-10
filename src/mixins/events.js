import { mapMutations } from 'vuex';
import VueTypes from 'vue-types';

export default {
  props: {
    ccuEvent: VueTypes.string,
  },
  methods: {
    ...mapMutations('events', ['addEvent']),
    logEvent(eventKey = null) {
      if (eventKey || this.ccuEvent) {
        this.addEvent({
          event_key: eventKey || this.ccuEvent,
          created_at: this.$moment().toISOString(),
        });
      }
    },
  },
};
