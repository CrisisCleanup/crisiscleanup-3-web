<template>
  <div class="localeform">
    <Accordion :cards="accordionCards" :active-card.sync="currentCard_">
      <template v-for="ln in accordionCards" v-slot:[ln.key]>
        <div :key="ln.key" class="localeform__card">
          <div v-for="fieldKey in Object.keys(fields)" :key="fieldKey">
            <base-text variant="h4" class="pb-1">{{
              fieldKey | startCase
            }}</base-text>
            <base-input
              class="pb-3"
              placeholder="Translation Key"
              size="medium"
              :value="fields[fieldKey].key"
              break-glass
              @change="(value) => (fields[fieldKey].key = value)"
            />
            <base-input
              class="pb-3"
              placeholder="Value"
              size="medium"
              :value="getValue(ln.key, fieldKey)"
              @change="(value) => setValue(ln.key, fieldKey, value)"
              @blur="() => onFocusLost(ln.key, fieldKey)"
            />
          </div>
        </div>
      </template>
    </Accordion>
  </div>
</template>

<script>
// @flow
import Accordion from '@/components/accordion/Accordion.vue';
import Language from '@/models/Language';
import VueTypes from 'vue-types';
import _ from 'lodash';

export type LocaleFormFieldsT = {
  [key: string]: {
    locale: string | null,
    value: string | null,
    key: string | null,
  },
};

export default {
  name: 'LocaleForm',
  components: { Accordion },
  props: {
    fields: VueTypes.shape<LocaleFormFieldsT>({
      [VueTypes.string]: {
        locale: VueTypes.string,
        value: VueTypes.string,
        key: VueTypes.string,
      },
    }).loose,
  },
  data() {
    return ({
      currentCard_: null,
      fieldData: {},
    }: { currentCard: number | null });
  },
  methods: {
    getValue(localeId: number, fieldKey: string) {
      return _.get(this.fieldData, `${localeId}.${fieldKey}`, '');
    },
    setValue(localeId: number, fieldKey: string, value: string) {
      _.set(this.fieldData, `${localeId}.${fieldKey}`, value);
      this.$emit('update:fields', this.fieldData);
    },
    async onFocusLost(localeId: number, fieldKey: string) {
      this.$log.debug('focus lost on initial card input item!');
      if (localeId === 2) {
        const value = this.getValue(localeId, fieldKey);
        if (_.isNil(value) || _.isEmpty(value)) {
          return;
        }
        this.$log.debug('auto translating:', value);
        await _.mapValues(
          this.allLocales.slice(1, this.allLocales.length),
          async (ln: Language) => {
            const resp = await Language.translateText(ln.id, value);
            this.$log.debug(
              `translated: [${value}] -> (${ln.subtag}) [${resp.translated_text}]`,
            );
            this.setValue(ln.id, fieldKey, resp.translated_text);
          },
        );
      }
    },
  },
  async mounted() {
    const locales = Language.all();
    if (locales.length === 0) {
      await Language.api().get('/languages', {
        dataKey: 'results',
      });
    }
  },
  computed: {
    currentLocale() {
      return Language.query().find(this.currentCard);
    },
    allLocales() {
      return Language.all();
    },
    accordionCards() {
      return this.allLocales.map((ln) => ({
        title: this.$t(ln.name_t),
        key: ln.id,
      }));
    },
    currentCard() {
      return _.isNil(this.currentCard_)
        ? this.allLocales[0].id
        : this.currentCard_;
    },
  },
};
</script>

<style scoped lang="scss">
.localeform {
  &__card {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1rem;
  }
}
</style>
