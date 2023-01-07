<template>
  <Home>
    <div class="grid--main">
      <div class="w-2/3">
        <div class="text-5xl">{{ $t('Forgot your password?') }}</div>
        <div class="text-2xl font-light">
          {{ $t('resetPassword.enter_email_for_reset_instructions') }}
        </div>
      </div>
      <form ref="form" class="w-108 flex flex-col" autocomplete="off">
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
  </Home>
</template>

<script>
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import Home from '@/layouts/Home.vue';
import PasswordResetRequest from '@/models/PasswordResetRequest';
import { getErrorMessage } from '@/utils/errors';

export default {
  name: 'RequestPasswordReset',
  components: { Home },
  setup() {
    const form = ref(null);
    const email = ref('');
    const showSuccessModal = ref(false);
    const $toasted = useToast();
    const route = useRoute();

    async function requestPasswordReset() {
      try {
        const isValid = form.value.reportValidity();
        if (!isValid) {
          return;
        }

        const response = await PasswordResetRequest.api().post(
          `/password_reset_requests`,
          {
            email: email.value,
          },
        );

        const reset_request =
          response.response && response.response.data
            ? response.response.data
            : null;
        if (reset_request && reset_request.invalid_message) {
          await $toasted.error(reset_request.invalid_message);
          return;
        }
        showSuccessModal.value = true;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    onMounted(() => {
      email.value = route.query.email || '';
    });

    return {
      email,
      showSuccessModal,
      form,
      requestPasswordReset,
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
