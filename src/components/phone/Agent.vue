<template>
  <div class="bg-white p-2 text-xs flex justify-end w-full">
    <div class="flex items-center justify-center">
      <PhoneIndicator />
    </div>
    <div class="flex items-center justify-between mr-3">
      <div class="flex items-start justify-start">
        <div class="flex ml-4">
          <base-text
            v-if="currentUser"
            data-testid="testCurrentUserMobileContent"
            variant="bodysm"
          >
            {{currentUser.mobile}}
          </base-text>
        </div>
      </div>
      <div class="py-3">
        <div class="flex flex-row tags" data-testid="testPhoneDashboardLanguagesDiv">
          <div class="mx-2 text-crisiscleanup-dark-200">
            {{ $t('phoneDashboard.languages') }}
          </div>
          <div
            v-for="l in languages"
            :key="`l_${l}`"
            class="flex flex-col tag-container"
          >
            <LanguageTag class="tag-item mx-0.5" :language-id="l.id" />
          </div>
          <ccu-icon
            type="edit"
            data-testid="testLanguageEditIcon"
            size="small"
            class="mx-1"
            :alt="$t('actions.edit')"
            @click="editingAgent = true"
          />
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <base-button
        v-if="isOnCall || caller"
        data-testid="testIsOnCallButton"
        size="medium"
        :disabled="true"
        :text="$t('phoneDashboard.on_call')"
        class="text-white bg-crisiscleanup-dark-400 bg-opacity-40"
      ></base-button>
      <base-button
        v-else-if="isNotTakingCalls"
        data-testid="testIsNotTakingCallsButton"
        variant="solid"
        size="medium"
        :action="loginPhone"
        :text="$t('phoneDashboard.start_taking_calls')"
      ></base-button>
      <base-button
        v-else-if="!isOnCall"
        data-testid="testIsNotOnCallButton"
        variant="solid"
        size="medium"
        :action="setAway"
        :text="$t('phoneDashboard.stop_taking_calls')"
      ></base-button>
      <base-checkbox
        v-if="currentUser && currentUser.isAdmin"
        data-testid="testServeOutboundCallsCheckbox"
        class="p-0.5 ml-3"
        @update:modelValue="$emit('onToggleOutbounds', $event)"
        >{{ $t('phoneDashboard.serve_outbound_calls') }}</base-checkbox
      >
      <ccu-icon
        v-if="(isOnCall || caller) && isOutboundCall"
        data-testid="testHangupIcon"
        size="lg"
        class="ml-2"
        type="hangup"
        @click="hangup"
      ></ccu-icon>
    </div>
    <EditAgentModal v-if="editingAgent" @cancel="editingAgent = false" />
  </div>
</template>

<script lang="ts">
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import LanguageTag from '../tags/LanguageTag.vue';
import useConnectFirst from '../../hooks/useConnectFirst';
import EditAgentModal from './EditAgentModal.vue';
import PhoneIndicator from './PhoneIndicator.vue';
import usePhoneService from '@/hooks/phone/usePhoneService';
import User from '@/models/User';

export default defineComponent({
  name: 'Agent',
  components: { PhoneIndicator, EditAgentModal, LanguageTag },
  setup(props, context) {
    const editingAgent = ref(false);
    const currentUser = computed(() => User.find(store.getters['auth/userId']));
    const store = useStore();
    const phoneService = reactive(usePhoneService());
    const {
      languages,
      isOnCall,
      caller,
      isNotTakingCalls,
      setAway,
      loginPhone,
      isOutboundCall,
    } = useConnectFirst(context);
    return {
      editingAgent,
      languages,
      currentUser,
      isOnCall,
      caller,
      isNotTakingCalls,
      setAway,
      loginPhone,
      isOutboundCall,
      hangup: phoneService.hangup,
    };
  },
});
</script>
