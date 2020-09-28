<template>
  <div class="shadow header--grid bg-white">
    <div class="flex justify-between h-full items-center">
      <div class="flex items-center ml-2">
        <div class="h-10 w-10 flex items-center">
          <DisasterIcon
            v-show="$mq !== 'sm'"
            v-if="currentIncident && currentIncident.incidentImage"
            :current-incident="currentIncident"
          />
        </div>
        <div class="flex flex-col ml-2 md:w-84 lg:w-84">
          <form-select
            :key="String(currentIncident.id)"
            :value="currentIncident"
            :options="incidents"
            :clearable="false"
            searchable
            select-classes="h-12"
            item-key="id"
            label="name"
            @input="(payload) => $emit('update:incident', payload)"
          />
          <div class="flex ml-2 font-bold">
            <span>{{ $t(route.name) }}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center overflow-hidden">
        <v-popover
          popover-class="menu-popover"
          placement="bottom-end"
          data-cy="auth.userprofile"
        >
          <div class="flex cursor-pointer items-center">
            <img
              :src="currentUser && currentUser.profilePictureUrl"
              class="rounded-full w-10 h-10"
            />
            <span class="p-3">
              {{ currentUser && currentUser.full_name }}
              <font-awesome-icon class="cursor-pointer" icon="caret-down" />
            </span>
          </div>
          <div slot="popover" class="flex flex-col">
            <base-button
              data-cy="auth.userprofile.profile"
              class="text-base p-2 hover:bg-crisiscleanup-light-grey cursor-pointer"
              :text="$t('actions.profile')"
              :action="
                () => {
                  $router.push(`/profile`);
                }
              "
            />
            <base-button
              data-cy="auth.userprofile.logout"
              class="text-base p-2 hover:bg-crisiscleanup-light-grey cursor-pointer"
              :text="$t('actions.logout')"
              :action="() => $emit('auth:logout')"
            />
          </div>
        </v-popover>
      </div>
    </div>
  </div>
</template>

<script>
import DisasterIcon from '@/components/DisasterIcon.vue';
import VueTypes from 'vue-types';
import useUser from '@/use/user/useUser';
import { useRouter } from '@u3u/vue-hooks';

export default {
  name: 'Header',
  components: {
    DisasterIcon,
  },
  props: {
    incidents: VueTypes.array,
    currentIncident: VueTypes.object,
  },
  setup() {
    return {
      ...useUser(),
      ...useRouter(),
    };
  },
};
</script>

<style scoped></style>
