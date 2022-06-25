<template>
  <v-popover
    :popover-class="['popover', dark && 'dark']"
    trigger="click"
    popover-inner-class="popover-inner max-w-sm"
  >
    <base-text :style="[nameStyle]" class="details-name" variant="body">
      <span
        v-if="userItem"
        :class="`${nameClass} tooltip-target cursor-pointer hover:text-primary-dark`"
        >{{ userItem.full_name }}</span
      >
      <slot
    /></base-text>
    <template #popover>
      <div class="tooltip-content">
        <div class="text-base" v-if="userItem">{{ userItem.full_name }}</div>
        <div class="text-xs" v-if="userItem">{{ userItem.organization.name }}</div>
        <div class="mt-2" v-if="userItem">
          <font-awesome-icon icon="envelope" />
          <a :href="`mailto:${userItem.email}`" class="ml-1">{{
            userItem.email
          }}</a>
        </div>
        <div v-if="userItem && userItem.mobile">
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
import VueTypes from 'vue-types';
import { UserMixin } from '@/mixins';
import User from '@/models/User';

export default {
  name: 'UserDetailsTooltip',
  mixins: [UserMixin],
  data() {
    return {
      asyncUser: null,
    };
  },
  mounted() {
    const user = this.getUser(this.user);
    if (!user) {
      User.api().get(`/users/${this.user}`, {});
    }
  },
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
