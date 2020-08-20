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

<script>
import { getErrorMessage } from '../utils/errors';

export default {
  name: 'DatabaseAccess',
  data() {
    return {
      showingModal: null,
      addresses: '',
      addressesToAdd: [],
    };
  },
  methods: {
    async saveAccess() {
      try {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/admins/ip_addresses`,
          {
            addresses: this.addressesToAdd.map((a) => a.text),
          },
        );
        this.addressesToAdd = [];
        this.addresses = '';
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
};
</script>

<style>
.vue-tags-input {
  @apply h-8 w-108 mb-2;
}

.vue-tags-input .ti-input {
  @apply h-8;
}
</style>
