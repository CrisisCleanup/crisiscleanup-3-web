<template>
  <div class="navbar overflow-y-auto">
    <router-link :to="logoRoute.to" class="logo--grid">
      <div class="logo flex justify-center p-3">
        <img 
          src="../../assets/crisiscleanup_logo.png"
          style="height: 53px"
          data-testid="testCrisiscleanupLogoIcon"
        />
      </div>
    </router-link>

    <div class="menu overflow-y-auto grid">
      <NavButton
        v-for="r in routes"
        :key="r.key"
        :data-testid="$t(`test${r.key}Link`)"
        class="overflow-y-auto"
        :route="r"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import NavButton from './NavButton.vue';

export default defineComponent({
  name: 'NavMenu',
  components: { NavButton },
  props: {
    routes: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    logoRoute: {
      type: Object,
      default: () => ({}),
    },
  },
});
</script>

<style>
@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .navbar {
    @apply mb-20;
  }
}
</style>
