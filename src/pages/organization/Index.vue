<template>
  <div class="flex flex-col h-full" data-testid="testMyOrganizationDashboardDiv">
    <div
      class="h-max bg-white mx-5 border-t md:flex grid grid-cols-2 justify-around text-crisiscleanup-grey-700"
    >
      <template v-for="r in routes">
        <router-link
          v-if="!r.isDisabled"
          :key="`myorg-nav-${r.name}`"
          :to="`/organization/${r.name}`"
          class="flex justify-center mx-2 cursor-pointer"
          :data-testid="`testMyOrganizationNav${r.name}Link`"
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
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'Organization',
  setup(props) {
    const route = useRoute();

    const _routes = computed(() => {
      return [
        {
          name: 'invitations',
          key: 'invitation_management',
          isActive: route.name === 'invitations',
        },
        {
          name: 'users',
          key: 'user_management',
          isActive: route.name === 'users',
        },
        {
          name: 'teams',
          key: 'team_management',
          isActive: route.name === 'teams',
        },
        {
          name: 'profile',
          key: 'organization_profile',
          isActive: route.name === 'profile',
        },
        {
          name: 'affiliates',
          key: 'affiliated_orgs',
          isActive: route.name === 'affiliates',
        },
        {
          name: 'layers',
          key: 'layer_library',
          isActive: route.name === 'layers',
        },
      ].map((r) => ({
        isDisabled: false,
        class: {
          'router-link': true,
          'router-link-active': false,
        },
        ...r,
      }));
    });

    const routes = computed(() => {
      return _routes.value.map((r) => {
        if (r.isActive) {
          r.class['router-link-active'] = true;
        }

        return r;
      });
    });

    return {
      routes,
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
