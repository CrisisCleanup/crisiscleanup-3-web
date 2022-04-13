<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex justify-between border-b px-3 py-1">
      <div class="font-semibold flex justify-between items-center h-16">
        {{ selectedUser.full_name }}
      </div>
      <div class="flex flex-wrap items-center justify-end">
        <ccu-icon
          :alt="$t('actions.edit')"
          type="edit"
          class="mx-2"
          size="small"
          @click.native="isEditing = true"
        />
        <ccu-icon
          :alt="$t('userView.remove_user')"
          type="trash"
          class="mx-2"
          size="small"
          @click.native="orphanUser"
        />
      </div>
    </div>
    <div class="p-8">
      <div class="flex sm:flex-row flex-col">
        <img
          class="rounded-full profile-image mr-16"
          :src="selectedUser.profilePictureUrl"
          :alt="$t('userView.profile_picture')"
        />
        <div class="w-full">
          <div class="flex flex-wrap items-center justify-start mb-6">
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
          <div class="flex flex-wrap items-center justify-start mb-6">
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
            <UserRolesSelect
              :user="selectedUser"
              :key="JSON.stringify(selectedUser)"
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
import { create } from 'vue-modal-dialogs';
import User from '@/models/User';
import Role from '@/models/Role';
import MessageBox from '@/components/dialogs/MessageBox';
import UserEditModal from './UserEditModal';
import { getErrorMessage } from '../../utils/errors';
import UserRolesSelect from '../../components/UserRolesSelect';

const messageBox = create(MessageBox);

export default {
  name: 'UserView',
  components: { UserEditModal, UserRolesSelect },
  async mounted() {
    await User.fetchOrFindId(this.$route.params.user_id);
  },
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
    async orphanUser() {
      const result = await messageBox({
        title: this.$t('actions.remove_user'),
        content: this.$t('userView.remove_user_warning'),
        actions: {
          cancel: {
            text: this.$t('actions.cancel'),
            buttonClass: 'px-2 py-1 mx-2 border border-black',
          },
          delete: {
            text: this.$t('actions.delete'),
            buttonClass: 'px-2 py-1 mx-2 bg-crisiscleanup-red-700 text-white',
          },
        },
      });
      if (result === 'delete') {
        await User.api().orphan(this.selectedUser.id);
        await this.$router.push(`/organization/users`);
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
