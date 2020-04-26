<template>
  <TitledCard :title="cardTitle">
    <div class="flex flex-col flex-grow">
      <div
        v-for="[title, value] in metrics.entries()"
        :key="`metric_${title}`"
        class="metrics--body"
      >
        <hr />
        <div class="flex flex-row justify-between p-2 px-5 metric">
          <div>
            <ccu-icon
              with-text
              v-if="title.includes('Total')"
              :type="icons.phone_plus"
              size="xl"
            >
              <base-text variant="body" :weight="600" class="align-middle">{{
                $t(title)
              }}</base-text>
            </ccu-icon>

            <base-text
              v-if="!title.includes('Total')"
              variant="bodysm"
              :weight="500"
              class="align-middle"
              >{{ title }}</base-text
            >
          </div>
          <base-text variant="h1">{{ value }}</base-text>
        </div>
      </div>
    </div>
  </TitledCard>
</template>

<script>
import VueTypes from 'vue-types';
import { IconsMixin } from '@/mixins';
import TitledCard from './TitledCard.vue';

export default {
  name: 'StatsCard',
  mixins: [IconsMixin],
  components: { TitledCard },
  props: {
    cardTitle: VueTypes.string,
    metrics: VueTypes.object,
  },
};
</script>

<style lang="scss" scoped>
.metrics {
  &--body {
    hr {
      padding: 0;
      margin: 0;
    }
    .metric {
      align-items: center;
      p {
        @apply text-crisiscleanup-dark-400;
      }
    }
  }
}
</style>
