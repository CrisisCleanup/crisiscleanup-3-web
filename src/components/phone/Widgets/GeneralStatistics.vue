<template>
  <TitledCard
    title="~~General Statistics"
    class="agent-metrics"
    :dropdown="dropdownProps"
    @update:dropdown="onDropdownUpdate"
  >
    <div class="flex flex-grow flex-col">
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
  </TitledCard>
</template>

<script>
import useUser from '@/use/user/useUser';
import usePhoneMetrics from '@/use/phone/usePhoneMetrics';
import { Metrics } from '@/store/modules/phone/controller';
import { useIntervalFn } from '@vueuse/core';
import TitledCard from '@/components/cards/TitledCard.vue';
import { ref, onBeforeMount, reactive, set, watch } from '@vue/composition-api';

export default {
  name: 'GeneralStatistics',
  components: { TitledCard },
  setup(props, context) {
    const category = ref('all');
    const { generalMetrics, updateGenMetrics, locales } = usePhoneMetrics({
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
      category,
    });

    useIntervalFn(
      async () => {
        await updateGenMetrics();
      },
      31000,
      true,
    );

    onBeforeMount(() => updateGenMetrics());

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

    return {
      ...useUser(),
      generalMetrics,
      dropdownProps,
      locales,
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
