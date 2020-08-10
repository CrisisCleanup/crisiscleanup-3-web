<template>
  <div class="einput">
    <FormSelect
      searchable
      item-key="id"
      label="key"
      :options="items"
      @input="(value) => onSelected(value)"
      select-classes="bg-white border border-crisiscleanup-dark"
      indicator-icon="caret-down"
      :float-label="type | startCase"
    />
  </div>
</template>

<script>
// @flow
import useSelectEventComponent from '@/use/events/useSelectEventComponent';
import VueTypes from 'vue-types';
import type { EventComponentTypeT } from '@/models/EventComponent';
import { EventComponentTypes } from '@/models/EventComponent';
import FormSelect from '@/components/FormSelect.vue';
import { watchEffect } from '@vue/composition-api';

export type EventFormInputProps = {|
  type: EventComponentTypeT,
  multi?: boolean,
|};

export default {
  name: 'EventFormInput',
  components: { FormSelect },
  props: ({
    type: VueTypes.oneOf(Object.values(EventComponentTypes)),
    multi: VueTypes.bool.def(false),
  }: EventFormInputProps),
  setup({ type, multi }, context) {
    const { items, onSelected, value } = useSelectEventComponent({
      context,
      type,
      multi,
    });

    watchEffect(() => {
      context.emit('update:value', [type, value]);
    });

    return {
      items,
      onSelected,
    };
  },
};
</script>

<style scoped></style>
