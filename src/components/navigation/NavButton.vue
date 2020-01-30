<template>
  <router-link
    :to="route.to"
    class="menu-item router-link p-2 border-b border-t border-gray-800"
    :class="{ 'router-link-active': isActive }"
  >
    <div :key="route.key" class="flex flex-col items-center">
      <ccu-icon
        :alt="$t(`nav.${route.key}`)"
        :type="route.icon || route.key"
        :size="route.iconSize"
      />
      <div class="menu-text mt-1">{{ $t(`nav.${route.key}`) }}</div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'NavButton',
  props: {
    route: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isActive() {
      return this.$t(this.$route.name).includes(this.route.key.toLowerCase());
    },
  },
};
</script>

<style scoped>
.router-link-active.menu-item {
  background-color: transparent;
  border-left: solid 3px theme('colors.primary.light');
}

.menu-text {
  line-height: 15px;
  color: white;
  text-decoration: none !important;
}
</style>
