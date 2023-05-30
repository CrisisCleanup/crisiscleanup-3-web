<template>
  <div v-if="caller" class="flex flex-col items-center justify-between">
    <div
      v-if="isConnecting"
      data-testid="testIsConnectingDiv"
      class="px-2 py-1 w-full text-white bg-crisiscleanup-lightblue-800"
    >
      {{ $t('phoneDashboard.connecting') }}
    </div>
    <div
      v-else-if="isOnCall"
      data-testid="testIsOnCallDiv"
      class="px-2 py-1 w-full text-white bg-crisiscleanup-dark-blue"
    >
      <div v-if="isInboundCall" data-testid="testIsInboundCallDiv">
        {{ $t('phoneDashboard.inbound_call') }}
      </div>
      <div v-if="isOutboundCall" data-testid="testIsOutboundCallDiv">
        {{ $t('phoneDashboard.outbound_call') }}
      </div>
    </div>
    <div
      v-else 
      class="px-2 py-1 w-full text-white bg-crisiscleanup-green-300"
      data-testid="testIsCompletedDiv"
    >
      {{ $t('phoneDashboard.completed') }}
    </div>

    <div
      class="p-1"
      :style="{ backgroundColor: scripts.currentScriptColor.value }"
    >
      <base-text variant="h3" data-testid="testCurrentScriptHeaderContent">{{
        $t(scripts.currentScriptHeader.value[0])
      }}</base-text>
      <base-text variant="bodysm" data-testid="testCurrentScriptValueContent">
        {{ `"${$t(scripts.currentScript.value)}"` }}
      </base-text>
    </div>

    <div
      v-if="caller"
      data-testid="testCallerDiv"
      class="flex items-start justify-between w-full py-1 px-2"
    >
      <div class="flex items-center">
        <base-text variant="h2" data-testid="testCallerDnisContent">
          {{ caller.dnis }}
        </base-text>
        <div
          class="text-xs text-crisiscleanup-dark-200 ml-2"
          data-testid="testCallerLocationNameStateNameContent"
        >
          {{ caller.location_name }} {{ caller.state_name }}
        </div>
      </div>
      <div
        v-if="caller.number_of_inbound_calls"
        data-testid="testNumberOfInboundCallsDiv"
        class="text-xs text-crisiscleanup-dark-200"
      >
        {{
          `${caller.number_of_inbound_calls} ${$t(
            'phoneDashboard.calls',
          )} | ${moment().diff(moment(caller.created_at), 'days')} ${$t(
            'phoneDashboard.days',
          )}`
        }}
      </div>
    </div>
    <div v-if="cards.length > 0" data-testid="testExistingCasesDiv">
      {{ $t('phoneDashboard.existing_cases') }}
    </div>
    <div class="flex overflow-x-auto overflow-y-hidden w-full">
      <div
        class="cursor-pointer bg-crisiscleanup-light-grey p-1 flex-grow-0 flex-shrink-0 w-32 h-24 m-1"
        :class="Boolean(caseId) ? '' : 'border'"
        @click="() => setCase(null)"
      >
        <div class="flex flex-col items-center justify-center h-full">
          <base-text
            variant="h3"
            data-testid="testNewCaseContent"
            class="text-crisiscleanup-dark-400"
          >
            {{ $t('phoneDashboard.new_case') }}
          </base-text>
        </div>
      </div>
      <div
        v-for="c in cards"
        :key="`${c.id}`"
        :data-testid="`test${c.id}Content`"
        class="flex-grow-0 flex-shrink-0 w-56 m-1 h-24"
      >
        <div
          class="cursor-pointer bg-crisiscleanup-light-grey p-1 h-full w-full"
          :class="c.id === caseId ? 'border' : ''"
          @click="() => setCase(c)"
        >
          <div class="flex items-center">
            <div
              class="cases-svg-container p-1"
              data-testid="testWorktypeSVGIcon"
              v-html="getSVG(c.worktype)"
            ></div>
            <div class="px-1" data-testid="testCaseNumberDiv">{{ c.caseNumber }}</div>
          </div>
          <div class="px-1" data-testid="testCaseNameDiv">{{ c.name }}</div>
          <div class="text-xs text-crisiscleanup-dark-200 p-1" data-testid="testCaseAddressStateDiv">
            {{ c.address }} {{ c.state }}
          </div>
        </div>
      </div>
    </div>
    <ccu-icon
      v-if="(isOnCall || caller) && isOutboundCall"
      data-testid="testHangupIcon"
      :alt="$t('actions.hangup')"
      size="lg"
      class="ml-2"
      type="hangup"
      @click="hangup"
    ></ccu-icon>
  </div>
