<template>
  <div class="bg-white p-2 text-xs">
    <div class="profile-menu__body flex cursor-pointer items-center">
      <Avatar
        :initials="currentUser && currentUser.first_name"
        :url="currentUser && currentUser.profilePictureUrl"
        class="p-1"
        size="small"
      />
      <base-text variant="h3" class="p-3" regular>
        <span class="font-h3 text-h3 font-normal subpixel-antialiased"
          >{{ currentUser && currentUser.full_name }}
        </span>
      </base-text>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-start justify-start">
        <div class="flex">
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
            :alt="$t('~~Edit')"
            @click.native="editingAgent = true"
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
        class="p-0.5"
        @input="$emit('onToggleOutbounds', $event)"
        >{{ $t('phoneDashboard.serve_outbound_calls') }}</base-checkbox
      >
      <ccu-icon
        @click.native="$phoneService.hangup"
        v-if="(isOnCall || caller) && isOutboundCall"
        size="lg"
        type="hangup"
      ></ccu-icon>
    </div>
    <EditAgentModal @cancel="editingAgent = false" v-if="editingAgent" />
  </div>
</template>

<script>
import { ConnectFirstMixin } from '@/mixins';
import LanguageTag from '@/components/tags/LanguageTag';
import EditAgentModal from '@/components/phone/EditAgentModal';
import Avatar from '@/components/Avatar';

export default {
  name: 'Agent',
  components: { Avatar, EditAgentModal, LanguageTag },
  mixins: [ConnectFirstMixin],
  data() {
    return {
      editingAgent: false,
    };
  },
};
</script>

<style scoped></style>
