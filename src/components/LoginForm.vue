<template>
  <form @sumit.prevent="loginUser" class="logingrid grid-container">
    <div class="grid--title mb-3">
      <base-text
        font="display"
        variant="h1"
        class="text-crisiscleanup-dark-500 text-5xl"
        >{{ lang.login }}</base-text
      >
    </div>
    <div class="grid--sub">
      <base-text
        variant="h1"
        :weight="300"
        font="display"
        class="text-crisiscleanup-dark-500 text-3xl mb-12"
      >
        {{ lang.signIn }}
      </base-text>
    </div>
    <div class="grid--email my-4">
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
    <div class="grid--password my-4">
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
    <div class="grid--forgot my-2">
      <base-link :to="nav.request_password_reset" text-variant="h2">{{
        lang.forgot
      }}</base-link>
    </div>
    <div class="grid--login my-4">
      <base-button
        variant="solid"
        size="large"
        class="w-full"
        data-cy="loginForm.login"
        :action="loginUser"
      >
        {{ lang.login }}
      </base-button>
    </div>
    <div class="grid--request my-4">
      <base-button
        variant="outline"
        size="large"
        class="w-full"
        :action="() => router.push('/request_access')"
      >
        {{ lang.request }}
      </base-button>
    </div>
  </form>
</template>

<script>
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import BaseButton from "./BaseButton.vue";
import { useI18n } from "vue-i18n";

export default {
  name: "LoginForm",
  components: { BaseButton },
  props: {
    redirect: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const store = useStore();
    const $toasted = useToast();
    const route = useRoute();
    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const acceptedInvite = ref(Boolean(route.query.accepted));
    const { t } = useI18n();

    const lang = reactive({
      login: t("actions.login"),
      signIn: t("loginForm.sign_in_msg"),
      forgot: t("actions.forgot_password"),
      request: t("actions.request_access"),
      email: t("loginForm.email_placeholder"),
      password: t("loginForm.password_placeholder"),
      invalidCreds: t("loginForm.invalid_credentials_msg"),
    });

    const nav = reactive({
      request_password_reset: "/password/new",
    });

    async function loginUser() {
      try {
        await store.dispatch("auth/login", {
          email: email.value,
          password: password.value,
        });
      } catch (e) {
        await $toasted.error(lang.invalidCreds);
      }
      if (this.redirect) {
        if (route.query.from) {
          await router.replace(route.query.from);
        } else {
          await router.push("/auth");
        }
      } else {
        store.commit("auth/setShowLoginModal", false);
      }
    }

    return {
      email,
      password,
      acceptedInvite,
      loginUser,
      lang,
      nav,
      router,
    };
  },
};
</script>

<style scoped></style>
