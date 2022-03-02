<template>
  <div class="bg-white p-2 text-xs">
    <div class="flex items-center justify-between">
      <div class="flex items-start justify-start">
        <div class="flex">
          <base-text variant="bodysm">{{ currentUser.mobile }}</base-text>
        </div>
      </div>
      <div class="p-3">
        <div class="flex flex-row tags">
          <div class="mx-2 text-crisiscleanup-dark-200">
            {{ $t('phoneDashboard.languages') }}
          </div>
          <div
            v-for="l in languages"
            :key="`l_${l}`"
            class="flex flex-col tag-container"
          >
            <LanguageTag class="tag-item" :language-id="l.id" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <base-button
        v-if="isOnCall || caller"
        size="medium"
        :disabled="true"
        :text="$t('phoneDashboard.on_call')"
        class="text-white bg-crisiscleanup-light-grey"
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
    </div>
  </div>
</template>

<script>
import { ConnectFirstMixin } from '@/mixins';
import LanguageTag from '@/components/tags/LanguageTag';

export default {
  name: 'Agent',
  components: { LanguageTag },
  mixins: [ConnectFirstMixin],
};
</script>

<style scoped></style>
