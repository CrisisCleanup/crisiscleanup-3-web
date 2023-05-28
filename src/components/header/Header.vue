<template>
  <div class="header header--grid bg-white w-full" style="z-index: 4999">
    <div class="flex justify-between h-full items-center">
      <div class="flex items-center ml-2">
        <div class="h-10 w-10 flex items-center">
          <DisasterIcon
            v-if="currentIncident && currentIncident.incidentImage"
            :current-incident="currentIncident"
            data-testid="testDisasterIcon"
          />
        </div>
        <div class="flex flex-col ml-2 md:w-84 lg:w-84">
          <BaseSelect
            :key="String(currentIncident && currentIncident.id)"
            :model-value="currentIncident?.id"
            :options="incidents"
            :clearable="false"
            data-testid="testIncidentSelectorSelect"
            searchable
            container-classes="relative mx-auto w-full flex items-center justify-end cursor-pointer bg-white text-base leading-snug outline-none"
            select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded p-2"
            item-key="id"
            label="name"
            @update:modelValue="(payload: string) => $emit('update:incident', payload)"
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
          <div class="flex ml-2 font-bold mt-2">
            <span>{{ $t($route.name as string) }}</span>
          </div>
        </div>
      </div>
      <div v-if="can('development_mode')" class="flex gap-2">
        <base-button
          class="p-1.5"
          variant="solid"
          data-testid="testDebugUserButton"
          :text="$t('actions.debug_user')"
          :alt="$t('actions.debug_user')"
          :action="showCurrentUser"
        />
        <base-button
          class="p-1.5"
          variant="solid"
          data-testid="testDebugIncidentStatesButton"
          :text="$t('actions.debug_incident_states')"
          :alt="$t('actions.debug_incident_states')"
          :action="showCurrentIncidentStates"
        />
      </div>
      <div class="flex h-full items-center">
        <div
          v-if="can && can('phone_agent')"
          class="flex items-center header-item h-full"
          data-testid="testPhoneIndicatorDiv"
        >
          <PhoneIndicator />
        </div>

        <UserProfileMenu
          class="header-item"
          @auth:logout="() => $emit('auth:logout')"
          data-testid="testLogoutLink"
        />
      </div>
    </div>
    <RedeployRequest
      v-if="showRedeployModal"
      :hide-trigger="true"
      :open-modal="true"
      data-testid="testRedeployRequestButton"
      @close="showRedeployModal = false"
    />
  </div>
</template>

<script lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import DisasterIcon from '../DisasterIcon.vue';
import BaseSelect from '../BaseSelect.vue';
import useDialogs from '../../hooks/useDialogs';
import JsonWrapper from '../JsonWrapper.vue';
import useAcl from '../../hooks/useAcl';
import PhoneIndicator from '../phone/PhoneIndicator.vue';
import RedeployRequest from '../modals/RedeployRequest.vue';
import UserProfileMenu from './UserProfileMenu.vue';
import User from '@/models/User';

export default defineComponent({
  name: 'Header',
  components: {
    RedeployRequest,
    PhoneIndicator,
    BaseSelect,
    UserProfileMenu,
    DisasterIcon,
  },
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
  setup(props) {
    const { component } = useDialogs();
    const { $can } = useAcl();
    const { t } = useI18n();
    const store = useStore();

    const currentUser = computed(() => User.find(store.getters['auth/userId']));
    async function showCurrentUser() {
      await component({
        title: `User: ${currentUser?.value?.id} | ${currentUser?.value?.first_name} ${currentUser?.value?.last_name}`,
        component: JsonWrapper,
        classes: 'w-full h-96',
        props: {
          jsonData: currentUser.value,
        },
      });
    }

    async function showCurrentIncidentStates() {
      const states = currentUser?.value?.getStatesForIncident(
        props.currentIncident?.id,
        true,
      );
      await component({
        title: `Incident: ${props.currentIncident?.id}`,
        component: JsonWrapper,
        classes: 'w-full h-96',
        props: {
          jsonData: states,
        },
      });
    }

    const showRedeployModal = ref(false);
    return {
      can: $can,
      showRedeployModal,
      showCurrentUser,
      $t(text: string) {
        return text ? t(text) : null;
      },
      showCurrentIncidentStates,
    };
  },
});
</script>
