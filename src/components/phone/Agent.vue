<template>
  <div class="bg-white p-2 text-xs flex justify-end w-full">
    <div class="flex items-center justify-center">
      <PhoneIndicator />
    </div>
    <div class="flex items-center justify-between mr-3">
      <div class="flex items-start justify-start">
        <div class="flex ml-4">
          <base-text variant="bodysm">{{ currentUser.mobile }}</base-text>
        </div>
      </div>
      <div class="py-3">
        <div class="flex flex-row tags">
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
        size="medium"
        :disabled="true"
        :text="$t('phoneDashboard.on_call')"
        class="text-white bg-crisiscleanup-dark-400 bg-opacity-40"
      ></base-button>
      <base-button
        v-else-if="isNotTakingCalls"
        variant="solid"
        size="medium"
        :action="loginPhone"
        :text="$t('phoneDashboard.start_taking_calls')"
      ></base-button>
      <base-button
        v-else-if="!isOnCall"
        variant="solid"
        size="medium"
        :action="setAway"
        :text="$t('phoneDashboard.stop_taking_calls')"
      ></base-button>
      <base-checkbox
        v-if="currentUser.isAdmin"
        class="p-0.5 ml-3"
        @input="$emit('onToggleOutbounds', $event)"
        >{{ $t('phoneDashboard.serve_outbound_calls') }}</base-checkbox
      >
      <ccu-icon
        @click="$phoneService.hangup"
        v-if="(isOnCall || caller) && isOutboundCall"
        size="lg"
        class="ml-2"
        type="hangup"
      ></ccu-icon>
    </div>
    <EditAgentModal @cancel="editingAgent = false" v-if="editingAgent" />
  </div>
</template>

<script>
import LanguageTag from '../../components/tags/LanguageTag.vue';
import EditAgentModal from '../../components/phone/EditAgentModal.vue';
import PhoneIndicator from '../../components/phone/PhoneIndicator.vue';
import { computed, ref } from 'vue';
import useConnectFirst from '../../hooks/useConnectFirst';
import useCurrentUser from '../../hooks/useCurrentUser';
import { useStore } from 'vuex';

export default {
  name: 'Agent',
  components: { PhoneIndicator, EditAgentModal, LanguageTag },
  setup(props, context) {
    const editingAgent = ref(false);
    const { currentUser } = useCurrentUser();
    const store = useStore();
    const phoneService = computed(() => store.getters['phone/phoneService']);
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
      hangup: phoneService.value.hangup,
    };
  },
};
</script>
