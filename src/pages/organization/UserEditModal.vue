<template>
  <modal
    modal-classes="w-1/3"
    :title="$t('~~Edit User')"
    closeable
    @close="$emit('close')"
  >
    <div class="flex px-10 py-5">
      <div class="w-1/2 flex items-start justify-center">
        <img
          class="rounded-full profile-image mr-16 w-40"
          :src="user.profilePictureUrl"
          :alt="$t('userView.profile_picture')"
        />
      </div>
      <div class="w-1/2 flex flex-col">
        <base-input
          size="large"
          class="m-2"
          :value="user.first_name"
          :placeholder="$t('profileUser.first_name_placeholder')"
          required
          @input="
            value => {
              updateUser(value, 'first_name');
            }
          "
        />
        <base-input
          size="large"
          class="m-2"
          :value="user.last_name"
          :placeholder="$t('profileUser.last_name_placeholder')"
          required
          @input="
            value => {
              updateUser(value, 'last_name');
            }
          "
        />
        <base-input
          size="large"
          class="m-2"
          :value="user.mobile"
          :placeholder="$t('profileUser.mobile_placeholder')"
          required
          @input="
            value => {
              updateUser(value, 'mobile');
            }
          "
        />
        <base-input
          :value="user.email"
          size="large"
          class="m-2"
          :placeholder="$t('profileUser.email_placeholder ')"
          disabled
        />
        <form-select
          v-model="user.roles"
          class="flex-grow m-2 border border-crisiscleanup-dark-100"
          :value="user.roles"
          multiple
          :options="roles"
          item-key="id"
          label="name_t"
          size="large"
          select-classes="bg-white border text-xs profile-select p-1"
        />
      </div>
    </div>
    <div slot="footer" class="p-3 flex justify-end">
      <base-button
        :text="$t('actions.cancel')"
        class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
        :action="
          () => {
            $emit('close');
          }
        "
      />
      <base-button
        variant="solid"
        :action="saveUser"
        :text="$t('actions.save')"
        class="ml-2 p-3 px-6 text-xs"
      />
    </div>
  </modal>
</template>

<script>
import User from '@/models/User';
import Role from '@/models/Role';
export default {
  name: 'UserEditModal',
  props: {
    user: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  methods: {
    updateUser(value, key) {
      const { user } = this;
      User.update({
        where: user.id,
        data: {
          [key]: value,
        },
      });
    },
    saveUser() {
      this.$emit('save');
    },
  },
  computed: {
    roles() {
      return Role.all();
    },
    userRoles() {
      return Role.query()
        .whereIdIn(this.user.roles)
        .get();
    },
  },
};
</script>

<style scoped></style>
