import { mapState } from 'vuex';

export const LocaleMixin = {
  mounted() {
    this.$moment.locale(this.language);
    this.$forceUpdate();
  },
  computed: {
    ...mapState('locale', ['language']),
  },
};
