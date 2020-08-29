<template>
  <div class="status">
    <modal
      v-if="confirmState.state.value"
      :title="$t('~~Are you sure?')"
      modal-classes="bg-white max-w-md shadow"
      closeable
      @close="confirmState.toggle(false)"
    >
      <div class="modal--body">
        <base-text variant="body">
          {{ $t('~~You have not saved any changes to any worksites yet!') }}
        </base-text>
        <base-text variant="body">
          {{ $t('~~Are you sure you want to close this case?') }}
        </base-text>
      </div>
      <template #footer>
        <div class="modal--footer flex flex-row p-2">
          <base-button
            size="medium"
            variant="solid"
            :action="() => confirmState.toggle(false)"
            >{{ $t('~~Keep Editing') }}</base-button
          >
          <base-button
            size="medium"
            variant="solid"
            :action="() => endContact(true)"
            >{{ $t('~~End Call') }}</base-button
          >
        </div>
      </template>
    </modal>
    <base-text variant="h3">{{ lang.notes }}</base-text>
    <form-select
      class="select"
      :options="selectValues"
      item-key="value"
      label="name_t"
      @input="(value) => updateStatus({ statusId: value })"
      placeholder="Call Status "
    />
    <base-input
      class="notes"
      text-area
      size="large"
      @input="(value) => updateStatus({ notes: value })"
      :placeholder="lang.issuesResolved"
    ></base-input>
    <base-button
      class="save-exit"
      size="large"
      variant="solid"
      :action="() => endContact()"
    >
      {{ $t('~~Save & End Call') }}
    </base-button>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import PhoneStatus from '@/models/PhoneStatus';
import { computed } from '@vue/composition-api';
import useController from '@/use/phone/useController';
import useContact from '@/use/phone/useContact';
import useToggle from '@/use/useToggle';
import useAgent from '@/use/phone/useAgent';

export default {
  name: 'BoardStatus',
  props: {
    lang: VueTypes.any,
  },
  setup(props, context) {
    const { agent } = useAgent();
    const { getters, state, actions } = useController();
    const { currentContact } = useContact({ agent });
    const confirmState = useToggle();

    const endContact = async (force = false) => {
      if (!getters.modifiedCaseIds.value.length && !force) {
        context.root.$log.debug(
          'agent tried to end contact w/o making any changes!',
        );
        confirmState.toggle(true);
      }
      try {
        context.root.$log.info('closing contact!');
        await actions.closeContact({ contact: currentContact.value });
      } catch (e) {
        context.root.$log.debug(e);
        context.root.$toasted.error(context.root.$t(e.message));
      }
    };

    const statuses = computed(() => PhoneStatus.all());
    const selectValues = computed(() =>
      Object.values(statuses.value).map(({ id, status_name_t }) => {
        return {
          value: id,
          name_t: status_name_t,
        };
      }),
    );

    return {
      ...getters,
      ...state,
      ...actions,
      endContact,
      statuses,
      selectValues,
      confirmState,
    };
  },
};
</script>

<style lang="scss">
.board {
  &--grid {
    .grid {
      &--status {
        .status {
          .modal {
            &--body {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              @apply px-8;
            }
            &--footer {
              flex-grow: 1;
              justify-content: space-around;
            }
          }

          @apply px-16 py-12;
          display: flex;
          flex-direction: column;
          p {
            @apply text-crisiscleanup-dark-500 py-3;
          }
          .notes {
            @apply py-3;
            @apply border-crisiscleanup-dark-300 mb-6;
            border: 1px solid;
            outline: none;
            textarea {
              outline: none;
              &:hover,
              &:focus-visible,
              &:focus-within,
              &:focus {
                outline: none;
              }
            }
          }
          .select {
            @apply py-3;
            @apply border-crisiscleanup-dark-300 mb-6;
            border: 1px solid;
          }
        }
      }
    }
  }
}
</style>
