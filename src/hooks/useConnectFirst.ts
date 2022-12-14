import { computed, onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { parsePhoneNumber } from 'libphonenumber-js';
import User from '../models/User';
import PhoneStatus from '../models/PhoneStatus';
import Incident from '../models/Incident';
import { store } from '../store';
import { getErrorMessage } from '../utils/errors';
import Worksite from '../models/Worksite';
import PhoneOutbound from '../models/PhoneOutbound';
import usePhoneService from './phone/usePhoneService';

export default function useConnectFirst(context: { emit: Function }) {
  const $toasted = useToast();
  const { t } = useI18n();

  const currentAgent = ref<any>(null);
  const dialing = ref(false);

  const currentUser = computed(() =>
    User.find(User.store().getters['auth/userId']),
  );

  const languages = computed(() => currentUser?.value?.languages);
  const statuses = computed(() => PhoneStatus.all());
  const currentIncident = computed(() => {
    return Incident.find(currentIncidentId.value);
  });
  const currentIncidentId = computed(
    () => store.getters['incident/currentIncidentId'],
  );

  const isTakingCalls = computed(() => store.getters['phone/isTakingCalls']);
  const isNotTakingCalls = computed(
    () => store.getters['phone/isNotTakingCalls'],
  );
  const isOnCall = computed(() => store.getters['phone/isOnCall']);
  const isTransitioning = computed(
    () => store.getters['phone/isTransitioning'],
  );
  const isInboundCall = computed(() => store.getters['phone/isInboundCall']);
  const isOutboundCall = computed(() => store.getters['phone/isOutboundCall']);

  const callState = computed(() => store.getters['phone/callState']);
  const callType = computed(() => store.getters['phone/callType']);
  const call = computed(() => store.getters['phone/call']);
  const caller = computed(() => store.getters['phone/caller']);
  const incomingCall = computed(() => store.getters['phone/incomingCall']);
  const outgoingCall = computed(() => store.getters['phone/outgoingCall']);
  const stats = computed(() => store.getters['phone/stats']);
  const agentStats = computed(() => store.getters['phone/agentStats']);
  const callHistory = computed(() => store.getters['phone/callHistory']);
  const phoneService = reactive(usePhoneService());

  const setCallHistory = (callHistory: any) => {
    store.commit('phone/setCallHistory', callHistory);
  };

  const setCallType = (callType: any) => {
    store.commit('phone/setCallType', callType);
  };

  const setCaller = (caller: any) => {
    store.commit('phone/setCaller', caller);
  };

  const setOutgoingCall = (call: any) => {
    store.commit('phone/setOutgoingCall', call);
  };

  const setCurrentCall = (call: any) => {
    store.commit('phone/setCurrentCall', call);
  };

  async function setAvailable() {
    return phoneService.changeState('AVAILABLE');
  }

  async function setWorking() {
    return phoneService.changeState('WORKING');
  }

  async function setAway() {
    return phoneService.changeState('AWAY');
  }

  async function loadAgent() {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/phone_agents/me`,
      );
      currentAgent.value = data;
    } catch {
      const { data } = await phoneService.createAgent();
      currentAgent.value = data;
    }
  }

  async function logoutPhone() {
    // Await phoneService.changeState('AWAY');
    const agent_id = currentAgent?.value?.agent_id;
    if (agent_id) {
      await phoneService.logout(agent_id);
    }

    await loadAgent();
  }

  async function loginPhone(retry = true, status = 'WORKING') {
    await loadAgent();
    if (!languages?.value?.length) {
      await $toasted.error(t('phoneDashboard.select_language_error'));
      return;
    }

    if (!currentUser?.value?.mobile) {
      await $toasted.error(t('phoneDashboard.add_phone_number_error'));
      return;
    }

    if (!phoneService.loggedInAgentId) {
      const password = import.meta.env.VITE_APP_PHONE_DEFAULT_PASSWORD;

      if (!currentAgent?.value?.agent_username) {
        const { data } = await phoneService.createAgent();
        currentAgent.value = data;
      }

      try {
        phoneService.username = currentAgent?.value?.agent_username;
        phoneService.password = password;
        phoneService.agent_id = currentAgent?.value?.agent_id;
        if (!phoneService.cf) {
          const result = await phoneService.getAccessToken();
          phoneService.initPhoneService(result.accessToken);
        }

        await phoneService.login(
          currentAgent?.value?.agent_username,
          password,
          status,
          currentAgent?.value?.agent_id,
        );
        context.emit('onLoggedIn');
      } catch {
        // This.$log.debug(e);
        if (retry) {
          await logoutPhone();
          await loginPhone(false, status);
        }
      }
    } else {
      await setWorking();
      context.emit('onLoggedIn');
    }

    phoneService.apiUpdateStats(phoneService.loggedInAgentId).catch(() => {});
  }

  async function logoutByPhoneNumber() {
    if (currentUser?.value?.mobile) {
      const parsedNumber = parsePhoneNumber(currentUser?.value?.mobile, 'US');
      await Promise.all(
        phoneService.queueIds.map(async (queueId: string) =>
          phoneService
            .apiLoginsByPhone(
              parsedNumber.formatNational().replace(/[^\d.]/g, ''),
              queueId,
            )
            .then(async ({ data }: any) => {
              if (data.length > 0) {
                await Promise.all(
                  data.map(async (login: any) =>
                    phoneService.apiLogoutAgent(login.agentId),
                  ),
                );
                phoneService.initPhoneService();
              }

              return null;
            })
            .catch(() => {}),
        ),
      );
    }
  }

  async function createOutboundCall(outbound: any, number: string) {
    const dnisResponse = await axios.get(
      `${import.meta.env.VITE_APP_API_BASE_URL}/phone_dnis/${outbound.dnis1}`,
    );
    const caller = dnisResponse.data;
    let callType = outbound.call_type.toUpperCase();
    if (callType !== 'CALLDOWN') {
      callType = 'OUTBOUND';
    }

    setCallType(callType);
    setOutgoingCall(outbound);
    setCurrentCall(outbound);
    setCaller(caller);
    await phoneService.dial(
      number,
      currentIncident?.value?.active_phone_number,
    );
  }

  async function dialManualOutbound(number: string) {
    await loginPhone(true, 'WORKING');
    dialing.value = true;
    try {
      const outbound = await PhoneOutbound.api().createManual({
        number,
        incidentId: currentIncidentId.value,
        userId: currentUser?.value?.id,
        language: currentUser?.value?.primary_language,
      });
      await createOutboundCall(outbound, number);
    } catch (error) {
      await $toasted.error(getErrorMessage(error));
    } finally {
      dialing.value = false;
    }
  }

  async function dialNextOutbound() {
    dialing.value = true;
    try {
      const outbound = await PhoneOutbound.api().getNextOutbound({
        incidentId: currentIncidentId.value,
      });
      if (outbound.worksite) {
        await Worksite.api().fetch(outbound.worksite);
      }

      await createOutboundCall(outbound, outbound.phone_number);
    } finally {
      dialing.value = false;
    }
  }

  onMounted(async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_API_BASE_URL}/phone_agents/call_history`,
    );
    setCallHistory(data);
  });

  return {
    currentAgent,
    dialing,
    currentIncidentId,
    loadAgent,
    setAvailable,
    setWorking,
    setAway,
    callState,
    callType,
    call,
    caller,
    incomingCall,
    outgoingCall,
    stats,
    agentStats,
    languages,
    callHistory,
    isTakingCalls,
    isNotTakingCalls,
    isOnCall,
    isTransitioning,
    isInboundCall,
    isOutboundCall,
    dialManualOutbound,
    setCurrentIncidentId(id: string) {
      store.commit('incident/setCurrentIncidentId', id);
    },
    setOutgoingCall,
    setIncomingCall(call: any) {
      store.commit('phone/setIncomingCall', call);
    },
    setCurrentCall,
    setCaller,
    setState(state: any) {
      store.commit('phone/setState', state);
    },
    setCallType,
    setCallHistory,
    setGeneralStats(stats: any) {
      store.commit('phone/setGeneralStats', stats);
    },
    clearCall() {
      store.commit('phone/clearCall');
    },
    resetState() {
      store.commit('phone/resetState');
    },
    loginPhone,
  };
}
