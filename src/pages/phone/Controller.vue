<template>
  <Loader
    :loading="false"
    :class="`w-full h-full phone-controller ${
      scriptPopup ? 'popup-active' : ''
    } ${renderPopup ? 'popup' : ''}`"
  >
    <template #content>
      <script-popup
        v-if="renderPopup"
        @dismissed="() => (scriptPopup = false)"
        :script-name="callType"
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
                  v-bind="caseFormProps"
                  :key="activeCaseId"
                  :incident-id="String(currentIncident.id)"
                  disable-claim-and-save
                  :data-prefill="prefillData"
                  @savedWorksite="savedWorksite"
                  @navigateToWorksite="(id) => setActiveCase(id)"
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
// @flow
import PhoneLayout from '@/layouts/Phone.vue';
import AgentBlock from '@/components/phone/blocks/Agent.vue';
import CaseForm from '@/pages/CaseForm.vue';
import AgentBoard from '@/components/phone/AgentBoard/Board.vue';
import Loader from '@/components/Loader.vue';
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

export default {
  name: 'Controller',
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
  setup(props, context) {
    const { getters, state, actions } = useController();

    const { agent } = useAgent();
    const { currentContact, callType } = useContact({ agent });

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
