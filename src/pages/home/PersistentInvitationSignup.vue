<template>
  <Home>
    <div
      class="grid--main overflow-auto"
      data-testid="testAcceptPersistentInvitationDiv"
    >
      <div class="w-2/3">
        <div class="text-5xl">
          {{ $t('~~Accept Invitation') }}
        </div>
      </div>
      <form ref="form" class="w-108 flex flex-col" autocomplete="off">
        <fieldset>
          <base-text variant="body" weight="700" class="mt-4 mb-2 pt-8">
            {{ $t('~~Accept Invitation') }}
          </base-text>
          <base-input
            v-model="email"
            data-testid="testYourEmailTextInput"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('~~Your Email')"
            required
          />
          <base-input
            v-model="firstName"
            data-testid="testFirstNameTextInput"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('~~First Name')"
            required
          />
          <base-input
            v-model="lastName"
            data-testid="testLastNameTextInput"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('~~Last Name')"
            required
          />
          <base-input
            v-model="title"
            data-testid="testTitleTextInput"
            type="title"
            autocomplete="title"
            class="input"
            size="large"
            :placeholder="$t('~Title')"
          />
          <base-input
            v-model="mobile"
            data-testid="testMobileTextInput"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('~~Mobile')"
            required
          />
          <base-input
            v-model="password"
            data-testid="testPw1TextInput"
            type="password"
            class="input"
            size="large"
            :placeholder="$t('~~Password')"
            autocomplete="new-password"
            required
          />
          <base-input
            v-model="confirmPassword"
            data-testid="testPw2TextInput"
            type="password"
            autocomplete="new-password"
            class="input"
            size="large"
            :placeholder="$t('~~Confirm Password')"
            required
          />
        </fieldset>
        <base-button
          size="large"
          data-testid="testAcceptPersistentInvitationButton"
          class="px-5 py-2 m-1 flex-grow"
          variant="solid"
          :text="$t('~~Accept Invitation')"
          :alt="$t('~~Accept Invitation')"
          :action="acceptPersistentInvitation"
        />
      </form>
      <modal
        v-if="showSuccessModal"
        data-testid="testAcceptPersistentInvitationSuccessModal"
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
            {{ message }}
          </base-text>
        </div>
        <template #footer>
          <div class="flex items-center justify-center py-2 border-t">
            <base-button
              :text="$t('actions.got_it')"
              :alt="$t('actions.got_it')"
              data-testid="testGotItButton"
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
        </template>
      </modal>
    </div>
  </Home>
</template>

<script lang="ts">
import { onMounted, reactive, toRefs, ref, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import Home from '@/layouts/Home.vue';
import Language from '@/models/Language';
import { getErrorMessage } from '@/utils/errors';
import axios from 'axios';

export default defineComponent({
  name: 'PersistentInvitationSignup',
  components: { Home },
  setup() {
    const route = useRoute();
    const $toasted = useToast();
    const form = ref<HTMLFormElement | null>(null);

    const state = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      requestedTo: '',
      title: '',
      showSuccessModal: false,
      toggleOpen: false,
      message: '',
    });

    async function acceptPersistentInvitation() {
      let response;
      try {
        const isValid = form?.value?.reportValidity();
        if (!isValid) {
          return;
        }

        if (state.password !== state.confirmPassword) {
          await $toasted.error('Passwords must match');
          return;
        }

        response = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/persistent_invitations/accept`,
          {
            first_name: state.firstName,
            last_name: state.lastName,
            email: state.email,
            title: state.title,
            password: state.password,
            mobile: state.mobile,
            token: route.params.token,
          },
        );

        state.message = response.data.detail;

        state.showSuccessModal = true;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    return {
      ...toRefs(state),
      acceptPersistentInvitation,
      form,
      route,
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
