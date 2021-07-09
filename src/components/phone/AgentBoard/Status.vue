<template>
  <div class="status">
    <ModelSelectInput
      :float-label="selectId"
      name="status"
      model="phone_statuses"
      label="status_name_t"
      :selected="status.statusId"
      @update:value="(payload) => onStatusSelect(payload)"
    >
      <template #selected-option="{ option }">
        <base-text variant="h2" :style="{ padding: '0px' }">{{
          option.substatus_name_t ? option.substatus_name_t : ''
        }}</base-text>
      </template>
    </ModelSelectInput>
    <base-text variant="h3">{{ $t('phoneDashboard.notes') }}</base-text>
    <base-input
      class="notes border-crisiscleanup-dark-100"
      input-classes="border-crisiscleanup-dark-100"
      text-area
      size="large"
      :value="status.notes"
      @input="(value) => updateStatus({ notes: value })"
      :placeholder="$t('phoneDashboard.issues_resolved')"
    ></base-input>
    <base-button
      v-if="!hideEndContact"
      class="save-exit"
      size="large"
      variant="solid"
      :action="() => endContact()"
    >
      {{ $t('actions.save_end_call') }}
    </base-button>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { ref } from '@vue/composition-api';
import { unwrap } from '@/utils/wrap';
import useController from '@/use/phone/useController';
import useContact from '@/use/phone/useContact';
import ModelSelectInput from '@/components/forms/ModelSelectInput.vue';
import _ from 'lodash';
import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox.vue';

export default {
  name: 'BoardStatus',
  props: {
    lang: VueTypes.any,
    hideEndContact: VueTypes.bool.def(false),
    selectId: VueTypes.string,
  },
  components: {
    ModelSelectInput,
  },
  setup(props, context) {
    const { getters, state, actions } = useController();
    const { currentContact } = useContact();
    const selectedStatus = ref(null);

    const endContact = async (force = false) => {
      if (!getters.modifiedCaseIds.value.length && !force) {
        context.root.$log.debug(
          'agent tried to end contact w/o making any changes!',
        );
        const confirmDialog = create(MessageBox);
        const resp = await confirmDialog({
          title: context.root.$t('phoneDashboard.are_you_sure'),
          content: context.root.$t(
            'phoneDashboard.confirm_changes_to_worksite',
          ),
          actions: {
            stay: {
              text: context.root.$t('actions.keep_editing'),
              type: 'solid',
            },
            end: {
              text: context.root.$t('actions.end_call'),
              type: 'solid',
            },
          },
        });
        context.root.$log.debug('end contact resp:', resp);
        if (resp !== 'end') {
          return;
        }
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
      const val = _.get(status, 'id', status);
      if (val !== selectedStatus.value) {
        selectedStatus.value = val;
        await actions.updateStatus({ statusId: val });
      }
    };

    return {
      ...getters,
      ...state,
      ...actions,
      selectedStatus,
      endContact,
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
            @apply pb-3;
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
