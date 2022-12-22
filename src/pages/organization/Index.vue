<template>
  <div class="flex flex-col h-full" data-cy="myorg-dashboard">
    <div
      class="h-12 bg-white mx-5 border-t flex justify-around text-crisiscleanup-grey-700"
    >
      <template v-for="r in routes">
        <router-link
          v-if="r.isActive"
          :key="`myorg-nav-${r.name}`"
          :to="`/organization/${r.name}`"
          class="flex w-48 justify-center mx-2 cursor-pointer"
          :data-cy="`myorg-nav-${r.name}`"
          :class="r.class ? r.class : null"
        >
          <span class="p-3">
            {{ $t(`orgIndex.${r.key}`) }}
          </span>
        </router-link>
      </template>
    </div>
    <div class="flex-grow overflow-auto bg-crisiscleanup-light-grey">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'Organization',
  setup(props) {
    const route = useRoute();
    const isInvitationsActive = computed(() => {
      return route.meta.id === 'invitations';
    });

    const routeDefaults = {
      class: {
        'router-link': true,
        'router-link-active': isInvitationsActive.value,
      },
      isActive: true,
    };

    const routes = reactive(
      [
        {
          name: 'invitations',
          key: 'invitation_management',
        },
        {
          name: 'users',
          key: 'user_management',
        },
        {
          name: 'teams',
          key: 'team_management',
        },
        {
          name: 'profile',
          key: 'organization_profile',
        },
        {
          name: 'affiliates',
          key: 'affiliated_orgs',
        },
        {
          name: 'layers',
          key: 'layer_library',
        },
      ].map((r) => ({
        ...routeDefaults,
        ...r,
      })),
    );

    return {
      routes,
      isInvitationsActive,
    };
  },
});
</script>

<style lang="postcss" scoped>
.router-link:hover {
  text-decoration: none !important;
}

.router-link:active {
  text-decoration: none !important;
}

.router-link-active {
  background-color: transparent;
  border-bottom: solid 3px theme('colors.primary.light');
  @apply text-black;
}
</style>
