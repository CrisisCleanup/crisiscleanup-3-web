<template>
  <modal
    modal-classes="bg-white max-w-2xl shadow"
    :closeable="false"
    @close="$emit('cancel')"
  >
    <div slot="header" class="text-lg border-b p-3">
      {{ $t('~~Change Organization') }}
    </div>
    <div class="p-3">
      <div v-if="page === 'start'">
        <base-text variant="h2" :weight="400" class="text-center">
          {{ $t('~~To where would you want to move?') }}
        </base-text>
        <div class="flex justify-center text-base my-10">
          <div
            class="h-40 w-40 mx-4 border p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-crisiscleanup-light-grey"
            @click="page = 'new'"
          >
            {{ $t('~~Move to new organization') }}
            <ccu-icon size="lg" type="right" class="mt-3" />
          </div>
          <div
            class="h-40 w-40 mx-4 border p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-crisiscleanup-light-grey"
            @click="page = 'existing'"
          >
            {{ $t('~~Move to existing organization') }}
            <ccu-icon size="lg" type="right" class="mt-3" />
          </div>
        </div>
      </div>

      <div v-if="page === 'existing'">
        <tabs class="" ref="tabs">
          <tab name="Select Organization">
            <div class="text-base mt-1 mb-3">
              {{ $t('~~Please select an organization to move to') }}
            </div>
            <OrganizationSearchInput
              @selectedOrganization="selectedOrganization = $event"
              class="w-108"
              size="large"
            />
          </tab>
          <tab
            name="Select Users"
            ref="currentCallTab"
            :disabled="!selectedOrganization"
          >
          </tab>
        </tabs>
      </div>
    </div>
    <div slot="footer" class="flex items-center justify-center py-2 border-t">
      <base-button
        v-if="page === 'start'"
        :text="$t('actions.cancel')"
        :alt="$t('actions.cancel')"
        variant="outline"
        class="px-6 p-3"
        :action="
          () => {
            $emit('cancel');
          }
        "
      >
        {{ $t('actions.cancel') }}
      </base-button>
      <base-button
        v-if="page !== 'start'"
        :text="$t('actions.back')"
        :alt="$t('actions.back')"
        variant="outline"
        class="px-6 p-3 mx-2 w-24"
        :action="
          () => {
            if ($refs.tabs) {
              $refs.tabs.previousTab();
            }
          }
        "
      >
        {{ $t('actions.back') }}
      </base-button>
      <base-button
        v-if="page !== 'start'"
        :text="$t('actions.next')"
        :alt="$t('actions.next')"
        variant="solid"
        class="px-6 p-3 mx-2 w-24"
        :action="
          () => {
            if ($refs.tabs) {
              $refs.tabs.nextTab();
            }
          }
        "
      >
        {{ $t('actions.next') }}
      </base-button>
    </div>
  </modal>
</template>

<script>
import { UserMixin } from '@/mixins';
import OrganizationSearchInput from './OrganizationSearchInput';

export default {
  name: 'ChangeOrganizationModal',
  components: { OrganizationSearchInput },
  mixins: [UserMixin],
  data() {
    return {
      page: 'start',
      selectedOrganization: null,
    };
  },
};
</script>

<style scoped></style>
