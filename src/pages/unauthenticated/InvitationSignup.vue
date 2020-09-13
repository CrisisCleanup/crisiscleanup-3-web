<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--main">
        <form
          ref="form"
          class="form w-108 flex flex-col"
          @submit.prevent="transfer"
          v-if="invitation && invitation.existing_user"
        >
          <div class="text-2xl font-light">
            {{
              $t('invitationSignup.inviting_to_transfer_confirm', {
                user: invitation.inviter,
                fromOrg: getOrganizationName(
                  invitation.existing_user.organization,
                ),
                toOrg: getOrganizationName(invitation.organization),
              })
            }}
          </div>
          <form-select
            v-model="transferOption"
            :options="[
              {
                key: 'users',
                label: $t('invitationSignup.yes_transfer_just_me'),
              },
              {
                key: 'all',
                label: $t('invitationSignup.yes_transfer_me_and_cases'),
              },
              {
                key: 'none',
                label: $t('invitationSignup.no_transfer'),
              },
            ]"
            :placeholder="$t('actions.choose_one_select')"
            select-classes="bg-white border w-full h-12"
            item-key="key"
            label="label"
          />
          <base-button
            size="large"
            class="px-5 py-2 m-2 flex-grow"
            variant="solid"
            :text="$t('actions.transfer')"
            :alt="$t('actions.transfer')"
            :action="transfer"
            :disabled="!transferOption || transferOption === 'none'"
          />
        </form>
        <form
          ref="form"
          class="form w-108 flex flex-col"
          @submit.prevent="acceptInvite"
          v-else
        >
          <div class="text-2xl font-light">
            {{
              $t('invitationSignup.user_invited_join_ccu', {
                user: invitation.inviter,
              })
            }}
          </div>
          <base-input
            v-model="first_name"
            type="text"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.first_name_placeholder')"
            required
          />
          <base-input
            v-model="last_name"
            type="text"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.last_name_placeholder')"
            required
          />
          <base-input
            v-model="title"
            type="text"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.title_placeholder')"
          />
          <base-input
            v-model="mobile"
            type="text"
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
            required
          />
          <base-input
            ref="confirm_password"
            v-model="confirmPassword"
            type="password"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.pw2_placeholder')"
            required
          />
          <base-button
            size="large"
            class="px-5 py-2 m-2 flex-grow"
            variant="solid"
            :text="$t('actions.accept_invite')"
            :alt="$t('actions.accept_invite')"
            :action="acceptInvite"
          />
        </form>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import User from '@/models/User';
import PasswordResetRequest from '@/models/PasswordResetRequest';
import Organization from '@/models/Organization';
import Invitation from '../../models/Invitation';
import HomeLayout from '../../layouts/Home';
import { DialogsMixin } from '../../mixins';
import { getErrorMessage } from '../../utils/errors';
import { getOrganizationName } from '../../filters';

export default {
  name: 'InvitationSignup',
  mixins: [DialogsMixin],
  components: { HomeLayout },
  data() {
    return {
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      title: '',
      invitation: null,
      transferOption: null,
      getOrganizationName,
    };
  },
  async mounted() {
    try {
      const results = await Invitation.api().fetchById(
        this.$route.params.token,
      );
      [this.invitation] = results.entities.invitations;
      if (this.invitation.existing_user) {
        await Organization.api().get(
          `/organizations?id__in=${[
            this.invitation.organization,
            this.invitation.existing_user.organization,
          ].join(',')}`,
          {
            dataKey: 'results',
          },
        );
      }
    } catch (error) {
      await this.$toasted.error(this.$t('invitationSignup.invitation_dead'));
      this.$router.push('/login');
    }
  },
  methods: {
    async acceptInvite() {
      // eslint-disable-next-line camelcase
      const { first_name, last_name, password, mobile, title } = this;
      if (this.validatePassword()) {
        try {
          await User.api().acceptInvite({
            token: this.$route.params.token,
            first_name,
            last_name,
            password,
            mobile,
            title,
          });
          await this.$toasted.success(
            this.$t('invitationSignup.success_accept_invitation'),
          );
          await this.$router.push('/login?accepted=true');
        } catch (e) {
          await this.$toasted.error(
            this.$t('invitationSignup.invitation_accept_error'),
          );
        }
      }
    },
    async transfer() {
      try {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/transfer_requests/invitation`,
          {
            invitation_token: this.$route.params.token,
            transfer_action: this.transferOption,
          },
        );
        const result = await this.$confirm({
          title: this.$t('invitationSignup.move_completed'),
          content: this.$t(`invitationSignup.congrats_move_complete`, {
            toOrg: getOrganizationName(this.invitation.organization),
          }),
          actions: {
            forgot: {
              text: this.$t('invitationSignup.forgot_password'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            login: {
              text: this.$t('actions.login'),
              type: 'solid',
            },
          },
        });
        if (result === 'login') {
          await this.$router.push('/login?accepted=true');
        }
        if (result === 'forgot') {
          await PasswordResetRequest.api().post(`/password_reset_requests`, {
            email: this.invitation.invitee_email,
          });
          await this.$toasted.success(
            this.$t('invitationSignup.success_reset_password'),
          );
        }
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    validatePassword() {
      if (this.password !== this.confirmPassword) {
        this.$toasted.error(this.$t('invitationSignup.password_match_error'));
        return false;
      }
      return true;
    },
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
  @apply m-2;
}
</style>
