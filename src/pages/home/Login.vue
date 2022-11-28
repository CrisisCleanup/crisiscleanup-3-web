<template>
  <Home>
    <div class="flex items-center justify-around h-full">
      <LoginForm class="w-120" />
      <div class="grid--globe self-center">
        <div class="homegrid-globe">
          <img src="../../assets/globe.png" :alt="$t('loginForm.globe')" />
        </div>
      </div>
    </div>
  </Home>
</template>

<script>
import LoginForm from "../../components/LoginForm.vue";
import Home from "../../layouts/Home.vue";
export default {
  name: "Login",
  components: { Home, LoginForm },
};
</script>

<style scoped></style>
