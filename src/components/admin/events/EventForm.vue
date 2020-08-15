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
        :error-detail="fieldErrors[i.name]"
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

    watchEffect(async () => {
      context.emit('update:inputs', inputs);
      if (_.isNil(inputs.actor) || _.isNil(inputs.action)) return;
      const { errors, data } = await Event.validate(eventKeys.value);
      context.root.$log.debug(errors);
      context.root.$log.debug(data);
      _.mapValues(fieldErrors, (invalidations, key: string) => {
        const err = _.get(errors, `${key}_key`, null);
        fieldErrors[key] = err === null ? err : _.first(err);
      });
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
