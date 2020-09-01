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
    <ModelSelectInput
      name="status"
      model="phone_statuses"
      label="status_name_t"
      @update:value="(payload) => onStatusSelect(payload)"
    />
    <base-input
      class="notes border-crisiscleanup-dark-100"
      input-classes="border-crisiscleanup-dark-100"
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
import { ref } from '@vue/composition-api';
import { unwrap } from '@/utils/wrap';
import useController from '@/use/phone/useController';
import useContact from '@/use/phone/useContact';
import useToggle from '@/use/useToggle';
import useAgent from '@/use/phone/useAgent';
import ModelSelectInput from '@/components/forms/ModelSelectInput.vue';

export default {
  name: 'BoardStatus',
  props: {
    lang: VueTypes.any,
  },
  components: {
    ModelSelectInput,
  },
  setup(props, context) {
    const { agent } = useAgent();
    const { getters, state, actions } = useController();
    const { currentContact } = useContact({ agent });
    const confirmState = useToggle();
    const selectedStatus = ref(null);

    const endContact = async (force = false) => {
      if (!getters.modifiedCaseIds.value.length && !force) {
        context.root.$log.debug(
          'agent tried to end contact w/o making any changes!',
        );
        confirmState.toggle(true);
        return;
      }
      try {
        context.root.$log.info('closing contact!');
        await actions.closeContact({ contact: currentContact.value });
      } catch (e) {
        context.root.$log.debug(e);
        context.root.$toasted.error(context.root.$t(e.message));
      }
    };

    const onStatusSelect = async ([, obj]) => {
      const status = unwrap(obj);
      if (status && status.id !== selectedStatus.value) {
        selectedStatus.value = status.id;
        await actions.updateStatus({ statusId: status.id });
      }
    };

    return {
      ...getters,
      ...state,
      ...actions,
      selectedStatus,
      endContact,
      confirmState,
      onStatusSelect,
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
            @apply border-crisiscleanup-dark-100 mb-6;
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
            @apply border-crisiscleanup-dark-100 mb-6;
            border: 1px solid;
          }
        }
      }
    }
  }
}
</style>
