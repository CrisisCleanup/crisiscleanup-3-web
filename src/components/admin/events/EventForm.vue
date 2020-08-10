<template>
  <div class="eform h-full w-full">
    <div class="eform__input" v-for="i in Object.keys(inputs)" :key="i">
      <EventFormInput
        :type="i"
        @update:value="(payload) => updateValue(payload)"
      />
    </div>
  </div>
</template>

<script>
// @flow
import EventFormInput from '@/components/admin/events/EventFormInput.vue';
import EventComponent, { EventComponentTypes } from '@/models/EventComponent';
import { reactive, watchEffect } from '@vue/composition-api';
import _ from 'lodash';
import type { EventComponentTypeT } from '@/models/EventComponent';

export default {
  name: 'EventForm',
  components: { EventFormInput },
  setup(props, context) {
    const inputs = reactive(
      _.reduce(
        EventComponentTypes,
        (result, value) => {
          result[value] = null;
          return result;
        },
        {},
      ),
    );

    const updateValue = ([
      type: EventComponentTypeT,
      value: EventComponent,
    ]) => {
      inputs[type] = value;
    };

    watchEffect(() => {
      context.emit('update:inputs', inputs);
    });

    return {
      inputs,
      updateValue,
    };
  },
};
</script>

<style scoped lang="postcss">
.eform {
  @apply p-6;
  &__input {
    lost-row: 1/5;
  }
}
</style>
