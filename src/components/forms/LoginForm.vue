<template>
  <div class="logingrid grid-container">
    <div class="grid--title">
      <base-text
        font="display"
        variant="h1"
        class="text-crisiscleanup-dark-500"
        >{{ lang.login }}</base-text
      >
    </div>
    <div class="grid--sub">
      <base-text
        variant="h1"
        :weight="300"
        font="display"
        class="text-crisiscleanup-dark-500"
      >
        {{ lang.signIn }}
      </base-text>
    </div>
    <div class="grid--email">
      <base-input
        v-model="email"
        required
        autocomplete="email"
        :placeholder="lang.email"
        size="xlarge"
        type="email"
        data-cy="loginForm.email"
      />
    </div>
    <div class="grid--password">
      <base-input
        v-model="password"
        required
        autocomplete="password"
        :placeholder="lang.password"
        size="xlarge"
        type="password"
        data-cy="loginForm.password"
      />
    </div>
    <div class="grid--forgot">
      <base-link to="nav.forgot" text-variant="h2">{{ lang.forgot }}</base-link>
    </div>
    <div class="grid--login">
      <base-button
        variant="solid"
        size="large"
        class="w-full"
        data-cy="loginForm.login"
        :action="userLogin"
      >
        {{ lang.login }}
      </base-button>
    </div>
    <div class="grid--request">
      <base-button variant="outline" size="large" class="w-full">
        {{ lang.request }}
      </base-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'LoginForm',
  data() {
    return {
      lang: {
        login: this.$t('actions.login'),
        signIn: this.$t('loginForm.sign_in_msg'),
        forgot: this.$t('actions.forgot_password'),
        request: this.$t('actions.request_access'),
        email: this.$t('loginForm.email_placeholder'),
        password: this.$t('loginForm.password_placeholder'),
        invalidCreds: this.$t('loginForm.invalid_credentials_msg'),
      },
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
        if (this.$route.query.from) {
          await this.$router.replace(this.$route.query.from);
        } else {
          await this.$router.push('/');
        }
      } catch (e) {
        await this.$toasted.error(this.lang.invalidCreds);
      }
    },
  },
};
</script>

<style scoped lang="scss">
$loginareas: title sub email password forgot login request;

.logingrid {
  @apply h-full w-full;
  &.grid-container {
    display: inline-grid;
    justify-content: space-between;
    grid:
      [row1-start] 'title title' 1fr [row1-end]
      [row2-start] 'sub sub' 1fr [row2-end]
      [row3-start] 'email email' 0.75fr [row3-end]
      [row4-start] 'password password' 0.75fr [row4-end]
      [row5-start] '. forgot' 0.4fr [row5-end]
      [row6-start] 'login login' 1fr [row6-end]
      [row7-start] 'request request' 1fr [row7-end]
      / auto;

    .grid {
      @each $area in $loginareas {
        &--#{$area} {
          grid-area: $area;
        }
      }

      &--title {
        align-self: end;
        p {
          @apply text-5xl;
        }
      }
      &--sub {
        p {
          @apply text-3xl;
        }
      }
      &--forgot {
        a {
          @apply text-right;
        }
      }
      &--email,
      &--password {
        align-self: center;
      }
      &--login {
        align-self: center;
      }
      &--login,
      &--request {
        button {
          @apply text-h1;
        }
      }
    }
  }
}
</style>
