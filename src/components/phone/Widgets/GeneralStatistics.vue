<template>
  <div class="bg-white shadow-crisiscleanup-card agent-metrics">
    <div class="flex bg-white metrics--title">
      <base-text variant="body" weight="700" class="p-5">{{
        $t('~~General Statistics')
      }}</base-text>
    </div>
    <div
      v-for="[title, value] in generalMetrics.entries()"
      :key="`metric_${title}`"
      class="metrics--body"
    >
      <hr />
      <div class="flex flex-row justify-between p-2 px-5 metric">
        <div>
          <ccu-icon
            with-text
            v-if="title.includes('Total')"
            type="phone-plus"
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
            >{{ $t(title) }}</base-text
          >
        </div>
        <base-text variant="h1">{{ value }}</base-text>
      </div>
    </div>
  </div>
</template>

<script>
import useUser from '@/use/user/useUser';
import usePhoneMetrics from '@/use/phone/usePhoneMetrics';
import { Metrics } from '@/store/modules/phone/controller';
import { useIntervalFn } from '@vueuse/core';

export default {
  name: 'AgentAnalyticsCard',
  setup() {
    const { generalMetrics, updateGenMetrics } = usePhoneMetrics({
      metrics: [
        Metrics.CONTACTS_QUEUED,
        Metrics.CALLBACKS_QUEUED,
        Metrics.CALLDOWNS_QUEUED,
        Metrics.TOTAL_WAITING,
        Metrics.ONLINE,
        Metrics.AVAILABLE,
        Metrics.AGENTS_ON_CALL,
        Metrics.NEEDED,
      ],
    });

    useIntervalFn(
      async () => {
        await updateGenMetrics();
      },
      20000,
      true,
    );

    return {
      ...useUser(),
      generalMetrics,
    };
  },
};
</script>

<style lang="scss" scoped>
.agent-metrics .metrics {
  &--title {
    p {
      @apply text-crisiscleanup-dark-400;
    }
  }
  &--body {
    hr {
      padding: 0;
      margin: 0;
    }
    &:nth-child(-n + 5) {
      @apply bg-crisiscleanup-light-grey;
    }
    &:nth-child(5) {
      .metric {
        div p {
          @apply text-crisiscleanup-dark-500;
        }
        p {
          @apply text-crisiscleanup-red-400;
        }
      }
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
