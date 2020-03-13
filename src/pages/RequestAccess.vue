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
                '~~To join an organization, you should be invited by an existing member. You can also use this form to request access from an existing user by their email',
              )
            }}
          </div>
        </div>
        <form class="w-108 flex flex-col" autocomplete="off" ref="form">
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
          <base-input
            size="large"
            class="input"
            type="search"
            v-model="requestedTo"
            placeholder="Crisis Cleanup Member Email"
            required
          ></base-input>

          <base-button
            size="large"
            class="px-5 py-2 m-1 flex-grow"
            variant="solid"
            :text="$t('~~Request Access')"
            :action="requestAccess"
          />
        </form>
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
    };
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      '. . main main main main'
      '. . main main main main'
      '. . main main main main';
  }
}

.input {
  @apply m-1;
}
</style>
