<template>
  <div class="sidebar">
    <router-link v-if="$mq === 'sm'" :to="logoRoute.to" class="logo--grid">
      <div class="logo flex justify-center p-3">
        <img src="@/assets/crisiscleanup_logo.png" style="height: 53px" />
      </div>
    </router-link>

    <div class="menu">
      <NavButton v-for="r in routes" :key="r.key" :route="r" />
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import NavButton from './NavButton';

const routeShape = VueTypes.shape({
  key: VueTypes.string,
  text: VueTypes.string,
  to: VueTypes.string,
  icon: VueTypes.oneOfType([VueTypes.string, VueTypes.object]),
  iconSize: VueTypes.string,
  disabled: VueTypes.bool,
});

export default {
  name: 'NavMenu',
  components: { NavButton },
  props: {
    routes: VueTypes.arrayOf(routeShape),
    logoRoute: routeShape,
  },
};
</script>

<style>
.sidebar {
  background-color: #2d2d2d;
}
</style>
