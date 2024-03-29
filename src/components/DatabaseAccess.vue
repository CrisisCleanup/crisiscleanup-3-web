<template>
  <div>
    <modal
      closeable
      @close="showingModal = false"
      v-if="showingModal"
      modal-classes="bg-white max-w-md shadow"
      :title="$t('databaseAccess.add_ip_to_db')"
      @ok="saveAccess"
    >
      <div class="p-3">
        <div class="my-3">
          {{ $t('databaseAccess.add_ip_to_db_for_rds') }}
        </div>
        <div>
          <tag-input
            v-model="addresses"
            :tags.sync="addressesToAdd"
            :placeholder="$t('databaseAccess.add_ip')"
            :add-on-key="[13, 32, ',']"
            :separators="[';', ',', ', ']"
            @tags-changed="(newTags) => (addressesToAdd = newTags)"
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
import { ref, defineComponent } from '@vue/composition-api';
import { getErrorMessage } from '../utils/errors';
import useHttp from '@/use/useHttp';
import useToasted from '@/use/useToasted';

export default defineComponent({
  name: 'DatabaseAccess',
  setup() {
    const { $http } = useHttp();
    const { $toasted } = useToasted();

    const showingModal = ref(null);
    const addresses = ref('');
    const addressesToAdd = ref([]);

    async function saveAccess() {
      try {
        await $http.post(
          `${process.env.VUE_APP_API_BASE_URL}/admins/ip_addresses`,
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
  @apply h-8 w-108 mb-2;
}

.vue-tags-input .ti-input {
  @apply h-8;
}
</style>
