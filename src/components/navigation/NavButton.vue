<template>
  <router-link
    :to="route.to"
    class="menu-item router-link p-2 border-b border-t border-gray-800"
    :class="{ 'router-link-active': isActive }"
    :data-cy="`navigation.${route.key}`"
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
a:hover,
a:active,
a:focus {
  outline: 0;
}
.router-link-active.menu-item {
  background-color: transparent;
  position: relative;
}

.router-link-active.menu-item::before {
  content: '';
  width: 3px;
  height: 100%;
  left: 0;
  top: 0;
  display: block;
  position: absolute;
  background-color: theme('colors.primary.light');
}

.menu-text {
  line-height: 15px;
  color: white;
  text-decoration: none !important;
}
</style>
