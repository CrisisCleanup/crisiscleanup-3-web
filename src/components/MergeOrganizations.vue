<template>
  <div>
    <base-button
      :text="$t('~~Merge Organizations')"
      :alt="$t('Merge Organizations')"
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
      :title="$t('Merge Organizations')"
      closeable
      @close="
        () => {
          showMergeModal = false;
        }
      "
    >
      <div class="text-justify flex flex-col p-3 justify-center">
        <div>{{ $t('~~Organization To Keep') }}</div>
        <OrganizationSearchInput
          @selectedOrganization="keepOrganization = $event.id"
          include-inactive
          class="w-108"
        />
        <div>{{ $t('~~Organization To Merge') }}</div>
        <OrganizationSearchInput
          @selectedOrganization="mergeOrganization = $event.id"
          include-inactive
          class="w-108"
        />
        <div>{{ $t('~~Reason for merge') }}</div>
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
          :text="$t('Merge Organizations')"
          :alt="$t('Merge Organizations')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>
<script>
import OrganizationSearchInput from '@/components/OrganizationSearchInput';
import { getErrorMessage } from '@/utils/errors';

export default {
  name: 'MergeOrganizations',
  components: { OrganizationSearchInput },
  data() {
    return {
      keepOrganization: null,
      mergeOrganization: null,
      mergeReason: '',
      showMergeModal: false,
    };
  },
  methods: {
    async mergeOrganizations() {
      try {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/organization_merges`,
          {
            organization_keep: this.keepOrganization,
            organization_merged: this.mergeOrganization,
            organization_merged_reason: this.mergeReason,
          },
        );
        await this.$toasted.success(this.$t('~~Merged Organizations'));
        this.showMergeModal = false;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
};
</script>
