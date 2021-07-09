<template>
  <div class="epreview">
    <div class="epreview__section">
      <base-text variant="h3" class="pb-1">
        {{ $t('eventBuilder.event_name') }}
      </base-text>
      <base-text variant="h3" class="pb-1">
        {{ eventName }}
      </base-text>
    </div>
    <div class="epreview__section">
      <div class="relative">
        <base-text variant="h3" class="pb-1">
          {{ $t('eventBuilder.key') }}
        </base-text>
        <div
          class="click-cap h-full w-full absolute z-10"
          @click="onKeyClick"
        />
        <base-input
          class="epreview__key"
          :class="keyError !== null && 'border border-crisiscleanup-red-100'"
          size="medium"
          :value="eventData.key"
          break-glass
        />
        <base-text
          variant="bodyxsm"
          class="text-crisiscleanup-red-900"
          bold
          v-if="keyError !== null"
        >
          {{ $t(keyError) }}
        </base-text>
      </div>
      <div>
        <base-text variant="h3" class="pb-1">
          {{ $t('eventBuilder.points') }}
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
      <ModelSelectInput
        sort-key="name_t"
        v-bind="componentAttrProps"
        multi
        translate
        :selected="requiredAttributes"
        @update:value="(payload) => $emit('update:required-attr', payload)"
      />
    </div>
    <div class="epreview__section">
      <base-text variant="h3" class="pb-1">
        {{ $t('eventBuilder.related') }}
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
import _ from 'lodash';

// Renders dirty new event data for preview.
export default {
  name: 'EventPreview',
  components: { ModelSelectInput, Table },
  props: {
    // Dirty event key.
    eventKey: VueTypes.string.def(''),
    // Dirty event points.
    eventPoints: VueTypes.number.def(0),
    // Dirty event locale(s).
    eventLocale: VueTypes.object,
    // Prepopulated required attributes
    requiredAttr: VueTypes.any.def({}),
    // Field errors
    fieldErrors: VueTypes.any.def([]),
  },
  setup(props, context) {
    const { eventKey, eventPoints, eventLocale, requiredAttr, fieldErrors } =
      toRefs(props);

    const eventData = reactive({
      key: eventKey,
      points: eventPoints,
    });

    const componentAttrProps = computed(() => ({
      name: EventComponentTypes.ATTR,
      model: EventComponent,
      resolveFetch: [EventComponent.fetchAllByType, EventComponentTypes.ATTR],
      label: 'name_t',
      floatLabel: context.root.$t('eventBuilder.attributes'),
    }));

    const requiredAttributes = computed(() =>
      requiredAttr.value !== null ? Object.values(requiredAttr.value) : [],
    );

    const { loading, items, makeQuery } = useSearchEvents({ context });

    const relatedCols = computed(() => makeTableColumns([['name_t'], ['key']]));
    const relatedEvents = computed(() =>
      items.value !== null ? items.value.map((e) => e.withTrans<Event>()) : [],
    );

    const eventName = computed(() => _.get(eventLocale.value, '2.name', ''));
    const keyError = computed(() =>
      fieldErrors.value.key ? fieldErrors.value.key : null,
    );

    const onKeyClick = () => {
      context.root.$copyText(eventData.key);
      context.root.$toasted.success(
        context.root.$t('info.copied_to_clipboard'),
      );
    };

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
      eventName,
      requiredAttributes,
      keyError,
      onKeyClick,
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

    &:nth-child(2) {
      display: flex;
      flex-direction: row;
      > div {
        &:first-child {
          @apply w-5/6 pr-6;
        }
        &:last-child {
          justify-content: flex-end;
        }
      }
    }
  }
  .click-cap {
    &:hover {
      + .epreview__key {
        @apply shadow-outline;
        box-shadow: 0 0 0 3px rgba(254, 206, 9, 0.4);
      }
    }
  }
  &__key {
    transition: box-shadow 250ms easeInOutCirc;
    cursor: pointer;
    &:hover {
      @apply shadow-outline;
      box-shadow: 0 0 0 3px rgba(254, 206, 9, 0.4);
    }
  }
}
</style>
