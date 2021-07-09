<template>
  <div>
    <script-popup
      @dismissed="() => (scriptPopup = false)"
      :active="scriptPopup"
      v-if="scriptPopup"
      :script="currentScript"
      :script-color="currentScriptColor"
    />
    <div
      :class="`ctrl__container w-full h-full phone-controller ${
        scriptPopup ? 'popup-active' : ''
      }`"
    >
      <div class="ctrl__section">
        <div class="ctrl__agent">
          <div class="phone__agentcard">
            <AgentCard />
          </div>
          <div class="phone__general">
            <GeneralStatistics />
          </div>
          <div class="phone__agentmetrics">
            <AgentAnalytics />
          </div>
        </div>
      </div>

      <div class="ctrl__section">
        <div class="ctrl__board">
          <agent-board />
        </div>
      </div>

      <div class="ctrl__section">
        <div class="ctrl__actions">
          <agent-actions>
            <template #case>
              <case-form
                v-bind="caseFormProps"
                :key="
                  JSON.stringify({
                    activeCaseId,
                    activeIncidentId,
                    prefillData,
                  })
                "
                :incident-id="String(activeIncidentId || currentIncident.id)"
                disable-claim-and-save
                :data-prefill="prefillData"
                @savedWorksite="savedWorksite"
                @navigateToWorksite="(id) => setActiveCase(id)"
                class="h-full"
                no-grid
              />
            </template>
            <template #resources>
              <phone-resources />
            </template>
          </agent-actions>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @flow
import CaseForm from '@/pages/CaseForm.vue';
import AgentBoard from '@/components/phone/AgentBoard/Board.vue';
import ScriptPopup from '@/components/phone/ScriptPopup.vue';
import Pda from '@/models/Pda';
import AgentActions from '@/components/phone/AgentActions/Actions.vue';
import PhoneResources from '@/components/phone/AgentActions/Resources.vue';
import useIncident from '@/use/worksites/useIncident';
import { computed, ref } from '@vue/composition-api';
import useContact from '@/use/phone/useContact';
import Worksite from '@/models/Worksite';
import { useLocalStorage } from 'vue-composable';
import useController from '@/use/phone/useController';
import AgentCard from '@/components/phone/AgentCard.vue';
import GeneralStatistics from '@/components/phone/Widgets/GeneralStatistics.vue';
import AgentAnalytics from '@/components/phone/Cards/StatsCard.vue';
import { create } from 'vue-modal-dialogs';
import ComponentDialog from '@/components/dialogs/ComponentDialog';
import BoardStatus from '@/components/phone/AgentBoard/Status.vue';
import useScripts from '@/use/phone/useScripts';

const StatusPopup = (props, { root }) => {
  return () => (
    <div class="py-12 px-3 flex flex-col">
      <BoardStatus
        hide-end-contact
        select-id={root.$t('phoneDashboard.call_status')}
      />
    </div>
  );
};

export default {
  name: 'PhoneController',
  components: {
    PhoneResources,
    AgentActions,
    CaseForm,
    AgentBoard,
    ScriptPopup,
    AgentCard,
    GeneralStatistics,
    AgentAnalytics,
  },
  setup(props, context) {
    const { getters, state, actions } = useController();

    const { currentContact, callType, callerName, activeIncident } =
      useContact();

    const { storage } = useLocalStorage('ccu-ivr-hide-script', false);
    const renderPopup = computed(() => storage.value === false);
    const scriptPopup = ref(renderPopup.value);

    const caseFormProps = computed(() => {
      const isPda = getters.activeCaseType.value === Pda;
      const isNew = getters.activeCaseId.value === -1;
      return {
        pdaId: !isNew && isPda ? getters.activeCaseId.value : null,
        worksiteId: !isNew && !isPda ? getters.activeCaseId.value : null,
        beforeSave: async () => {
          if (!state.status.value.statusId) {
            const compDialog = create(ComponentDialog);
            context.root.$toasted.error(
              context.root.$t('phoneDashboard.call_status_required'),
            );
            const val = await compDialog({
              title: 'Call Status',
              component: StatusPopup,
            });
            return !!(val === 'ok' && state.status.value.statusId);
          }
          return true;
        },
      };
    });

    const prefillData = computed(() => ({
      phone1: currentContact.value ? currentContact.value.callerId : '',
      name: callerName.value === 'Unknown' ? '' : callerName.value,
    }));

    const setActiveCase = async (caseId: number | string) => {
      const wksite = await Worksite.fetchOrFindId(caseId);
      if (wksite) {
        await actions.setCase(wksite);
      }
    };

    return {
      ...useIncident(),
      ...getters,
      ...state,
      ...actions,
      currentContact,
      caseFormProps,
      prefillData,
      setActiveCase,
      renderPopup,
      scriptPopup,
      callType,
      ...useScripts({
        callType,
        incident: activeIncident,
        recentWorksite: currentContact.value
          ? currentContact.value.mostRecentWorksite
          : null,
      }),
      async savedWorksite(worksite) {
        context.root.$log.debug('worksite saved:', worksite);
        await actions.addCase({
          contact: currentContact.value,
          newCase: worksite,
        });
      },
    };
  },
};
</script>

<style scoped lang="scss">
.phone-controller {
  &.popup {
    transition: transform 1.2s ease;
  }
  &.popup-active {
    transform: translateY(8rem);
  }
}
</style>

<style scoped lang="postcss">
@lost flexbox flex;
$neg-y-pad: calc(0rem - theme('spacing.6'));
$neg-x-pad: calc(0rem - theme('spacing.6'));
$neg-tab-height: calc(0rem - theme('spacing.8'));

.ctrl {
  &__container {
    max-height: calc(100vh - 4.5rem);
    lost-flex-container: row;
    transition: transform 300ms easeInOutCirc;
    @apply pl-6;

    &.popup-active {
      transform: translateY(8rem);
    }

    .ctrl__section {
      lost-column: 1/2 0;
      @screen xl {
        lost-column: 1/4 0;
      }
      @apply pt-6;

      &:first-child {
        display: none;
        @screen xl {
          display: initial;
        }
      }

      &:nth-child(2) {
        lost-column: 1/2 0;
      }

      &:last-child {
        padding-top: 0;
        max-height: calc(100vh + $neg-tab-height - 80px + $neg-y-pad);
      }

      .ctrl__agent {
        lost-flex-container: column;
        div {
          lost-row: 1/3;
        }
      }

      .ctrl__actions,
      .ctrl__board {
        @apply h-full;
      }
    }
  }
}
</style>
