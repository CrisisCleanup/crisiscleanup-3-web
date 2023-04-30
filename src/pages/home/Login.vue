<template>
  <Home>
    <div class="flex items-center justify-around h-full p-3">
      <LoginForm class="w-120" />
      <div class="grid--globe hidden md:block">
        <div class="homegrid-globe">
          <img src="../../assets/globe.png" :alt="$t('loginForm.globe')" />
        </div>
      </div>
    </div>
  </Home>
</template>

<script lang="ts">
import LoginForm from '../../components/LoginForm.vue';
import Home from '../../layouts/Home.vue';

export default defineComponent({
  name: 'Login',
  components: { Home, LoginForm },
});
</script>

<style scoped></style>
