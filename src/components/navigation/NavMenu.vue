<template>
  <div class="sidebar">
    <div class="logo flex justify-center p-3">
      <img src="@/assets/crisiscleanup_logo.png" style="height: 53px;" />
    </div>
    <div class="menu">
      <NavButton v-for="r in routes" :key="r.key" :route="r" />
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import NavButton from './NavButton';

export default {
  name: 'NavMenu',
  components: { NavButton },
  props: {
    routes: VueTypes.arrayOf(
      VueTypes.shape({
        key: VueTypes.string,
        text: VueTypes.string,
        to: VueTypes.string,
        icon: VueTypes.string,
        iconSize: VueTypes.string,
        disabled: VueTypes.bool,
      }),
    ),
  },
};
</script>

<style>
.sidebar {
  background-color: #2d2d2d;
}
</style>
