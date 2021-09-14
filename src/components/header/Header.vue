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
          >
            <template #list-header>
              <div
                class="
                  px-5
                  py-1
                  cursor-pointer
                  flex
                  items-center
                  hover:bg-gray-300 hover:text-white
                "
                @click="showRedeployModal = true"
              >
                <ccu-icon
                  :alt="$t('actions.add_incident')"
                  type="active"
                  size="small"
                  class="mr-1"
                />
                {{ $t('actions.add_incident') }}
              </div>
            </template>
          </form-select>
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

        <UserProfileMenu
          @auth:logout="() => $emit('auth:logout')"
          class="header-item"
        />
      </div>
    </div>
    <RedeployRequest
      v-if="showRedeployModal"
      :hide-trigger="true"
      :open-modal="true"
      @close="showRedeployModal = false"
    />
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import DisasterIcon from '@/components/DisasterIcon.vue';
import useUser from '@/use/user/useUser';
import PhoneStatus from '@/components/header/PhoneStatus.vue';
import UserProfileMenu from '@/components/header/UserProfileMenu.vue';
import RedeployRequest from '@/pages/RedeployRequest';

export default {
  name: 'Header',
  components: {
    RedeployRequest,
    UserProfileMenu,
    DisasterIcon,
    PhoneStatus,
  },
  props: {
    incidents: VueTypes.array,
    currentIncident: VueTypes.object,
  },
  data() {
    return {
      showRedeployModal: false,
    };
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
