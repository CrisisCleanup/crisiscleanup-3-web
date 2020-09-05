<template>
  <div
    :class="`ctrl__container w-full h-full phone-controller ${
      scriptPopup ? 'popup-active' : ''
    } ${renderPopup ? 'popup' : ''}`"
  >
    <script-popup
      v-if="renderPopup"
      @dismissed="() => (scriptPopup = false)"
      :script-name="callType"
    />

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
              :style="{ maxHeight: '90vh' }"
              v-bind="caseFormProps"
              :key="activeCaseId"
              :incident-id="String(currentIncident.id)"
              disable-claim-and-save
              :data-prefill="prefillData"
              @savedWorksite="savedWorksite"
              @navigateToWorksite="(id) => setActiveCase(id)"
              class="h-full"
            />
          </template>
          <template #resources>
            <phone-resources />
          </template>
        </agent-actions>
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
import useAgent from '@/use/phone/useAgent';
import Worksite from '@/models/Worksite';
import { useLocalStorage } from 'vue-composable';
import _ from 'lodash';
import useController from '@/use/phone/useController';
import AgentCard from '@/components/phone/AgentCard.vue';
import GeneralStatistics from '@/components/phone/Widgets/GeneralStatistics.vue';
import AgentAnalytics from '@/components/phone/Cards/StatsCard.vue';

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

    const { agent } = useAgent();
    const { currentContact, callType, callerName } = useContact({ agent });

    const { storage } = useLocalStorage('ccu-ivr-hide-popup');
    const renderPopup = computed(() => _.isNil(storage.value));
    const scriptPopup = ref(renderPopup.value);

    const caseFormProps = computed(() => {
      const isPda = getters.activeCaseType.value === Pda;
      const isNew = getters.activeCaseId.value === -1;
      return {
        pdaId: !isNew && isPda ? getters.activeCaseId.value : null,
        worksiteId: !isNew && !isPda ? getters.activeCaseId.value : null,
        beforeSave: () => {
          if (!state.status.value.statusId) {
            context.root.$toasted.error(
              context.root.$t('~~You must set a Call Status!'),
            );
            return false;
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

.ctrl {
  &__container {
    lost-flex-container: row;

    .ctrl__section {
      &:first-child {
        display: none;
        lost-column: 1/4 0;
        @screen xl {
          display: initial;
          lost-column: 1/4 0;
        }
      }
      &:nth-child(2) {
        lost-column: 1/2 0 0;
        @screen xl {
          lost-column: 2/4 0 0;
        }
      }
      &:last-child {
        lost-column: 1/2 0;
        @screen xl {
          lost-column: 1/4 0;
        }

        margin: $neg-y-pad $neg-x-pad $neg-y-pad theme('spacing.6') !important;
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

/*.ctrl {*/
/*  &__container {*/
/*    lost-flex-container: row;*/
/*    ^&__agent {*/
/*      @apply h-full;*/
/*      lost-column: 1/4;*/
/*      @screen xl {*/
/*        lost-column: 1/5;*/
/*      }*/
/*      & > div {*/
/*        margin-bottom: 30px;*/
/*      }*/
/*    }*/
/*    ^&__board {*/
/*      lost-column: 3/5;*/
/*      lost-align: center;*/
/*    }*/
/*    ^&__actions {*/
/*      @apply h-full;*/
/*      lost-column: 1/5;*/
/*      position: absolute;*/
/*      right: 0;*/
/*      top: 0;*/
/*    }*/
/*  }*/
/*}*/
</style>
