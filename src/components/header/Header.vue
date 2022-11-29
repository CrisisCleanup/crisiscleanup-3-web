<template>
  <div class="header header--grid bg-white w-full">
    <div class="flex justify-between h-full items-center">
      <div class="flex items-center ml-2">
        <div class="h-10 w-10 flex items-center">
          <DisasterIcon
            v-if="currentIncident && currentIncident.incidentImage"
            :current-incident="currentIncident"
          />
        </div>
        <div class="flex flex-col ml-2 md:w-84 lg:w-84">
          <BaseSelect
            :key="String(currentIncident && currentIncident.id)"
            :model-value="currentIncident?.id"
            :options="incidents"
            :clearable="false"
            searchable
            select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded py-2"
            item-key="id"
            label="name"
            @update:modelValue="(payload) => $emit('update:incident', payload)"
          >
            <template #list-header>
              <div
                class="px-5 py-1 cursor-pointer flex items-center hover:bg-gray-300 hover:text-white"
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
          </BaseSelect>
          <div class="flex ml-2 font-bold">
            <span>{{ $t($route.name) }}</span>
          </div>
        </div>
      </div>
      <div v-if="$can('development_mode')">
        <base-button
          class="p-1.5"
          variant="solid"
          :text="$t('actions.debug_user')"
          :action="showCurrentUser"
        />
      </div>
      <div class="flex h-full items-center">
        <div
          v-if="$can && $can('phone_agent')"
          class="flex items-center header-item h-full"
        >
          <PhoneIndicator />
        </div>

        <!--        <UserProfileMenu-->
        <!--          @auth:logout="() => $emit('auth:logout')"-->
        <!--          class="header-item"-->
        <!--        />-->
      </div>
    </div>
    <!--    <RedeployRequest-->
    <!--      v-if="showRedeployModal"-->
    <!--      :hide-trigger="true"-->
    <!--      :open-modal="true"-->
    <!--      @close="showRedeployModal = false"-->
    <!--    />-->
  </div>
  <!--  </div>-->
</template>

<script>
// import VueTypes from 'vue-types';
import DisasterIcon from '../DisasterIcon.vue';
// import useUser from '@/use/user/useUser';
// import { DialogsMixin } from '@/mixins';
// import UserProfileMenu from '@/components/header/UserProfileMenu.vue';
// import RedeployRequest from '@/pages/RedeployRequest';
import { computed, ref } from 'vue';
import BaseSelect from '../BaseSelect.vue';
import { useStore } from 'vuex';
import useDialogs from '../hooks/useDialogs';
import User from '../../models/User';
import JsonWrapper from '../JsonWrapper.vue';
import useAcl from '../hooks/useAcl';
import PhoneIndicator from '../phone/PhoneIndicator.vue';

export default {
  name: 'Header',
  components: {
    PhoneIndicator,
    BaseSelect,
    // RedeployRequest,
    // UserProfileMenu,
    DisasterIcon,
  },
  // mixins: [DialogsMixin],
  props: {
    incidents: {
      type: Array,
      default: () => [],
    },
    currentIncident: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const store = useStore();
    const { component } = useDialogs();
    const { $can } = useAcl();
    const currentUser = computed(() =>
      User.find(User.store().getters['auth/userId']),
    );
    async function showCurrentUser() {
      await component({
        title: `User: ${currentUser.value.id} | ${currentUser.value.first_name} ${currentUser.value.last_name}`,
        component: JsonWrapper,
        classes: 'w-full h-96',
        props: {
          jsonData: currentUser.value,
        },
      });
    }
    const showRedeployModal = ref(false);
    return {
      $can,
      showRedeployModal,
      showCurrentUser,
    };
  },
};
</script>

<style scoped lang="postcss">
/*.header {*/
/*  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.0649858);*/
/*  border: 1px solid #efefef;*/
/*}*/

/*.header-item {*/
/*  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.0649858);*/
/*  border: 1px solid rgba(151, 151, 151, 0.1);*/
/*  @apply px-2;*/
/*}*/
</style>
