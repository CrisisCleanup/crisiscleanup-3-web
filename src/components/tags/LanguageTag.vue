<template>
  <tag :style="[styles]" class="tag-item tag--language" v-bind="$attrs">
    {{ language && language.shortName }}
  </tag>
</template>

<script>
import VueTypes from 'vue-types';
import Language from '@/models/Language';
import { theme } from '../../../tailwind.config';

export default {
  name: 'LanguageTag',
  props: {
    languageId: VueTypes.number,
    languageSubtag: VueTypes.string,
  },
  data() {
    return {
      language: null,
    };
  },
  async mounted() {
    if (this.languageSubtag) {
      this.language = await Language.query()
        .where('subtag', this.languageSubtag)
        .first();
    }
    if (!this.language && this.languageId) {
      this.language = await Language.fetchOrFindId(this.languageId);
    }
  },
  computed: {
    styles() {
      if (!this.language) {
        return {
          color: theme.extend.colors['crisiscleanup-grey']['500'],
          borderColor: theme.extend.colors['crisiscleanup-grey']['500'],
        };
      }
      const colorMap = {
        7: {
          color: theme.extend.colors['crisiscleanup-red']['300'],
          borderColor: theme.extend.colors['crisiscleanup-red']['300'],
        },
        2: {
          color: theme.extend.colors['crisiscleanup-lightblue']['400'],
          borderColor: theme.extend.colors['crisiscleanup-lightblue']['400'],
        },
      };
      return colorMap[this.language.id];
    },
  },
};
</script>

<style scoped>
.tag--language {
  line-height: 14px;
}
</style>
