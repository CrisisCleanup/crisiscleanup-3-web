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

        <UserProfileMenu class="header-item" />
      </div>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import DisasterIcon from '@/components/DisasterIcon.vue';
import useUser from '@/use/user/useUser';
import PhoneStatus from '@/components/header/PhoneStatus.vue';
import UserProfileMenu from '@/components/header/UserProfileMenu.vue';

export default {
  name: 'Header',
  components: {
    UserProfileMenu,
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
  border: 1px solid rgba(151, 151, 151, 0.1);
  @apply px-2;
}
</style>
