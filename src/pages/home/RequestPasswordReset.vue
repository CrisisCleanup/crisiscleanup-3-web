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
            {{
              $t(
                '~~Enter your email address below, and instructions will be sent to reset your password.',
              )
            }}
          </div>
        </div>
        <form class="w-108 flex flex-col" autocomplete="off" ref="form">
          <base-input
            v-model="email"
            type="email"
            class="input"
            size="large"
            :placeholder="$t('~~Email')"
            required
          />

          <base-button
            size="large"
            class="px-5 py-2 m-1 flex-grow"
            variant="solid"
            :text="$t('~~Send me reset password instructions')"
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
              $t('~~Success')
            }}</base-text>
            <base-text class="w-3/4 text-center" variant="body" wieght="300">{{
              $t(
                '~~You will receive an email with instructions for how to confirm your email address in a few minutes.',
              )
            }}</base-text>
            <base-button
              :text="$t('~~Got It')"
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
        await PasswordResetRequest.api().post(`/password_reset_requests`, {
          email: this.email,
        });
        this.showSuccessModal = true;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        if (errorMessage.indexOf('does not exist') !== -1) {
          await this.$toasted.error(
            `~~We couldn't find that email in our system. Check your spelling and try again.`,
          );
        } else {
          await this.$toasted.error(errorMessage);
        }
      }
    },
  },
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      requestedTo: '',
      showSuccessModal: false,
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
