<template>
  <div>
    <modal
      v-if="showingModal"
      closeable
      modal-classes="bg-white max-w-md shadow"
      :title="$t('databaseAccess.add_ip_to_db')"
      @close="showingModal = false"
      @ok="saveAccess"
    >
      <div class="p-3">
        <div class="my-3">
          {{ $t('databaseAccess.add_ip_to_db_for_rds') }}
        </div>
        <div>
          <tag-input
            v-model="addresses"
            v-model:tags="addressesToAdd"
            :placeholder="$t('databaseAccess.add_ip')"
            :add-on-key="[13, 32, ',']"
            :separators="[';', ',', ', ']"
            @tags-changed="(newTags: string[]) => (addressesToAdd = newTags)"
          />
        </div>
      </div>
    </modal>
    <base-button
      :text="$t('databaseAccess.database_access')"
      variant="solid"
      size="medium"
      :action="
        () => {
          showingModal = true;
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { getErrorMessage } from '../../utils/errors';

export default defineComponent({
  name: 'DatabaseAccess',
  setup() {
    const $toasted = useToast();

    const showingModal = ref(false);
    const addresses = ref('');
    const addressesToAdd = ref<string[]>([]);

    async function saveAccess() {
      try {
        await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/admins/ip_addresses`,
          {
            addresses: addressesToAdd.value.map((a: any) => a.text),
          },
        );
        addressesToAdd.value = [];
        addresses.value = '';
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    return {
      showingModal,
      addresses,
      addressesToAdd,
      saveAccess,
    };
  },
});
</script>

<style>
.vue-tags-input {
  @apply h-auto w-full mb-2;
}
.vue-tags-input .ti-input {
  @apply h-auto;
}
</style>
