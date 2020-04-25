<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--main">
        <div class="w-2/3">
          <div class="text-5xl">{{ $t('resetPassword.reset_password') }}</div>
          <div v-if="tokenValid === true" class="text-2xl font-light">
            {{ $t('resetPassword.enter_new_password') }}
          </div>
          <div v-if="tokenValid === null" class="text-2xl font-light">
            {{ $t('resetPassword.checking_link') }}
          </div>
          <div v-if="tokenValid === false">
            <div class="text-2xl font-light">
              {{ $t('resetPassword.invalid_link_try_again') }}
            </div>
            <base-button
              :text="$t('resetPassword.go_to_login')"
              :alt="$t('resetPassword.go_to_login')"
              size="large"
              variant="solid"
              class="mt-10"
              :action="
                () => {
                  $router.push('/login');
                }
              "
            ></base-button>
          </div>
        </div>
        <form
          v-if="tokenValid === true"
          class="w-108 flex flex-col"
          autocomplete="off"
          ref="form"
        >
          <base-input
            v-model="newPassword"
            type="password"
            class="input"
            size="large"
            autocomplete="new-password"
            :placeholder="$t('resetPassword.password')"
            required
          />
          <base-input
            v-model="newPasswordConfirm"
            type="password"
            class="input"
            size="large"
            autocomplete="new-password"
            :placeholder="$t('resetPassword.confirm_password')"
            required
          />

          <base-button
            size="large"
            class="px-5 py-2 m-1 flex-grow"
            variant="solid"
            :text="$t('actions.reset')"
            :alt="$t('actions.reset')"
            :action="resetPassword"
          />
        </form>
        <modal
          v-if="showSuccessModal"
          modal-classes="bg-white w-1/2 h-108 shadow p-3"
          closeable
          @close="$router.push('/login')"
        >
          <div class="flex flex-col items-center justify-center mt-32">
            <img src="" />
            <base-text variant="h1" class="mb-6">{{
              $t('info.success')
            }}</base-text>
            <base-text class="w-3/4 text-center" variant="body" wieght="300">{{
              $t('resetPassword.password_reset')
            }}</base-text>
            <base-button
              :text="$t('resetPassword.go_to_login')"
              :alt="$t('resetPassword.go_to_login')"
              size="large"
              variant="solid"
              class="mt-10"
              :action="
                () => {
                  $router.push('/login');
                }
              "
            ></base-button>
          </div>
          <div slot="footer"></div>
        </modal>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';
import PasswordResetRequest from '@/models/PasswordResetRequest';
import { getErrorMessage } from '@/utils/errors';

export default {
  components: { HomeLayout },
  name: 'ResetPassword',
  methods: {
    async resetPassword() {
      try {
        const isValid = this.$refs.form.reportValidity();
        if (!isValid) {
          return;
        }

        if (this.newPassword !== this.newPasswordConfirm) {
          await this.$toasted.error(
            'resetPassword.mismatch_passwords_try_again',
          );
          return;
        }
        await PasswordResetRequest.api().reset(
          this.$route.params.token,
          this.newPassword,
        );
        this.showSuccessModal = true;
        this.showSuccessModal = true;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
  async mounted() {
    let resetRequest = null;
    try {
      const response = await PasswordResetRequest.api().get(
        `/password_reset_requests/${this.$route.params.token}`,
      );
      resetRequest = response.response.data;
      this.tokenValid = resetRequest && resetRequest.is_valid;
    } catch (error) {
      this.tokenValid = false;
    }
  },
  data() {
    return {
      newPassword: '',
      newPasswordConfirm: '',
      showSuccessModal: false,
      tokenValid: null,
    };
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      '. main main main main main'
      '. main main main main main'
      '. main main main main main';
  }
}

.input {
  @apply m-1;
}
</style>
