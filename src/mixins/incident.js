import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('incident', ['currentIncident']),
  },
};
