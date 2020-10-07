<template>
  <v-popover
    :popover-class="['popover', dark && 'dark']"
    trigger="hover click"
    popover-inner-class="popover-inner max-w-sm"
  >
    <base-text :style="[nameStyle]" class="details-name" variant="body">
      <span :class="`${nameClass} tooltip-target cursor-pointer`">{{
        userItem.full_name
      }}</span>
      <slot
    /></base-text>
    <template #popover>
      <div class="tooltip-content">
        <div class="text-base">{{ userItem.full_name }}</div>
        <div class="text-xs">{{ userItem.organization.name }}</div>
        <div class="mt-2">
          <font-awesome-icon icon="envelope" />
          <a :href="`mailto:${userItem.email}`" class="ml-1">{{
            userItem.email
          }}</a>
        </div>
        <div v-if="userItem.mobile">
          <font-awesome-icon icon="phone" />
          <a :href="`tel:${userItem.mobile}`" class="ml-1">{{
            userItem.mobile
          }}</a>
        </div>
      </div>
    </template>
  </v-popover>
</template>

<script>
import { UserMixin } from '@/mixins';
import VueTypes from 'vue-types';

export default {
  name: 'UserDetailsTooltip',
  mixins: [UserMixin],
  props: {
    user: VueTypes.number,
    nameClass: VueTypes.string.def('text-yellow-600'),
    nameStyle: VueTypes.any,
    dark: VueTypes.bool.def(true),
  },
  computed: {
    userItem() {
      return this.getUser(this.user);
    },
  },
};
</script>

<style></style>
