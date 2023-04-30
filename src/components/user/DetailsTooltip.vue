<template>
  <v-popover
    :popper-class="['popover', dark && 'dark']"
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
    <template #popper>
      <div class="tooltip-content">
        <div class="text-base" v-if="userItem">{{ userItem.full_name }}</div>
        <div class="text-xs" v-if="userItem">
          {{ userItem.organization.name }}
        </div>
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

<script lang="ts">
import { computed, onMounted, ref } from 'vue';
import User from '../../models/User';

export default defineComponent({
  name: 'UserDetailsTooltip',
  setup(props) {
    const asyncUser = ref(null);
    const userItem = computed(() => {
      return User.find(props.user);
    });
    onMounted(() => {
      const user = User.find(props.user);
      if (!user) {
        User.api().get(`/users/${props.user}`, {});
      }
    });
    return {
      asyncUser,
      userItem,
    };
  },
  props: {
    user: {
      type: Number,
    },
    nameClass: {
      type: String,
      default: 'text-yellow-600',
    },
    nameStyle: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<style></style>
