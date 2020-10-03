<template>
  <TitledCard
    :title="$t('phoneDashboard.general_statistics')"
    class="agent-metrics"
    :loading="genMetrics === null"
    :dropdown="dropdownProps"
    @update:dropdown="onDropdownUpdate"
  >
    <div v-if="genMetrics !== null" class="flex flex-grow flex-col">
      <div
        v-for="k in Object.keys(genMetrics)"
        :key="`metric_${k}_${category}_${genMetrics[k]}`"
        class="metrics--body"
      >
        <hr />
        <div
          class="flex flex-row justify-between p-2 px-5 metric"
          :class="isCritical && 'critical'"
        >
          <div> <!-- TO DO: This section includes a test for the English word, "Total". This should be removed -->
            <ccu-icon
              with-text
              v-if="k.includes('Total')"
              type="phone-plus"
              size="xl"
              :title="$t('phoneDashboard.total_people_waiting')"
            >
              <base-text
                variant="body"
                :weight="600"
                class="metric-text align-middle"
                >{{ $t(k) }}</base-text
              ><!-- TO DO: This component translates a non-translated string. This should be removed -->
            </ccu-icon>

            <base-text
              v-if="!k.includes('Total')"
              variant="bodysm"
              :weight="500"
              class="align-middle"
              >{{ $t(k) }}</base-text
            ><!-- TO DO: This component translates a non-translated string. This should be removed -->
            <!-- TO DO: This section includes a test for the English word, "Total". This should be removed -->
          </div>
          <base-text :key="`${k}_${category}_${genMetrics[k]}`" variant="h1">{{
            genMetrics[k]
          }}</base-text>
        </div>
      </div>
    </div>
  </TitledCard>
</template>

<script>
import useUser from '@/use/user/useUser';
import usePhoneMetrics from '@/use/phone/usePhoneMetrics';
import { Metrics } from '@/store/modules/phone/controller';
import { useIntervalFn } from '@vueuse/core';
import TitledCard from '@/components/cards/TitledCard.vue';
import {
  ref,
  onMounted,
  reactive,
  set,
  watch,
  computed,
} from '@vue/composition-api';
import { useState } from '@u3u/vue-hooks';
import _ from 'lodash';

export default {
  name: 'GeneralStatistics',
  components: { TitledCard },
  setup(props, context) {
    const category = ref('all');
    const isCritical = ref(false);
    const { updateGenMetrics, locales, loading } = usePhoneMetrics();

    useIntervalFn(
      async () => {
        await updateGenMetrics();
      },
      31000,
      true,
    );

    onMounted(() => updateGenMetrics());

    const dropdownProps = reactive({
      label: 'shortName',
      itemKey: 'id',
      value: 0,
      placeholder: context.root.$t('phoneDashboard.all_remaining_callbacks'),
      options: [
        {
          id: 0,
          shortName: context.root.$t('phoneDashboard.all_remaining_callbacks'),
        },
      ],
    });

    watch(
      () => locales.value,
      () => {
        if (dropdownProps.options.length === 1) {
          set(dropdownProps, 'options', [
            ...dropdownProps.options,
            ...locales.value.map((l) => ({
              id: l.id,
              shortName: l.shortName,
            })),
          ]);
        }
      },
    );

    const state = {
      ...useState('phone.controller', ['metrics', 'loading']),
    };

    const metricOrder = [
      Metrics.CONTACTS_QUEUED,
      Metrics.CALLBACKS_QUEUED,
      Metrics.CALLDOWNS_QUEUED,
      Metrics.TOTAL_WAITING,
      Metrics.ONLINE,
      Metrics.AVAILABLE,
      Metrics.AGENTS_ON_CALL,
      Metrics.NEEDED,
    ];

    const genMetrics = computed(() => {
      if (!state.loading.value.generalMetrics) {
        const metrics = state.metrics.value[category.value];
        if (!metrics) {
          return null;
        }
        const _metrics = {};
        metricOrder.map((m) => {
          _metrics[m[1]] = metrics[m[0]];
          return m;
        });
        const needed = _.get(metrics, Metrics.NEEDED[0], 0);
        if (needed > 5) {
          isCritical.value = true;
        }
        return _metrics;
      }
      return null;
    });

    return {
      ...useUser(),
      dropdownProps,
      locales,
      category,
      loading,
      genMetrics,
      isCritical,
      onDropdownUpdate(value) {
        if (value === 0) {
          category.value = 'all';
        } else {
          category.value = locales.value.find((l) => l.id === value).subtag;
        }
      },
    };
  },
};
</script>

<style lang="postcss" scoped>
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
    &:nth-child(1) {
      @apply bg-scripts-inbound;
    }
    &:nth-child(2) {
      @apply bg-scripts-outbound;
    }
    &:nth-child(3) {
      @apply bg-scripts-calldown;
    }
    &:nth-child(4) {
      .metric {
        @apply bg-crisiscleanup-light-grey;
        div p {
          @apply text-crisiscleanup-dark-500;
        }
        p {
          @apply text-crisiscleanup-red-400;
        }
      }
    }
    &:last-child {
      .metric.critical {
        div p {
          @apply text-crisiscleanup-dark-500;
          font-weight: 700 !important;
          animation: none;
        }
        p {
          @apply text-crisiscleanup-red-400 font-bold;
          animation: pulse 2s infinite;
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
