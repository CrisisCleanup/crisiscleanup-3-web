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

export const LangMixin = {
  methods: {
    getLang(defs) {
      const lang = {};
      Object.keys(defs).forEach(k => {
        lang[k] = this.$t(defs[k]);
      });
      return lang;
    },
  },
};
