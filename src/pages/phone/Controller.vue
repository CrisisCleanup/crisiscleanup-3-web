<template>
  <Loader
    :loading="loading"
    :class="`w-full h-full phone-controller ${
      scriptPopup ? 'popup-active' : ''
    } ${renderPopup ? 'popup' : ''}`"
  >
    <template #content>
      <script-popup
        v-if="renderPopup"
        @dismissed="() => (scriptPopup = false)"
        :script-name="scriptName"
      />
      <phone-layout>
        <template #grid-start>
          <div class="grid-start">
            <agent-block />
          </div>
        </template>
        <template #grid-main>
          <div class="grid-main">
            <agent-board />
          </div>
        </template>
        <template #grid-end>
          <div class="grid-end flex">
            <agent-actions>
              <template #case>
                <case-form
                  :key="currentCaseId"
                  :incident-id="
                    contactAttributes.incidentId
                      ? contactAttributes.incidentId
                      : '199'
                  "
                  :pda-id="currentCaseType === 'pda' ? currentCaseId : null"
                  :worksite-id="
                    currentCaseType === 'worksite' ? currentCaseId : null
                  "
                  disable-claim-and-save
                  :before-save="beforeWorksiteSave"
                  :data-prefill="prefillData"
                  @savedWorksite="savedWorksite"
                  @closeWorksite="closeWorksite"
                  @navigateToWorksite="
                    (id) => setCurrentCase({ id, type: 'worksite' })
                  "
                />
              </template>
              <template #resources>
                <phone-resources />
              </template>
            </agent-actions>
          </div>
        </template>
      </phone-layout>
    </template>
  </Loader>
</template>

<script>
import PhoneLayout from '@/layouts/Phone.vue';
import AgentBlock from '@/components/phone/blocks/Agent.vue';
import CaseForm from '@/pages/CaseForm.vue';
import AgentBoard from '@/components/phone/AgentBoard/Board.vue';
import { EVENTS as CCEvent, STATES as CCState } from '@/services/acs.service';
import { EventBus } from '@/event-bus';
import Loader from '@/components/Loader.vue';
import { LocalStorageMixin, AgentMixin } from '@/mixins';
import ScriptPopup from '@/components/phone/ScriptPopup.vue';
import Pda from '@/models/Pda';
import AgentActions from '@/components/phone/AgentActions/Actions.vue';
import PhoneResources from '@/components/phone/AgentActions/Resources.vue';

export default {
  name: 'Controller',
  mixins: [AgentMixin, LocalStorageMixin],
  components: {
    PhoneResources,
    AgentActions,
    PhoneLayout,
    CaseForm,
    AgentBlock,
    AgentBoard,
    Loader,
    ScriptPopup,
  },
  data() {
    return {
      worksite: null,
      loading: false,
      scriptPopup: false,
      renderPopup: false,
    };
  },
  methods: {
    closeWorksite() {
      EventBus.$emit(CCEvent.OFF_CALL);
      this.setContactState(CCState.POLLING);
    },
    async savedWorksite(worksite) {
      this.worksite = worksite;
      this.$log.debug('Saved worksite: ', worksite);
      if (this.currentCaseType === 'pda') {
        this.$log.debug('associating worksite to pda...');
        await Pda.api().associateWorksite(this.currentCase.id, worksite.id);
      }

      this.addCases({ worksites: [worksite.id] });
      this.setCaseStatus({ modified: [worksite.id] });
      EventBus.$emit(CCEvent.CASE_SAVED, worksite);
    },
    async beforeWorksiteSave() {
      if (!this.caseStatusId) {
        this.$toasted.error(this.$t('~~You must set a Call Status!'));
        return false;
      }
      return true;
    },
  },
  computed: {
    prefillData() {
      if (this.callerId) {
        return {
          phone1: this.callerId,
        };
      }
      return {};
    },
    scriptName() {
      const { incidentId } = this.contactAttributes;
      if (incidentId === '199' && this.callType === 'outbound') {
        if (this.pdas.length) {
          return 'covidPda';
        }
        return 'covid';
      }
      return this.callType;
    },
  },
  async mounted() {
    if (!this.existsLocalStorage('ccu-ivr-hide-popup')) {
      this.renderPopup = true;
      this.scriptPopup = true;
    }
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
