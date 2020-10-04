<template>
  <div class="more-info">
    <!--Info Card-->
    <div class="info">
      <div class="flex flex-col">
        <div class="justify-between flex flex-row m-3">
          <div class="flex flex-col w-1/2">
            <base-text
              variant="h4"
              weight="300"
              class="text-crisiscleanup-grey-800"
              >{{ lang.languages }}</base-text
            >
          </div>
          <div class="flex flex-col">
            <div class="align-left">
              <div class="flex flex-row tags">
                <div
                  v-for="l in languages"
                  :key="`l_${l}`"
                  class="flex flex-col px-2 tag-container"
                >
                  <LanguageTag class="tag-item" :language-id="l.id" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { LangMixin, UserMixin } from '@/mixins';
import LanguageTag from '@/components/tags/LanguageTag.vue';
export default {
  name: 'Info',
  components: { LanguageTag },
  mixins: [UserMixin, LangMixin],
  props: {
    toggleOpen: VueTypes.bool.def(false),
  },
  computed: {
    lang() {
      return this.getLang({
        languages: 'phoneDashboard.languages',
      });
    },
    languages() {
      return this.currentUser.languages;
    },
  },
};
</script>

<style scoped lang="scss">
.more-info {
  @apply bg-crisiscleanup-light-grey;
  margin-left: -24px;
  margin-right: -24px;
}
</style>
