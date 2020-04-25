<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--main">
        <div class="w-2/3">
          <div class="text-5xl">{{ $t('Forgot your password?') }}</div>
          <div class="text-2xl font-light">
            {{ $t('resetPassword.enter_email_for_reset_instructions') }}
          </div>
        </div>
        <form class="w-108 flex flex-col" autocomplete="off" ref="form">
          <base-input
            v-model="email"
            type="email"
            class="input"
            size="large"
            :placeholder="$t('resetPassword.your_email')"
            required
          />

          <base-button
            size="large"
            class="px-5 py-2 m-1 flex-grow"
            variant="solid"
            :text="$t('actions.send_reset_password_instructions')"
            :alt="$t('actions.send_reset_password_instructions')"
            :action="requestPasswordReset"
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
            <base-text class="w-3/4 text-center" variant="body" wieght="300">
              {{ $t('resetPassword.email_arrive_soon_check_junk') }}
            </base-text>
            <base-button
              :text="$t('actions.got_it')"
              :alt="$t('actions.got_it')"
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
  name: 'RequestPasswordReset',
  methods: {
    async requestPasswordReset() {
      try {
        const isValid = this.$refs.form.reportValidity();
        if (!isValid) {
          return;
        }

        const response = await PasswordResetRequest.api().post(
          `/password_reset_requests`,
          {
            email: this.email,
          },
        );

        const reset_request =
          response.response && response.response.data
            ? response.response.data
            : null;
        if (reset_request && reset_request.invalid_message) {
          await this.$toasted.error(reset_request.invalid_message);
          return;
        }
        this.showSuccessModal = true;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
  data() {
    return {
      email: '',
      showSuccessModal: false,
    };
  },
  mounted() {
    this.email = this.$route.query.email || '';
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
