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
      Object.keys(defs).forEach((k) => {
        switch (typeof defs[k]) {
          case 'function':
            lang[k] = (...args) => {
              const result = defs[k](...args);
              return this.$t(result.replace('~~', ''));
            };
            break;
          default:
            lang[k] = this.$t(defs[k].replace('~~', ''));
            break;
        }
      });
      return lang;
    },
  },
};
