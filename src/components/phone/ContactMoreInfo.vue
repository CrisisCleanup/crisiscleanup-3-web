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
                  <tag class="tag-item">{{ l }}</tag>
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
export default {
  name: 'Info',
  mixins: [UserMixin, LangMixin],
  props: {
    toggleOpen: VueTypes.bool.def(false),
  },
  computed: {
    lang() {
      return this.getLang({
        languages: '~~Languages',
      });
    },
    languages() {
      return this.currentUser.languages.map(
        ({ name_t }) => name_t.split(' ')[0],
      );
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

.tags {
  .tag {
    &-container {
      &:first-child {
        @apply text-crisiscleanup-red-300;
        @apply border-crisiscleanup-red-300;
      }
      &:last-child {
        @apply text-crisiscleanup-lightblue-400;
        @apply border-crisiscleanup-lightblue-400;
      }
    }
  }
}
</style>
