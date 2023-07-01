<template>
  <modal
    modal-classes="md:max-w-xl"
    data-testid="testUserEditModal"
    :title="$t('profileUser.edit_user')"
    closeable
    @close="$emit('close')"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 px-10 py-5">
      <div class="flex items-start justify-center">
        <img
          class="rounded-full profile-image mr-16 w-40"
          data-testid="testProfilePictureIcon"
          :src="user.profilePictureUrl"
          :alt="$t('userView.profile_picture')"
        />
      </div>
      <div class="flex flex-col">
        <base-input
          size="large"
          data-testid="testFirstNameTextInput"
          class="m-2"
          :model-value="user.first_name"
          :placeholder="$t('profileUser.first_name_placeholder')"
          required
          @update:modelValue="
            (value) => {
              updateUser(value, 'first_name');
            }
          "
        />
        <base-input
          size="large"
          data-testid="testLastNameTextInput"
          class="m-2"
          :model-value="user.last_name"
          :placeholder="$t('profileUser.last_name_placeholder')"
          required
          @update:modelValue="
            (value) => {
              updateUser(value, 'last_name');
            }
          "
        />
        <base-input
          size="large"
          data-testid="testMobileTextInput"
          class="m-2"
          :model-value="user.mobile"
          :placeholder="$t('profileUser.mobile_placeholder')"
          required
          @update:modelValue="
            (value) => {
              updateUser(value, 'mobile');
            }
          "
        />
        <base-input
          :model-value="user.email"
          data-testid="testEmailTextInput"
          size="large"
          class="m-2"
          :placeholder="$t('profileUser.email_placeholder ')"
          disabled
        />
        <UserRolesSelect :user="user" />
      </div>
    </div>
    <template #footer>
      <div class="p-3 flex justify-end">
        <base-button
          :text="$t('actions.cancel')"
          :alt="$t('actions.cancel')"
          data-testid="testCancelButton"
          class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
          :action="
            () => {
              $emit('close');
            }
          "
        />
        <base-button
          variant="solid"
          data-testid="testSaveButton"
          :action="saveUser"
          :text="$t('actions.save')"
          :alt="$t('actions.save')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
import User from '@/models/User';
import UserRolesSelect from '@/components/UserRolesSelect.vue';

export default defineComponent({
  name: 'UserEditModal',
  components: { UserRolesSelect },
  props: {
    user: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    function updateUser(value: unknown, key: string) {
      User.update({
        where: props.user.id,
        data: { [key]: value },
      });
    }

    function saveUser() {
      emit('save');
    }

    return {
      updateUser,
      saveUser,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
