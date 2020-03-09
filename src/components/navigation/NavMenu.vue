<template>
  <div class="sidebar">
    <div class="logo flex justify-center p-3">
      <img src="@/assets/crisiscleanup_logo.png" style="height: 53px" />
    </div>
    <div class="menu">
      <NavButton v-for="r in routes" :key="r.key" :route="r" />
    </div>
  </div>
</template>

<script>
import NavButton from './NavButton';

export default {
  name: 'NavMenu',
  components: { NavButton },
  props: {
    routes: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style>
.sidebar {
  background-color: #2d2d2d;
}
</style>
