<template>
  <div class="login flex flex-col items-center justify-start">
    <div class="logo m-20">
      <img src="@/assets/ccu-logo-black-500w.png" />
    </div>

    <span v-if="acceptedInvite"> {{ $t('login.accepted_invite') }}</span>

    <form
      ref="form"
      class="flex flex-col login-form"
      @submit.prevent="userLogin"
    >
      <h1 class="text-3xl text-center">{{ $t('login.sign_in_msg') }}</h1>
      <base-input
        v-model="email"
        size="large"
        class="my-2"
        required
        type="email"
        :placeholder="$t('login.email_placeholder')"
        autocomplete="email"
      />
      <base-input
        v-model="password"
        size="large"
        class="my-2"
        required
        type="password"
        :placeholder="$t('login.password_placeholder')"
        autocomplete="password"
      />
      <base-button
        size="medium"
        class="px-5 py-2 my-3 w-full"
        type="primary"
        :text="$t('login.log_in_button')"
      />
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      email: '',
      password: '',
      acceptedInvite: Boolean(this.$route.query.accepted),
    };
  },
  methods: {
    ...mapActions('auth', ['login']),
    async userLogin() {
      try {
        await this.login({ email: this.email, password: this.password });
        await this.$router.push('/');
      } catch (e) {
        await this.$toasted.error(this.$t('login.invalid_credentials_msg'));
      }
    },
  },
};
</script>

<style scoped>
.login {
  height: 100vh;
}
.logo img {
  height: 150px;
}
.login-form {
  width: 24rem;
}
</style>
