<template>
  <router-link
    v-if="!route.disabled"
    :to="route.to"
    class="menu-item router-link p-2 border-b border-t border-gray-800"
    :class="{ 'router-link-active': isActive }"
    :data-cy="`navigation.${route.key}`"
  >
    <div :key="route.key" class="flex flex-col items-center relative">
      <badge
        v-if="route.newBadge"
        width="2rem"
        height="1rem"
        class="text-white bg-crisiscleanup-red-700 mx-1 absolute -top-0.5 -right-8 p-3"
        :title="$t('info.new_badge')"
        >{{ $t('info.new') }}</badge
      >
      <ccu-icon
        :alt="$t(`nav.${route.key}`)"
        v-bind="iconProps"
        :linked="true"
      />
      <div class="menu-text mt-1 text-center">
        {{ route.text || $t(`nav.${route.key}`) }}
      </div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'NavButton',
  props: {
    route: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const { t } = useI18n();

    const iconProps = computed(() => {
      return typeof props.route.icon === 'object'
        ? props.route.icon
        : {
            type: props.route.icon || props.route.key,
            size: 'xl',
          };
    });

    const routeName = useRoute().name;
    const isActive = computed(() =>
      routeName
        ? t(routeName as string).includes(props.route.key.toLowerCase())
        : false,
    );

    return {
      isActive,
      iconProps,
      routeName,
    };
  },
});
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
