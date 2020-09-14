<template>
  <TitledCard
    title="~~General Statistics"
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
        <div class="flex flex-row justify-between p-2 px-5 metric">
          <div>
            <ccu-icon
              with-text
              v-if="k.includes('Total')"
              type="phone-plus"
              size="xl"
            >
              <base-text variant="body" :weight="600" class="align-middle">{{
                $t(k)
              }}</base-text>
            </ccu-icon>

            <base-text
              v-if="!k.includes('Total')"
              variant="bodysm"
              :weight="500"
              class="align-middle"
              >{{ $t(k) }}</base-text
            >
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

export default {
  name: 'GeneralStatistics',
  components: { TitledCard },
  setup(props, context) {
    const category = ref('all');
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
      placeholder: context.root.$t('~~All'),
      options: [
        {
          id: 0,
          shortName: context.root.$t('~~All'),
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
    &:nth-child(-n + 4) {
      @apply bg-crisiscleanup-light-grey;
    }
    &:nth-child(4) {
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
