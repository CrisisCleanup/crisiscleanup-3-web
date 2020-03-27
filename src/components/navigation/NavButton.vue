<template>
  <router-link
    :to="route.to"
    class="menu-item router-link p-2 border-b border-t border-gray-800"
    :class="{ 'router-link-active': isActive }"
    :data-cy="`navigation.${route.key}`"
    v-if="!route.disabled"
  >
    <div :key="route.key" class="flex flex-col items-center">
      <ccu-icon
        :alt="$t(`nav.${route.key}`)"
        :type="route.icon || route.key"
        :size="route.iconSize"
      />
      <div class="menu-text mt-1">
        {{ route.text || $t(`nav.${route.key}`) }}
      </div>
    </div>
  </router-link>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'NavButton',
  props: {
    route: VueTypes.shape({
      key: VueTypes.string,
      text: VueTypes.string,
      to: VueTypes.string,
      icon: VueTypes.string,
      iconSize: VueTypes.string,
      disabled: VueTypes.bool,
    }),
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
