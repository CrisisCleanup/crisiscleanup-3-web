<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--main overflow-auto">
        <div class="w-2/3">
          <div class="text-5xl">
            {{ $t('requestAccess.join_organization') }}
          </div>
          <div class="text-2xl font-light">
            <div v-if="$route.query.organization">
              {{
                $t('requestAccess.org_already_has_account', {
                  organization: $route.query.organization,
                })
              }}
            </div>
            <base-text variant="body" weight="700" class="mt-4 mb-1">
              ~~To join an organization, you should be invited by an existing
              member. You can use this form to <br />
              request access from an existing user by entering their email here.
            </base-text>
            <!-- <div>{{ $t('requestAccess.enter_existing_user_email_msg') }}</div> -->
          </div>
        </div>
        <form class="w-108 flex flex-col" autocomplete="off" ref="form">
          <base-input
            size="large"
            class="input"
            type="search"
            v-model="requestedTo"
            :placeholder="$t('requestAccess.existing_member_email')"
            required
          ></base-input>
          <base-text variant="body" weight="700" class="mt-4 mb-2 pt-8">
            ~~Now fill out your information here and request request access
          </base-text>
          <base-input
            v-model="email"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('requestAccess.your_email')"
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
            ref="title"
            v-model="title"
            type="title"
            autocomplete="title"
            class="input"
            size="large"
            placeholder="Title"
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
            :text="$t('actions.request_access')"
            :action="requestAccess"
          />
        </form>
        <base-text variant="body" weight="700" class="mt-10 mb-8">
          ~~Your request will be sent to existing members for approval
        </base-text>
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
              {{
                $t('requestAccess.request_sent_to_org', {
                  organization: organization,
                  requested_to: requested_to,
                })
              }}"
            </base-text>
            <base-button
              :text="$t('actions.got_it')"
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
