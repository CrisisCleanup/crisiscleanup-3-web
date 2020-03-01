<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex justify-between border-b px-3 py-1">
      <div class="font-semibold flex justify-between items-center h-16">
        {{ selectedUser.full_name }}
      </div>
      <div class="flex items-center justify-end">
        <ccu-icon
          :alt="$t('actions.edit')"
          type="edit"
          class="mx-2"
          size="small"
          @click.native="isEditing = true"
        />
        <ccu-icon
          :alt="$t('actions.location')"
          type="pin"
          class="mx-2"
          size="small"
        />
        <ccu-icon
          :alt="$t('actions.print')"
          type="print"
          class="mx-2"
          size="small"
        />
        <ccu-icon
          :alt="$t('actions.chat')"
          type="chat"
          class="mx-2"
          size="large"
        />
        <ccu-icon
          :alt="$t('actions.delete')"
          type="trash"
          class="mx-2"
          size="small"
        />
      </div>
    </div>
    <div class="p-8">
      <div class="flex">
        <img
          class="rounded-full profile-image mr-16"
          :src="selectedUser.profilePictureUrl"
          :alt="$t('userView.profile_picture')"
        />
        <div class="w-full">
          <div class="flex items-center justify-start mb-6">
            <div class="flex flex-col w-48">
              <div class="text-xs text-crisiscleanup-grey-700">
                {{ $t('userView.phone_number') }}
              </div>
              <div class="py-2 text-base">
                {{ selectedUser.mobile || $t('userView.mobile_not_set') }}
              </div>
            </div>
            <div class="flex flex-col">
              <div class="text-xs text-crisiscleanup-grey-700">
                {{ $t('userView.email') }}
              </div>
              <div class="py-2 text-base">
                {{ selectedUser.email || $t('userView.email_not_set') }}
              </div>
            </div>
          </div>
          <div class="flex items-center justify-start mb-6">
            <div class="flex flex-col w-48">
              <div class="text-xs text-crisiscleanup-grey-700">
                {{ $t('userView.team') }}
              </div>
              <div class="py-2 text-base">
                {{ selectedUser.team || $t('userView.mobile_not_set') }}
              </div>
            </div>
            <div class="flex flex-col">
              <div class="text-xs text-crisiscleanup-grey-700">
                {{ $t('userView.invited_by') }}
              </div>
              <div class="py-2 text-base">
                <div
                  class="text-primary-dark cursor-pointer"
                  v-if="selectedUser.referringUser"
                  @click="
                    $router.push(
                      `/organization/users/${selectedUser.referringUser.id}`,
                    )
                  "
                >
                  {{
                    selectedUser.referringUser &&
                      selectedUser.referringUser.full_name
                  }}
                </div>
                <span v-else>
                  {{ $t('userView.mobile_not_set') }}
                </span>
              </div>
            </div>
          </div>
          <div>
            <form-select
              v-model="selectedUser.roles"
              class="w-64 border border-crisiscleanup-dark-100"
              :value="selectedUser.roles"
              multiple
              :options="roles"
              item-key="id"
              label="name_t"
              size="large"
              select-classes="bg-white border text-xs role-select p-1"
            />
          </div>
        </div>
      </div>
    </div>
    <UserEditModal
      v-if="isEditing"
      :user="selectedUser"
      @close="isEditing = false"
      @save="saveUser"
    />
  </div>
</template>
<script>
import User from '@/models/User';
import Role from '@/models/Role';
import UserEditModal from './UserEditModal';
import { getErrorMessage } from '../../utils/errors';

export default {
  name: 'UserView',
  components: { UserEditModal },
  data() {
    return {
      isEditing: false,
    };
  },
  computed: {
    roles() {
      return Role.all();
    },
    selectedUser() {
      return User.find(this.$route.params.user_id);
    },
  },
  methods: {
    async saveUser() {
      try {
        await User.api().patch(`/users/${this.selectedUser.id}`, {
          ...this.selectedUser.$toJson(),
        });
        await this.$toasted.success(this.$t('profileUser.save_user_success'));
        this.isEditing = false;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
};
</script>
<style scoped>
.profile-image {
  height: 175px;
  width: 175px;
}
</style>
<style>
.role-select .vs__selected {
  @apply text-xs bg-white !important;
}
</style>
