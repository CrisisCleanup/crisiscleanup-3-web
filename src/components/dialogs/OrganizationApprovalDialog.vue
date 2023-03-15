<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container bg-white flex flex-col justify-between">
          <div class="modal-header flex-shrink">
            <div class="title p-3 flex items-center justify-between border-b">
              <span class="text-base font-bold">{{
                $t('adminOrganization.approve_or_reject')
              }}</span>
              <ccu-icon
                :alt="$t('actions.cancel')"
                size="xs"
                type="cancel"
                @click.native="
                  () => {
                    closeDialog(false);
                  }
                "
              />
            </div>
          </div>

          <div class="modal-body flex-grow p-3">
            <base-select
              :placeholder="$t('orgApprovalTable.give_approve_reason')"
              class="w-auto flex-grow select"
              :options="approveRejectReasons"
              v-model="response.reason"
              item-key="key"
              label="label"
            ></base-select>
            <base-input
              class="my-2"
              text-area
              v-model="response.note"
              :rows="3"
              :placeholder="$t('adminOrganization.rejection_note')"
            />
          </div>

          <div class="modal-footer flex-shrink">
            <div class="flex items-center justify-center py-2 border-t">
              <base-button
                :alt="$t('actions.ok')"
                variant="solid"
                class="px-4 p-2 mx-2"
                :action="
                  () => {
                    closeDialog(response);
                  }
                "
              >
                {{ $t('actions.ok') }}
              </base-button>
              <base-button
                :alt="$t('actions.cancel')"
                class="px-4 p-2 border border-black mx-2"
                :action="
                  () => {
                    closeDialog(false);
                  }
                "
              >
                {{ $t('actions.cancel') }}
              </base-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { closeDialog } from 'vue3-promise-dialog';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'OrganizationApprovalDialog',
  setup() {
    const { t } = useI18n();

    const response = reactive({
      reason: '',
      note: '',
    });

    const approveRejectReasons = [
      'approveRejectReasons.approve_none',
      'approveRejectReasons.approve_public',
      'approveRejectReasons.approve_preliminary',
      'approveRejectReasons.approve_statistics',
      'approveRejectReasons.approve_situational_awareness',
      'approveRejectReasons.approve_coordination',
      'approveRejectReasons.approve_ltr',
      'approveRejectReasons.approve_recovery',
      'approveRejectReasons.approve_academic',
      'approveRejectReasons.approve_waiver',
      'approveRejectReasons.reject_not_reputable',
      'approveRejectReasons.reject_spam',
      'approveRejectReasons.reject_contractor',
      'approveRejectReasons.reject_duplicate',
      'approveRejectReasons.reject_inactive',
      'approveRejectReasons.reject_unresponsive',
      'approveRejectReasons.reject_no_capacity',
      'approveRejectReasons.reject_out_of_scope',
      'approveRejectReasons.reject_survivor',
      'approveRejectReasons.reject_volunteer',
      'approveRejectReasons.reject_withdrawn',
    ].map((key) => {
      return { key, label: t(key) };
    });

    return {
      approveRejectReasons,
      response,
      closeDialog,
    };
  },
});
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  margin: 0 auto;
  transition: all 0.3s ease;
  @apply max-w-lg;
}

.modal-default-button {
  float: right;
}

/*
         * The following styles are auto-applied to elements with
         * transition="modal" when their visibility is toggled
         * by Vue.js.
         *
         * You can easily play with the modal transition by editing
         * these styles.
         */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
