<template>
  <div class="events__container">
    <div class="events__header">
      <base-text variant="h1" bold>
        {{ $t('~~Event Management') }}
      </base-text>
    </div>
    <div class="events__body">
      <div class="events__search">
        <TitledCard
          class="search__card"
          :title="$t('adminDashboard.event_search')"
        >
          <div class="search__container">
            <EventSearchTable />
          </div>
        </TitledCard>
      </div>
      <div class="events__build">
        <TitledCard
          class="build__input"
          :title="$t('adminDashboard.event_builder')"
        >
          <EventForm
            @update:inputs="(payload) => onEventInput(payload)"
            :event-key.sync="eventKey"
            :field-errors.sync="fieldErrors"
            @update:required-attr="(payload) => onAttrOverride(payload)"
          />
        </TitledCard>
        <TitledCard
          class="build__preview"
          :title="$t('adminDashboard.preview')"
        >
          <EventPreview
            :event-key="eventKey"
            :event-points="eventPoints"
            :event-locale="localeData"
            :required-attr="eventInputs.required_attr"
            :field-errors="fieldErrors"
            @update:required-attr="(payload) => onAttrOverride(payload)"
          />
        </TitledCard>
      </div>
      <div class="events__locale">
        <TitledCard :title="$t('adminDashboard.localizations')">
          <LocaleForm class="w-full" :fields.sync="localeInputs" />
        </TitledCard>
      </div>
    </div>
    <div class="events__footer">
      <div>
        <base-button :action="onSubmit" size="lg" variant="solid">{{
          $t('actions.save')
        }}</base-button>
      </div>
    </div>
  </div>
</template>

<script>
import EventSearchTable from '@/components/admin/events/EventSearchTable.vue';
import TitledCard from '@/components/cards/TitledCard.vue';
import EventForm from '@/components/admin/events/EventForm.vue';
import EventPreview from '@/components/admin/events/EventPreview.vue';
import { ref, computed, unref } from '@vue/composition-api';
import useEventPreview from '@/use/events/useEventPreview';
import LocaleForm from '@/components/forms/LocaleForm';
import { makeLocaleInputs } from '@/utils/form';
import _ from 'lodash';
import Event from '@/models/Event';
import { unwrap } from '@/utils/wrap';

export default {
  name: 'AdminEvents',
  components: {
    LocaleForm,
    EventSearchTable,
    TitledCard,
    EventForm,
    EventPreview,
  },
  setup(props, context) {
    const eventInputs = ref({});
    const _localeInputs = ref({});
    const eventKey = ref('');
    const fieldErrors = ref({});
    const { updateEventKeys, eventPoints } = useEventPreview();

    const onEventInput = (inputs) => {
      eventInputs.value = inputs;
      updateEventKeys(eventInputs.value);
    };

    const onAttrOverride = ([, value]) => {
      if (!value) return;
      const _value = unref(value);
      if (!_value) return;
      eventInputs.value.required_attr = {};
      _value.map((attr) => {
        eventInputs.value.required_attr[attr.id] = attr;
        return eventInputs;
      });
    };

    const localeInputs = computed({
      get: () =>
        makeLocaleInputs({
          inputs: [
            'name',
            'description:d',
            'past_tense:pt',
            'present_progressive:ppt',
          ],
          base: eventKey.value,
          prefix: 'events',
        }),
      set: (payload) => {
        _localeInputs.value = payload;
        context.root.$log.debug(payload);
        return payload;
      },
    });

    const localeData = computed(() => _localeInputs.value);

    const getEventTranslations = (inputs, data) =>
      _.transform(
        inputs,
        (results, inputValue, inputKey) => {
          _.map(data, (value, key) =>
            results.push({
              label: inputValue.key,
              text: value[inputKey],
              language: key,
            }),
          );
        },
        [],
      );

    const onSubmit = async () => {
      const eventTranslations = getEventTranslations(
        unwrap(localeInputs),
        unwrap(localeData),
      );
      let localeKeys = _.mapValues(unwrap(localeInputs), 'key');
      localeKeys = _.mapKeys(localeKeys, (value, key) => `${key}_t`);
      const {
        actor,
        action,
        subaction,
        patient,
        recipient,
        user_badge,
        required_attr,
      } = unwrap(eventInputs);
      let data = {};
      let badge_key = _.get(user_badge, 'key', null);
      badge_key = badge_key === -1 ? null : badge_key;
      try {
        data = {
          key: unwrap(eventKey),
          required_attr: Object.values(required_attr || {}).map((a) => a.key),
          points: unwrap(eventPoints),
          actor_key: actor.key,
          action_key: action.key,
          subaction_key: _.get(subaction, 'key', null),
          patient_key: _.get(patient, 'key', null),
          recipient_key: _.get(recipient, 'key', null),
          badge_key,
          localizations: eventTranslations,
          ...localeKeys,
        };
      } catch (e) {
        console.error(e);
        context.root.$toasted.error(e);
        return;
      }
      context.root.$log.info('creating new event:', data);
      const resp = await Event.createNew(data);
      context.root.$log.debug(resp);
      context.root.$toasted.success(context.root.$t('Success!'));
      eventInputs.value = {};
      _localeInputs.value = {};
      eventKey.value = '';
    };

    return {
      eventInputs,
      onEventInput,
      eventKey,
      eventPoints,
      localeInputs,
      localeData,
      onAttrOverride,
      fieldErrors,
      onSubmit,
    };
  },
};
</script>

<style scoped lang="postcss">
$neg-container-y-pad: calc(0rem - theme('spacing.6'));
$neg-container-x-pad: calc(0rem - theme('spacing.12'));

.events {
  &__container {
    lost-flex-container: column;
    @apply w-full bg-crisiscleanup-light-grey p-6;
  }
  &__header {
    lost-row: 1/22;
  }
  &__body {
    @apply h-full w-full;
    lost-flex-container: column;
    > div {
      lost-row: 1/2;
    }
  }
  &__build {
    @apply h-full;
    lost-flex-container: row;
    > div {
      lost-column: 1/2;
    }
  }
  &__locale {
    @apply h-full w-full;
    lost-flex-container: column;
    > div {
      lost-row: 1/1;
    }
  }
  &__footer {
    @apply bg-white p-6;
    display: flex;
    justify-content: flex-end;
    margin: theme('spacing.6') $neg-container-x-pad $neg-container-y-pad
      $neg-container-x-pad;
  }
}

.search {
  &__container {
    @apply h-full w-full m-6;
  }
}
</style>
