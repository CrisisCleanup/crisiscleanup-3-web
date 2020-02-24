<template>
  <div class="flex flex-col items-center justify-center h-full form-container">
    <div class="w-32 m-6">
      <img src="@/assets/ccu-logo-black-500w.png" />
    </div>

    <form ref="form" class="form" @submit.prevent="acceptInvite">
      <base-input
        v-model="first_name"
        type="text"
        class="input"
        size="large"
        :placeholder="this.$t('activate.first_name_placeholder')"
        required
      />
      <base-input
        v-model="last_name"
        type="text"
        class="input"
        size="large"
        :placeholder="this.$t('activate.last_name_placeholder')"
        required
      />
      <base-input
        v-model="mobile"
        type="text"
        class="input"
        size="large"
        :placeholder="this.$t('activate.mobile_placeholder')"
        required
      />
      <base-input
        v-model="password"
        type="password"
        class="input"
        size="large"
        :placeholder="this.$t('activate.pw1_placeholder')"
        required
      />
      <base-input
        ref="confirm_password"
        v-model="confirmPassword"
        type="password"
        class="input"
        size="large"
        :placeholder="this.$t('activate.pw2_placeholder')"
        required
      />
      <base-button
        size="medium"
        class="px-5 py-2 m-1 flex-grow"
        type="primary"
        :text="this.$t('actions.accept_invite')"
        :action="acceptInvite"
      />
    </form>
  </div>
</template>

<script>
import User from '@/models/User';

export default {
  name: 'InvitationSignup',
  data() {
    return {
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: '',
      mobile: '',
    };
  },
  methods: {
    async acceptInvite() {
      // eslint-disable-next-line camelcase
      const { first_name, last_name, password, mobile } = this;
      if (this.validatePassword()) {
        try {
          await User.api().acceptInvite({
            token: this.$route.params.token,
            first_name,
            last_name,
            password,
            mobile,
          });
          await this.$router.push('/login?accepted=true');
        } catch (e) {
          await this.$toasted.error(this.$t('Error accepting invite'));
        }
      }
    },
    validatePassword() {
      if (this.password !== this.confirmPassword) {
        this.$toasted.error(this.$t('activate.password_match_error'));
        return false;
      }
      return true;
    },
  },
};
</script>

<style scoped>
.form-container {
  height: 100vh;
}

.form {
  width: 24rem;
  @apply flex flex-col;
}

.input {
  @apply m-1;
}
</style>
