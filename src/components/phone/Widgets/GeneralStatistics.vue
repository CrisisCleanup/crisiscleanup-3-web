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
          <div>
            <ccu-icon
              with-text
              v-if="isTotalWaiting(k)"
              type="phone-plus"
              size="xl"
              :alt="$t('phoneDashboard.total_people_waiting')"
            >
              <base-text
                variant="body"
                :weight="600"
                class="metric-text align-middle"
                >{{ $t(k) }}</base-text
              >
            </ccu-icon>

            <div v-if="!isTotalWaiting(k)" class="inline-flex metric-row">
              <base-text variant="bodysm" :weight="500" class="align-middle">{{
                $t(k)
              }}</base-text>
              <template v-if="getMoreInfo(k)">
                <v-popover trigger="hover">
                  <ccu-icon
                    class="tooltip-target metric-info pl-1"
                    type="information"
                    :alt="$t('phoneDashboard.more_stats_info')"
                    size="tiny"
                  />
                  <template #popover>
                    <div class="tooltip-content max-w-lg">
                      <base-text variant="bodysm">
                        {{ $t(getMoreInfo(k)) }}
                      </base-text>
                    </div>
                  </template>
                </v-popover>
              </template>
            </div>
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
      placeholder: context.root.$t('phoneDashboard.all'),
      options: [
        {
          id: 0,
          shortName: context.root.$t('phoneDashboard.all'),
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
      isTotalWaiting(value) {
        return value === Metrics.TOTAL_WAITING[1];
      },
      onDropdownUpdate(value) {
        if (value === 0) {
          category.value = 'all';
        } else {
          category.value = locales.value.find((l) => l.id === value).subtag;
        }
      },
      getMoreInfo(name) {
        const metricKey = _.findKey(Metrics, ['1', name]);
        return Metrics[metricKey].length >= 3 ? Metrics[metricKey][2] : null;
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
    .metric-info {
      filter: brightness(0.7);
    }
    .metric-row {
      align-items: last baseline;
    }
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
