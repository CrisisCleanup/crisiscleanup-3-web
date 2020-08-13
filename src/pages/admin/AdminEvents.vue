<template>
  <div class="events__container">
    <div class="events__header">
      <base-text variant="h1" bold>
        {{ $t('~~Event Management') }}
      </base-text>
    </div>
    <div class="events__body">
      <div class="events__search">
        <TitledCard class="search__card" title="~~Event Search">
          <div class="search__container">
            <EventSearchTable />
          </div>
        </TitledCard>
      </div>
      <div class="events__build">
        <TitledCard class="build__input" title="~~Event Builder">
          <EventForm @update:inputs="(payload) => onEventInput(payload)" />
        </TitledCard>
        <TitledCard class="build__preview" title="~~Preview">
          <EventPreview
            :event-key="eventKey"
            :event-points="eventPoints"
            :event-locale="localeData"
          />
        </TitledCard>
      </div>
      <div class="events__locale">
        <TitledCard title="~~Localizations">
          <LocaleForm class="w-full" :fields.sync="localeInputs" />
        </TitledCard>
      </div>
    </div>
  </div>
</template>

<script>
import EventSearchTable from '@/components/admin/events/EventSearchTable.vue';
import TitledCard from '@/components/cards/TitledCard.vue';
import EventForm from '@/components/admin/events/EventForm.vue';
import EventPreview from '@/components/admin/events/EventPreview.vue';
import { ref, computed } from '@vue/composition-api';
import useEventPreview from '@/use/events/useEventPreview';
import LocaleForm from '@/components/forms/LocaleForm';
import { makeLocaleInputs } from '@/utils/form';

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

    const { updateEventKeys, eventKey, eventPoints } = useEventPreview();

    const onEventInput = (inputs) => {
      eventInputs.value = inputs;
      updateEventKeys(eventInputs.value);
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
          prefix: 'event',
        }),
      set: (payload) => {
        _localeInputs.value = payload;
        context.root.$log.debug(payload);
        return payload;
      },
    });

    const localeData = computed(() => _localeInputs.value);

    return {
      eventInputs,
      onEventInput,
      eventKey,
      eventPoints,
      localeInputs,
      localeData,
    };
  },
};
</script>

<style scoped lang="postcss">
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
}

.search {
  &__container {
    @apply h-full w-full m-6;
  }
}
</style>
