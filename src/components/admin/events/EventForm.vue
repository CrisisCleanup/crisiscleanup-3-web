<template>
  <div class="eform h-full w-full">
    <div
      class="eform__input"
      v-for="i in Object.values(EventParts)"
      :key="i.name"
    >
      <ModelSelectInput
        label="name_t"
        sort-key="name_t"
        translate
        :error-detail="fieldErrors[i.name]"
        v-bind="{ ...i, ...getEventFetchProps(i.type) }"
        @update:value="(payload) => updateValue(payload)"
      >
        <template #option="{ option }">
          <base-text variant="h3">{{ option.name_t }}</base-text>
          <base-text variant="h4" regular>{{ option.key }}</base-text>
        </template>
      </ModelSelectInput>
    </div>
    <div class="eform__input">
      <ModelSelectInput
        name="user_badge"
        sort-key="name_t"
        :description="$t('eventBuilder.give_points_to_badge')"
        label="name_t"
        model="user_badges"
        @update:value="(payload) => updateValue(payload)"
        translate
        :options="
          (options) => [...options, { id: -1, name_t: $t('eventBuilder.none') }]
        "
      >
        <template #option="{ option }">
          <base-text variant="h3">{{ option.name_t }}</base-text>
          <base-text variant="h4" regular>{{ option.key }}</base-text>
        </template>
      </ModelSelectInput>
    </div>
  </div>
</template>

<script>
// @flow
import ModelSelectInput from '@/components/forms/ModelSelectInput.vue';
import UserBadge from '@/models/UserBadge';
import EventComponent, {
  EventComponentTypes,
  EventParts,
} from '@/models/EventComponent';
import {
  reactive,
  ref,
  watchEffect,
  onMounted,
  computed,
} from '@vue/composition-api';
import _ from 'lodash';
import Event from '@/models/Event';
import { unwrap } from '@/utils/wrap';

// Form for creating a new event.
export default {
  name: 'EventForm',
  components: { ModelSelectInput },
  setup(props, context) {
    const keyParts = _.reduce(
      EventParts,
      (result, value) => {
        result[value.name] = null;
        result.key = null;
        result.user_badge = null;
        return result;
      },
      {},
    );

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
    const _eventKey = ref('');

    const fieldErrors = reactive(keyParts);

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
      inputs[unwrap(part)] = unwrap(value);
    };

    const eventKeys = computed(() =>
      _.transform(
        inputs,
        (result, value, key) => {
          result[`${key}_key`] = value ? value.key : null;
        },
        {},
      ),
    );

    const eventKey = computed(() => _eventKey.value);

    const clearForm = () => {
      context.root.$log.debug('all inputs are empty, clearing!');
      _.mapValues(fieldErrors, (invalidation, key) => {
        fieldErrors[key] = null;
      });
      context.emit('update:required-attr', [EventComponentTypes.ATTR, []]);
      context.emit('update:event-key', '');
    };

    watchEffect(async () => {
      context.emit('update:inputs', inputs);
      const keyInputs = _.omit(unwrap(inputs), ['required_attr']);
      context.root.$log.debug('key inputs', keyInputs);
      if (!_.some(keyInputs)) {
        clearForm();
        return;
      }
      const { errors, data } = await Event.validate(eventKeys.value);
      context.root.$log.debug(errors);
      context.root.$log.debug(data);
      _.mapValues(fieldErrors, (invalidations, key: string) => {
        const _key = key === 'key' ? key : `${key}_key`;
        const err = _.get(errors, _key, null);
        fieldErrors[key] = err === null ? err : _.first(err);
      });
      context.emit('update:field-errors', fieldErrors);
      const eKey = _.get(data, 'key', null);
      const reqAttr = _.get(data, 'required_attr', []);
      if (eKey) {
        _eventKey.value = eKey;
        context.emit('update:event-key', eventKey.value);
      }
      if (reqAttr) {
        const _reqAttr = [];
        reqAttr.map((attr) => {
          _reqAttr.push(
            EventComponent.query()
              .where('key', attr)
              .first()
              .withTrans<Event>(),
          );
          return _reqAttr;
        });
        context.emit('update:required-attr', [
          EventComponentTypes.ATTR,
          _reqAttr,
        ]);
      }
    });

    return {
      getEventFetchProps,
      inputs,
      updateValue,
      EventParts,
      fieldErrors,
      eventKey,
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
