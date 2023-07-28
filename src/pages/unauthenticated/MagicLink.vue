<template>
  <Home>
    <div class="grid--main">
      <div class="w-2/3">
        <div class="text-3xl" data-testid="testMagicLinkDiv">
          {{ $t('helpdesk.request_magic_link') }}
        </div>
        <div>
          {{ $t('helpdesk.magic_link_description') }}
        </div>
        <form ref="form" class="w-108 flex flex-col" autocomplete="off">
          <base-input
            v-model="email"
            data-testid="testEmailTextInput"
            type="email"
            class="input"
            size="large"
            autocomplete="off"
            :placeholder="$t('magicLink.email')"
            required
          />
          <base-button
            size="large"
            data-testid="testSendMagicLinkButton"
            class="px-5 py-2 m-1 flex-grow"
            variant="solid"
            :text="$t('actions.submit')"
            :alt="$t('actions.submit')"
            :action="sendMagicLink"
          />
        </form>
        <modal
          v-if="showSuccessModal"
          data-testid="testMagicLinkSentSuccessModal"
          modal-classes="bg-white w-1/2 h-108 shadow p-3"
          closeable
          @close="$router.push('/login')"
        >
          <div class="flex flex-col items-center justify-center mt-32">
            <img src="" />
            <base-text
              variant="h1"
              class="mb-6"
              data-testid="testSuccessContent"
            >
              {{ $t('info.success') }}
            </base-text>
            <base-text class="w-3/4 text-center" variant="body" wieght="300">{{
              $t('magicLink.magic_link_sent')
            }}</base-text>
            <base-button
              :text="$t('magicLink.go_to_login')"
              :alt="$t('magicLink.go_to_login')"
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
    </div>
  </Home>
</template>

<script lang="ts">
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import axios from 'axios';
import Home from '@/layouts/Home.vue';

export default defineComponent({
  name: 'MagicLink',
  components: { Home },
  setup() {
    const $toasted = useToast();
    const { t } = useI18n();

    const email = ref('');
    const form = ref(null);
    const showSuccessModal = ref(false);

    const sendMagicLink = async () => {
      try {
        const isValid = form.value.reportValidity();
        if (!isValid) {
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/magic_link`,
          {
            email: email.value,
          },
        );

        if (response.status === 200) {
          showSuccessModal.value = true;
          email.value = '';
        } else {
          await $toasted.error(t('magicLink.something_went_wrong'));
        }
      } catch {
        await $toasted.error(t('magicLink.something_went_wrong'));
      }
    };

    return {
      email,
      showSuccessModal,
      form,
      sendMagicLink,
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
