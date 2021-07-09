<template>
  <div class="shadow header header--grid bg-white">
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
            :key="String(currentIncident && currentIncident.id)"
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
            <span>{{ $t($route.name) }}</span>
          </div>
        </div>
      </div>

      <div class="flex h-full">
        <div
          v-if="$can && $can('phone_agent')"
          class="flex items-center header-item h-full"
        >
          <PhoneStatus />
        </div>

        <div class="flex items-center header-item overflow-hidden h-full">
          <v-popover
            popover-class="menu-popover"
            placement="bottom-end"
            data-cy="auth.userprofile"
          >
            <div class="flex cursor-pointer items-center">
              <Avatar
                :initials="currentUser && currentUser.first_name"
                :url="currentUser && currentUser.profilePictureUrl"
                class="p-1"
                size="small"
              />
              <base-text
                variant="h3"
                class="p-3 text-crisiscleanup-dark-300"
                regular
              >
                {{ currentUser && currentUser.full_name }}
                <font-awesome-icon class="cursor-pointer" icon="caret-down" />
              </base-text>
            </div>
            <div slot="popover" class="flex flex-col">
              <base-button
                data-cy="auth.userprofile.profile"
                class="
                  text-base
                  p-2
                  hover:bg-crisiscleanup-light-grey
                  cursor-pointer
                "
                :text="$t('actions.profile')"
                :action="
                  () => {
                    $router.push(`/profile`);
                  }
                "
              />
              <base-button
                data-cy="auth.userprofile.logout"
                class="
                  text-base
                  p-2
                  hover:bg-crisiscleanup-light-grey
                  cursor-pointer
                "
                :text="$t('actions.logout')"
                :action="() => $emit('auth:logout')"
              />
            </div>
          </v-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DisasterIcon from '@/components/DisasterIcon.vue';
import VueTypes from 'vue-types';
import useUser from '@/use/user/useUser';
import PhoneStatus from '@/components/header/PhoneStatus.vue';
import Avatar from '@/components/Avatar';

export default {
  name: 'Header',
  components: {
    Avatar,
    DisasterIcon,
    PhoneStatus,
  },
  props: {
    incidents: VueTypes.array,
    currentIncident: VueTypes.object,
  },
  setup() {
    return {
      ...useUser(),
    };
  },
};
</script>

<style scoped lang="postcss">
.header {
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.0649858);
  border: 1px solid #efefef;
}

.header-item {
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.0649858);
  border: 1px solid rgb(151, 151, 151, 0.1);
  @apply px-2;
}
</style>
