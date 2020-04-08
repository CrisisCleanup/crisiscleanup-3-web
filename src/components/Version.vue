<template>
  <div class="ccu-version-overlay">
    <base-text variant="h2" :weight="600">
      {{ text | upper }}
    </base-text>
  </div>
</template>

<script>
import { LangMixin } from '@/mixins';
import { version } from '@/../package.json';

export default {
  name: 'Version',
  mixins: [LangMixin],
  computed: {
    text() {
      const buildNum = process.env.VUE_APP_BUILD || '3CAE35B';
      return `${this.lang.text} - v${version}+${buildNum}`;
    },
    lang() {
      return this.getLang({
        text: 'version.crisis_cleanup_preview',
      });
    },
  },
};
</script>

<style lang="scss">
.ccu-version-overlay {
  bottom: 0;
  @apply px-3 py-1;
  z-index: 99999;
  position: fixed;
  p {
    @apply text-gray-700;
    opacity: 0.4;
    z-index: 99999;
    width: 100vw;
    text-align: center;
  }
}
</style>
