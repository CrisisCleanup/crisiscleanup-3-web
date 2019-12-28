<template>
  <div id="app">
    <component :is="layout">
      <router-view></router-view>
    </component>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

const default_layout = 'authenticated';
export default {
  name: 'App',
  methods: {
    ...mapActions('auth', ['login', 'logout']),
    ...mapGetters('auth', ['isLoggedIn']),
  },
  computed: {
    layout() {
      return `${this.$route.meta.layout || default_layout}-layout`;
    },
  },
};
</script>

<style>
body {
  height: 100vh;
  font-family: 'Nunito Sans', sans-serif;
}
</style>
