<template>
  <div class="eform h-full w-full">
    <div
      class="eform__input"
      v-for="i in Object.values(EventParts)"
      :key="i.name"
    >
      <ModelSelectInput
        label="name_t"
        translate
        v-bind="{ ...i, ...getEventFetchProps(i.type) }"
        @update:value="(payload) => updateValue(payload)"
      />
    </div>
    <div class="eform__input">
      <ModelSelectInput
        name="user_badge"
        :description="$t('~~Badge to appropriate points to')"
        label="name_t"
        model="user_badges"
        @update:value="(payload) => updateValue(payload)"
        translate
      />
    </div>
  </div>
</template>

<script>
// @flow
import ModelSelectInput from '@/components/forms/ModelSelectInput.vue';
import UserBadge from '@/models/UserBadge';
import EventComponent, { EventParts } from '@/models/EventComponent';
import { reactive, watchEffect, onMounted, unref } from '@vue/composition-api';
import _ from 'lodash';

// Form for creating a new event.
export default {
  name: 'EventForm',
  components: { ModelSelectInput },
  setup(props, context) {
    const inputs = reactive(
      _.reduce(
        EventParts,
        (result, value) => {
          result[value.name] = null;
          result.user_badge = null;
          return result;
        },
        {},
      ),
    );

    const getEventFetchProps = (type) => ({
      model: EventComponent,
      resolveFetch: [EventComponent.fetchAllByType, type],
    });

    onMounted(async () => {
      if (!UserBadge.query().exists()) {
        await UserBadge.fetchAll();
      }
    });

    const updateValue = ([part: string, value: EventComponent | UserBadge]) => {
      inputs[unref(part)] = unref(value);
    };

    watchEffect(() => {
      context.emit('update:inputs', inputs);
    });

    return {
      getEventFetchProps,
      inputs,
      updateValue,
      EventParts,
    };
  },
};
</script>

<style scoped lang="postcss">
.eform {
  @apply p-6;
  &__input {
    lost-row: 1/6;
  }
}
</style>
