<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--main">
        <div class="w-2/3">
          <div class="text-5xl">{{ $t('~~Join Organization') }}</div>

          <div class="text-2xl font-light">
            {{
              $t(
                '~~To join an organization, you should be invited by an existing member. You can use this form to request access from an existing member by entering their email here:',
              )
            }}
          </div>
        </div>
        <form class="w-108 flex flex-col" autocomplete="off" ref="form">
          <base-input
            size="large"
            class="input"
            type="search"
            v-model="requestedTo"
            placeholder="Crisis Cleanup Member Email"
            required
          ></base-input>
          <base-text class="font-bold" variant="h4" weight="500">
            {{ $t('~~Now fill out your information, and request access') }}
          </base-text>
          <base-input
            v-model="email"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('~~Email')"
            required
          />
          <base-input
            v-model="firstName"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.first_name_placeholder')"
            required
          />
          <base-input
            v-model="lastName"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.last_name_placeholder')"
            required
          />
          <base-input
            v-model="mobile"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.mobile_placeholder')"
            required
          />
          <base-input
            v-model="password"
            type="password"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.pw1_placeholder')"
            autocomplete="new-password"
            required
          />
          <base-input
            ref="confirm_password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.pw2_placeholder')"
            required
          />

          <base-button
            size="large"
            class="px-5 py-2 m-1 flex-grow"
            variant="solid"
            :text="$t('~~Request Access')"
            :action="requestAccess"
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
                '~~Your request has been sent to {requested_to} at {organization} please please contact this person directly and encourage them to approve access quickly',
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
import InvitationRequest from '@/models/InvitationRequest';
import { getErrorMessage } from '@/utils/errors';

export default {
  components: { HomeLayout },
  name: 'RequestAccess',
  methods: {
    async requestAccess() {
      try {
        const isValid = this.$refs.form.reportValidity();
        if (!isValid) {
          return;
        }
        await InvitationRequest.api().post(`/invitation_requests`, {
          first_name: this.firstName,
          last_name: this.lastName,
          email: this.email,
          password1: this.password,
          password2: this.confirmPassword,
          mobile: this.mobile,
          requested_to: this.requestedTo,
        });
        this.showSuccessModal = true;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
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
