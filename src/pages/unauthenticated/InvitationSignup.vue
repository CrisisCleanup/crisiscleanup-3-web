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
          @submit.prevent="acceptInvite"
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
            :action="acceptInvite"
          />
        </form>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import User from '@/models/User';
import Invitation from '../../models/Invitation';
import HomeLayout from '../../layouts/Home';

export default {
  name: 'InvitationSignup',
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
    };
  },
  async mounted() {
    try {
      const results = await Invitation.api().fetchById(
        this.$route.params.token,
      );
      [this.invitation] = results.entities.invitations;
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
          await this.$router.push('/login?accepted=true');
        } catch (e) {
          await this.$toasted.error(
            this.$t('invitationSignup.invitation_accept_error'),
          );
        }
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
