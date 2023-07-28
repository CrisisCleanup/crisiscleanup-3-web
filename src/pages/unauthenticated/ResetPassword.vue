<template>
  <Home>
    <div class="grid--main">
      <div class="w-2/3">
        <div class="text-5xl" data-testid="testResetPasswordDiv">
          {{ $t('resetPassword.reset_password') }}
        </div>
        <div
          v-if="tokenValid === true"
          class="text-2xl font-light"
          data-testid="testEnterNewPasswordDiv"
        >
          {{ $t('resetPassword.enter_new_password') }}
        </div>
        <div v-if="tokenValid === null" class="text-2xl font-light">
          {{ $t('resetPassword.checking_link') }}
        </div>
        <div v-if="tokenValid === false">
          <div
            class="text-2xl font-light"
            data-testid="testInvalidLinkTryAgainDiv"
          >
            {{ $t('resetPassword.invalid_link_try_again') }}
          </div>
          <base-button
            :text="$t('resetPassword.go_to_login')"
            :alt="$t('resetPassword.go_to_login')"
            data-testid="testGoToLoginButton"
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
        data-testid="testPasswordResetFormDiv"
        ref="form"
        class="w-108 flex flex-col"
        autocomplete="off"
      >
        <base-input
          v-model="newPassword"
          data-testid="testNewPasswordTextInput"
          type="password"
          class="input"
          size="large"
          autocomplete="new-password"
          :placeholder="$t('resetPassword.password')"
          required
        />
        <base-input
          v-model="newPasswordConfirm"
          data-testid="testNewPasswordConfirmTextInput"
          type="password"
          class="input"
          size="large"
          autocomplete="new-password"
          :placeholder="$t('resetPassword.confirm_password')"
          required
        />

        <base-button
          size="large"
          data-testid="testResetPasswordButton"
          class="px-5 py-2 m-1 flex-grow"
          variant="solid"
          :text="$t('actions.reset')"
          :alt="$t('actions.reset')"
          :action="resetPassword"
        />
      </form>
      <modal
        v-if="showSuccessModal"
        data-testid="testPasswordResetSuccessModal"
        modal-classes="bg-white w-1/2 h-108 shadow p-3"
        closeable
        @close="$router.push('/login')"
      >
        <div class="flex flex-col items-center justify-center mt-32">
          <img src="" />
          <base-text variant="h1" class="mb-6" data-testid="testSuccessContent">
            {{$t('info.success')}}
          </base-text>
          <base-text class="w-3/4 text-center" variant="body" wieght="300">{{
            $t('resetPassword.password_reset')
          }}</base-text>
          <base-button
            :text="$t('resetPassword.go_to_login')"
            :alt="$t('resetPassword.go_to_login')"
            data-testid="testGoToLogin2Button"
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
        <template #footer></template>
      </modal>
    </div>
  </Home>
</template>

<script lang="ts">
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Home from '@/layouts/Home.vue';
import PasswordResetRequest from '@/models/PasswordResetRequest';
import { getErrorMessage } from '@/utils/errors';

export default defineComponent({
  name: 'ResetPassword',
  components: { Home },
  setup() {
    const $toasted = useToast();
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const newPassword = ref('');
    const form = ref(null);
    const newPasswordConfirm = ref('');
    const showSuccessModal = ref(false);
    const tokenValid = ref(null);

    async function resetPassword() {
      try {
        const isValid = form.value.reportValidity();
        if (!isValid) {
          return;
        }

        if (newPassword.value !== newPasswordConfirm.value) {
          await $toasted.error('resetPassword.mismatch_passwords_try_again');
          return;
        }

        await PasswordResetRequest.api().reset(
          route.params.token,
          newPassword.value,
        );
        showSuccessModal.value = true;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    onMounted(async () => {
      let resetRequest = null;
      try {
        const response = await PasswordResetRequest.api().get(
          `/password_reset_requests/${route.params.token}`,
        );
        resetRequest = response.response.data;
        tokenValid.value = resetRequest && resetRequest.is_valid;
      } catch {
        tokenValid.value = false;
      }
    });

    return {
      newPassword,
      newPasswordConfirm,
      showSuccessModal,
      tokenValid,
      form,
      resetPassword,
    };
  },
});
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
