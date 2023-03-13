<template>
  <div>
    <base-button
      :text="$t('mergeOrganizations.merge_organizations')"
      :alt="$t('mergeOrganizations.merge_organizations')"
      variant="solid"
      size="medium"
      :action="
        () => {
          showMergeModal = true;
        }
      "
    />
    <modal
      v-if="showMergeModal"
      modal-classes="bg-white max-w-md shadow"
      :title="$t('mergeOrganizations.merge_organizations')"
      closeable
      @close="
        () => {
          showMergeModal = false;
        }
      "
    >
      <div class="text-justify flex flex-col p-3 justify-center">
        <div>{{ $t('mergeOrganizations.organization_keep') }}</div>
        <OrganizationSearchInput
          @selectedOrganization="keepOrganization = $event.id"
          include-inactive
          class="w-108"
        />
        <div>{{ $t('mergeOrganizations.organization_merge') }}</div>
        <OrganizationSearchInput
          @selectedOrganization="mergeOrganization = $event.id"
          include-inactive
          class="w-108"
        />
        <div>{{ $t('mergeOrganizations.merge_reason') }}</div>
        <textarea
          v-model="mergeReason"
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-2 resize-none w-108"
          rows="4"
        />
      </div>
      <div slot="footer" class="p-3 flex justify-end">
        <base-button
          :text="$t('actions.cancel')"
          :alt="$t('actions.cancel')"
          class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
          :action="
            () => {
              showMergeModal = false;
            }
          "
        />
        <base-button
          variant="solid"
          :action="mergeOrganizations"
          :text="$t('mergeOrganizations.merge_organizations')"
          :alt="$t('mergeOrganizations.merge_organizations')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>
<script lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { getErrorMessage } from '../../utils/errors';
import OrganizationSearchInput from '../OrganizationSearchInput.vue';

export default {
  name: 'MergeOrganizations',
  components: { OrganizationSearchInput },
  setup() {
    const { t } = useI18n();
    const $toasted = useToast();

    const keepOrganization = ref(null);
    const mergeOrganization = ref(null);
    const showMergeModal = ref(false);
    const mergeReason = ref('');

    async function mergeOrganizations() {
      try {
        await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/organization_merges`,
          {
            organization_keep: keepOrganization.value,
            organization_merged: mergeOrganization.value,
            organization_merged_reason: mergeReason.value,
          },
        );
        await $toasted.success(t('mergeOrganizations.merge_successful'));
        showMergeModal.value = false;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    return {
      keepOrganization,
      mergeOrganization,
      mergeReason,
      showMergeModal,
      mergeOrganizations,
    };
  },
};
</script>
