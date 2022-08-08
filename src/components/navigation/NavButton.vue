<script lang="ts" setup>
import { computed, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

interface NavButtonProps {
  route: {
    key: string;
    text?: string;
    to?: string;
    disabled?: boolean;
    icon: string | Record<string, unknown>;
    iconSize?: string;
  };
}

const route = useRoute();
const { t: $t } = useI18n();
const props = defineProps<NavButtonProps>();

// eslint-disable-next-line no-unused-vars
const iconProps = computed(() =>
  typeof props.route.icon === 'object'
    ? props.route.icon
    : {
        type: props.route.icon || props.route.key,
        size: 'xl',
      },
);

// eslint-disable-next-line no-unused-vars
const isActive = computed(() =>
  $t(route.name as string).includes(props.route.key?.toLowerCase()),
);
</script>

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
        v-bind="iconProps"
        :linked="true"
      />
      <div class="menu-text mt-1">
        {{ route.text || $t(`nav.${route.key}`) }}
      </div>
    </div>
  </router-link>
</template>

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
