<template>
  <div class="navbar overflow-y-auto">
    <router-link :to="logoRoute.to" class="logo--grid">
      <div class="logo flex justify-center p-3">
        <img src="../../assets/crisiscleanup_logo.png" style="height: 53px" />
      </div>
    </router-link>

    <div class="menu overflow-y-auto grid">
      <NavButton
        class="overflow-y-auto"
        v-for="r in routes"
        :key="r.key"
        :route="r"
      />
    </div>
  </div>
</template>

<script>
import NavButton from './NavButton.vue';

export default {
  name: 'NavMenu',
  components: { NavButton },
  props: {
    routes: {
      type: Array,
      default: () => [],
    },
    logoRoute: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style>
@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .navbar {
    @apply mb-20;
  }
}
</style>
