<template>
  <div class="flex flex-col w-3/4 m-auto">
    <div class="w-full bg-white shadow mt-6">
      <div
        class="border-b px-4 py-2 font-semibold flex justify-between items-center"
      >
        {{ currentUser.full_name }}
        <base-button
          type="primary"
          class="px-4 py-2"
          :text="$t('actions.save')"
          :action="saveUser"
        />
      </div>
      <form ref="form" class="user-form mt-6" @submit.prevent="handleSubmit">
        <div class="flex">
          <div class="flex flex-col p-8 w-1/4">
            <img
              class="rounded-full mx-auto p-1"
              src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80"
            />
            <a href="https://google.com" class="text-center pb-4">{{
              $t('actions.change_photo')
            }}</a>
            <base-button type="primary" class="py-1">{{
              $t('actions.view_id_badge')
            }}</base-button>
          </div>
          <div class="p-8 w-3/4">
            <div class="user-details">
              <div class="flex pb-4">
                <base-input
                  class="mr-2 w-1/2"
                  :value="currentUser.first_name"
                  :placeholder="$t('activate.first_name_placeholder')"
                  required
                  @input="
                    value => {
                      updateUser(value, 'first_name');
                    }
                  "
                />
                <base-input
                  class="mr-2 w-1/2"
                  :value="currentUser.mobile"
                  :placeholder="$t('activate.mobile_placeholder')"
                  required
                  @input="
                    value => {
                      updateUser(value, 'mobile');
                    }
                  "
                />
              </div>
              <div class="flex pb-4">
                <base-input
                  class="mr-2 w-1/2"
                  :value="currentUser.last_name"
                  :placeholder="$t('activate.last_name_placeholder')"
                  required
                  @input="
                    value => {
                      updateUser(value, 'last_name');
                    }
                  "
                />
                <base-input
                  class="mr-2 w-1/2"
                  :value="currentUser.email"
                  :placeholder="$t('activate.email_placeholder ')"
                  required
                  @input="
                    value => {
                      updateUser(value, 'email');
                    }
                  "
                />
              </div>
            </div>
            <hr class="p-2 m-auto" />
            <div class="flex pb-4">
              <form-select
                v-model="currentUser.roles"
                class="w-1/2 flex-grow mr-2 border border-crisiscleanup-dark-100"
                :value="currentUser.roles"
                multiple
                :options="[]"
                item-key="value"
                label="name_t"
                size="large"
                select-classes="bg-white border text-xs"
              />
              <form-select
                v-model="currentUser.equipment"
                class="w-1/2 flex-grow border border-crisiscleanup-dark-100"
                :value="currentUser.equipment"
                :options="[]"
                item-key="value"
                label="name_t"
                size="large"
                select-classes="bg-white border text-xs"
              />
            </div>
            <div class="mt-3">
              <h3 class="text-base">{{ $t('profileVue.linkedin') }}</h3>
              <div class="flex pb-4">
                <div class="w-32 flex items-center">
                  <img
                    src="https://simpleicons.org/icons/facebook.svg"
                    class="w-8 mr-4"
                  />
                  <label class="pr-3">{{ $t('profileVue.facebook') }}</label>
                </div>
                <base-input
                  size="small"
                  :placeholder="$t('~~Facebook')"
                  @input="
                    value => {
                      updateUser(value, 'facebook');
                    }
                  "
                />
              </div>
              <div class="flex pb-4">
                <div class="w-32 flex items-center">
                  <img
                    src="https://simpleicons.org/icons/twitter.svg"
                    class="w-8 mr-2"
                  />
                  <label class="pr-3">{{ $t('profileVue.twitter') }}</label>
                </div>
                <base-input
                  size="small"
                  :placeholder="$t('~~Twitter')"
                  @input="
                    value => {
                      updateUser(value, 'twitter');
                    }
                  "
                />
              </div>
            </div>
            <hr class="p-4 m-auto" />
            <div>
              <h3>{{ $t('profileVue.your_organization') }}</h3>
              <div class="py-3 flex items-center">
                <div
                  class="w-8 h-8 rounded-full bg-crisiscleanup-grey-300 border border-black"
                />
                <span class="px-4">{{ currentUser.organization.name }}</span>
              </div>
              <div>
                <base-button type="primary" class="px-4 py-1">
                  {{ $t('profileVue.change_organization') }}
                </base-button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import User from '@/models/User';
import { getErrorMessage } from '../utils/errors';

export default {
  name: 'Profile',
  data() {
    return {};
  },
  computed: {
    name() {
      if (this.currentUser) {
        return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
      }
      return '';
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    isEditing() {
      return this.mode === 'edit';
    },
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
    },
    updateUser(value, key) {
      User.update({
        where: this.currentUser.id,
        data: {
          [key]: value,
        },
      });
    },
    async saveUser() {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }
      try {
        await User.api().patch(`/users/${this.currentUser.id}`, {
          ...this.currentUser,
          preferences: { ...this.currentUser.preferences, ...{} },
          states: { ...this.currentUser.states, ...{} },
        });
        await this.$toasted.success(this.$t('~~Successfully Saved User'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
};
</script>

<style scoped>
.user-form {
  width: 56rem;
}
</style>
