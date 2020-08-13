<template>
  <div class="epreview">
    <div class="epreview__section">
      <div>
        <base-text variant="h3" class="pb-1">
          {{ $t('~~Key') }}
        </base-text>
        <base-input size="medium" :value="eventData.key" break-glass />
      </div>
      <div>
        <base-text variant="h3" class="pb-1">
          {{ $t('~~Points') }}
        </base-text>
        <number-input
          :attrs="{ style: { maxHeight: '40px' } }"
          class="points"
          center
          inline
          controls
          :min="0"
          v-model="eventData.points"
        />
      </div>
    </div>
    <div class="epreview__section">
      <base-text variant="h3" class="pb-1">
        {{ $t('~~Attributes') }}
      </base-text>
      <ModelSelectInput v-bind="componentAttrProps" multi translate />
    </div>
    <div class="epreview__section">
      <base-text variant="h3" class="pb-1">
        {{ $t('~~Related') }}
      </base-text>
      <Table
        class="border border-1 select-none cursor-pointer"
        hide-header
        :columns="relatedCols"
        :data="relatedEvents"
        :loading="relatedLoading"
      />
    </div>
  </div>
</template>

<script>
// @flow

import VueTypes from 'vue-types';
import { toRefs, reactive, computed, watch } from '@vue/composition-api';
import ModelSelectInput from '@/components/forms/ModelSelectInput.vue';
import EventComponent, { EventComponentTypes } from '@/models/EventComponent';
import useSearchEvents from '@/use/events/useSearchEvents';
import { makeTableColumns } from '@/utils/table';
import Table from '@/components/Table.vue';

// Renders dirty new event data for preview.
export default {
  name: 'EventPreview',
  components: { ModelSelectInput, Table },
  props: {
    // Dirty event key.
    eventKey: VueTypes.string.def(''),
    // Dirty event points.
    eventPoints: VueTypes.number.def(0),
  },
  setup(props, context) {
    const { eventKey, eventPoints } = toRefs(props);

    const eventData = reactive({
      key: eventKey,
      points: eventPoints,
    });

    const componentAttrProps = computed(() => ({
      name: EventComponentTypes.ATTR,
      model: EventComponent,
      resolveFetch: [EventComponent.fetchAllByType, EventComponentTypes.ATTR],
      label: 'name_t',
    }));

    const { loading, items, makeQuery } = useSearchEvents({ context });

    const relatedCols = computed(() => makeTableColumns([['name_t'], ['key']]));
    const relatedEvents = computed(() =>
      items.value.map((e) => e.withTrans<Event>()),
    );

    watch(
      () => eventData.key,
      async () => makeQuery(eventData.key),
      { lazy: true },
    );

    return {
      eventData,
      componentAttrProps,
      relatedEvents,
      relatedCols,
      relatedLoading: loading,
    };
  },
};
</script>

<style scoped lang="postcss">
.epreview {
  @apply h-full w-full p-6;
  lost-flex-container: column;
  &__section {
    @apply h-full w-full;
    lost-row: 1/7;

    &:first-child {
      > div:first-child {
        @apply w-5/6 pr-6;
      }
      &:first-child {
        display: flex;
        flex-direction: row;
        > div:last-child {
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
