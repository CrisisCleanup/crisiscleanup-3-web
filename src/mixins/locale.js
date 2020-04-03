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
      const getTrans = (key) => this.$t(key.replace('~~', ''));
      Object.keys(defs).forEach((k) => {
        switch (typeof defs[k]) {
          case 'function':
            lang[k] = (...args) => {
              const result = defs[k](...args);
              return getTrans(result);
            };
            break;
          case 'array':
            lang[k] = defs[k].map(this.getLang);
            break;
          case 'object':
            lang[k] = this.getLang(defs[k]);
            break;
          default:
            lang[k] = getTrans(defs[k]);
            break;
        }
      });
      return lang;
    },
  },
};

export const LangOverrideMixin = {
  methods: {
    _getOverrideLang(...args) {
      const result = this.$T(...args);
      return result.replace('~~', '');
    },
  },
  created() {
    this.$T = this.$t;
    this.$t = this._getOverrideLang;
  },
};
