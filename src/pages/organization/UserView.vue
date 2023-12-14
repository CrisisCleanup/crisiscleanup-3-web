<template>
  <div
    v-if="selectedUser"
    class="h-full w-full flex flex-col"
    data-testid="testUserViewDiv"
  >
    <div class="flex justify-between border-b px-3 py-1">
      <div class="font-semibold flex justify-between items-center h-16">
        {{ selectedUser.full_name }}
      </div>
      <div class="flex flex-wrap items-center justify-end">
        <ccu-icon
          :alt="$t('actions.edit')"
          data-testid="testEditIcon"
          type="edit"
          class="mx-2"
          size="small"
          @click="isEditing = true"
        />
        <ccu-icon
          :alt="$t('userView.remove_user')"
          data-testid="testRemoveUserIcon"
          type="trash"
          class="mx-2"
          size="small"
          @click="orphanUser"
        />
      </div>
    </div>
    <div class="p-8">
      <div class="flex sm:flex-row flex-col">
        <img
          class="rounded-full profile-image mr-16"
          data-testid="testProfilePictureIcon"
          :src="selectedUser.profilePictureUrl"
          :alt="$t('userView.profile_picture')"
        />
        <div class="w-full" data-testid="testUserDetailsDiv">
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
                  v-if="selectedUser.referringUser"
                  class="text-primary-dark cursor-pointer"
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
              :key="JSON.stringify(selectedUser)"
              :user="selectedUser"
              data-testid="testUserRolesSelect"
            />
          </div>
        </div>
      </div>
    </div>
    <UserEditModal
      v-if="isEditing"
      data-testid="testUserEditModal"
      :user="selectedUser"
      @close="isEditing = false"
      @save="saveUser"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useToast } from 'vue-toastification';
import UserEditModal from './UserEditModal.vue';
import useDialogs from '@/hooks/useDialogs';
import User from '@/models/User';
import Role from '@/models/Role';
import { getErrorMessage } from '@/utils/errors';
import UserRolesSelect from '@/components/UserRolesSelect.vue';

export default defineComponent({
  name: 'UserView',
  components: { UserEditModal, UserRolesSelect },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const $toasted = useToast();
    const { t } = useI18n();
    const isEditing = ref(false);
    const { confirm: messageBox } = useDialogs();

    const roles = computed(() => {
      return Role.all();
    });
    const selectedUser = computed(() => {
      return User.find(route.params.user_id);
    });

    onMounted(async () => {
      // TODO: CCU base model needs to be fixed to avoid doing this
      await User.find(route.params.user_id);
    });

    async function saveUser() {
      try {
        if (!isDefined(selectedUser)) {
          $toasted.error(t('profileUser.save_user_fail'));
          return;
        }

        await User.api().patch(`/users/${selectedUser.value.id}`, {
          ...selectedUser.value.$toJson(),
        });
        await $toasted.success(t('profileUser.save_user_success'));
        isEditing.value = false;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    async function orphanUser() {
      const result = await messageBox({
        title: t('actions.remove_user'),
        content: t('userView.remove_user_warning'),
        actions: {
          cancel: {
            text: t('actions.cancel'),
            buttonClass: 'px-2 py-1 mx-2 border border-black',
          },
          delete: {
            text: t('actions.delete'),
            buttonClass: 'px-2 py-1 mx-2 bg-crisiscleanup-red-700 text-white',
          },
        },
      });
      if (result === 'delete') {
        if (!isDefined(selectedUser)) {
          $toasted.error(t('profileUser.delete_user_fail'));
          return;
        }

        await User.api().orphan(selectedUser.value.id);
        await router.push(`/organization/users`);
      }
    }

    return {
      isEditing,
      roles,
      selectedUser,
      saveUser,
      orphanUser,
    };
  },
});
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