</template>
<script lang="ts">
import * as Sentry from '@sentry/browser';
import { computed, reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
import moment from 'moment';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import useScripts from '../../hooks/phone/useScripts';
import Worksite from '../../models/Worksite';
import useWorktypeImages from '../../hooks/worksite/useWorktypeImages';
import useConnectFirst from '../../hooks/useConnectFirst';
import useCurrentUser from '../../hooks/useCurrentUser';
import usePhoneService from '../../hooks/phone/usePhoneService';
import type { WorkType } from '@/models/types';

export default defineComponent({
  name: 'ActiveCall',
  props: {
    caseId: {
      type: Number,
      default: null,
    },
  },
  setup(props, context) {
    const store = useStore();
    const { getWorktypeSVG } = useWorktypeImages();
    const { currentUser } = useCurrentUser();
    const $toasted = useToast();
    const { t } = useI18n();
    const phoneService = reactive(usePhoneService());

    const hangup = () => {
      phoneService.hangup();
    };

    const {
      isTakingCalls,
      isTransitioning,
      isOnCall,
      callType,
      call,
      caller,
      callState,
      isInboundCall,
      isOutboundCall,
      setPotentialFailedCall,
    } = useConnectFirst(context);
    const currentIncident = store.getters['incident/currentIncidentId'];
    const cards = ref<Record<string, any>[]>([]);
    const connectingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
    function getSVG(worktype: WorkType) {
      return getWorktypeSVG(worktype);
    }

    function setCase(caseObject: Record<string, any> | null) {
      context.emit('setCase', caseObject);
    }

    const scripts = computed(() => {
      return useScripts({
        callType: callType.value,
        incident: currentIncident,
        recentWorksite: cards.value[0],
      });
    });

    watch(
      () => call.value,
      (newValue) => {
        if (newValue && newValue.worksite) {
          const c = Worksite.find(newValue.worksite) as Worksite;
          cards.value = [
            {
              name: c.name,
              caseNumber: c.case_number ?? `PDA-${c.id}`,
              address: c.short_address,
              state: c.state,
              worktype: Worksite.getWorkType(c.work_types, null, null),
              fullAddress: c.full_address,
              id: c.id,
              type: c.case_number ? 'worksite' : 'pda',
              incident: c.incident,
              updated_at: c.updated_at,
            },
          ];
        }
      },
    );

    watch(
      () => isTransitioning.value,
      (newValue) => {
        if (newValue) {
          const startedConnecting = moment().toISOString();
          connectingTimeout.value = setTimeout(() => {
            const context = {
              user: currentUser?.$toJson(),
              caller: caller.value,
              callState: callState.value,
              isInboundCall: isInboundCall.value,
              isOutboundCall: isOutboundCall.value,
              startedConnecting,
              connectingTimedOut: moment().toISOString(),
            };
            Sentry.setContext('call_info', context);
            Sentry.captureException(
              'Call is stuck connecting state for 45 seconds',
            );
            $toasted.error(t('phoneDashboard.could_not_connect'));
            setPotentialFailedCall(call.value);
            phoneService.hangup();
          }, 45_000);
        } else {
          clearTimeout(
            connectingTimeout.value as ReturnType<typeof setTimeout>,
          );
        }
      },
    );

    const isConnecting = computed(() => {
      return isTransitioning.value || (isTakingCalls.value && !isOnCall.value);
    });

    return {
      cards,
      connectingTimeout,
      getSVG,
      setCase,
      scripts,
      isConnecting,
      isOnCall,
      isInboundCall,
      isOutboundCall,
      caller,
      moment,
      hangup,
    };
  },
});
</script>

<style>
.cases-svg-container svg {
  width: 25px;
  height: 25px;
}
</style>
