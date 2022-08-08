/**
 * Use Contact Hook
 */

import { ref, computed, watch, ComputedRef } from 'vue';
import { mapState, mapGetters, useStore } from 'vuex';
import _ from 'lodash';
import Contact, { CallType, ContactActions } from '@/models/phone/Contact';
import { useIntervalFn } from '@/use/useIntervalFn';
import useAgent from '@/use/phone/useAgent';
import useIncident from '@/use/worksites/useIncident';

export default () => {
  const _agent = useAgent().agent;

  const callPending = computed(() =>
    _agent.value ? _agent.value.isConnecting : false,
  );

  const callConnected = computed(() =>
    _agent.value ? _agent.value.isConnected : false,
  );

  const currentContact = computed(() =>
    _agent.value ? _agent.value.currentContact : null,
  );

  const isReady = computed(() =>
    currentContact.value ? currentContact.value.isReady : false,
  );

  const store = useStore();
  const currentCase = computed(
    () => store.state['phone.controller'].currentCase,
  );
  const activeCaseId = computed(
    () => store.getters['phone.controller'].activeCaseId,
  );
  const phoneContactStore = computed(
    () => store.state['entities/phone/contact'],
  );

  const items = [
    'dnis',
    'worksites',
    'pdas',
    'locale',
    'outbounds',
    'inbound',
    'outbound',
  ] as const;
  const state = items.reduce((acc, key) => {
    acc[key] = computed(() => phoneContactStore.value[key]);
    return acc;
  }, {} as Record<typeof items[number], ComputedRef>);

  const callType = computed(() => {
    if (currentContact.value) {
      return currentContact.value.callType;
    }
    return CallType.INBOUND;
  });

  const callDnis = computed(() => (state.dnis.value ? state.dnis.value : null));

  const callerName = computed(() => {
    if (currentCase.value && activeCaseId.value !== -1) {
      return currentCase.value.name;
    }
    if (callDnis.value) {
      return _.get(callDnis.value.meta, 'caller_name', 'Unknown');
    }
    return 'Unknown';
  });

  const callerNumber = computed(() => {
    if (currentContact.value && currentContact.value.callerId) {
      return currentContact.value.callerId;
    }
    if (callDnis.value) {
      return callDnis.value.dnisNational;
    }
    return '(000) 000-0000';
  });

  const callerHistory = computed(() => {
    if (callDnis.value) {
      return {
        total: callDnis.value.totalCalls,
        recent: callDnis.value.lastCallDays,
      };
    }
    return {
      total: 1,
      recent: window.vue.$t('phoneDashboard.first_call'),
    };
  });

  const callDuration = ref(0);

  const syncDuration = useIntervalFn(() => {
    if (callConnected.value) {
      // eslint-disable-next-line no-unused-expressions
      currentContact?.value?.getCallDuration().then((time) => {
        if (time > callDuration.value) {
          callDuration.value = time;
        }
      });
    }
  }, 1000);

  const syncAttributes = useIntervalFn(() => {
    if (
      callPending.value &&
      currentContact.value &&
      !currentContact.value.isReady
    ) {
      Contact.syncAttributes(currentContact.value.contactId, null);
    }
  }, 2500);

  watch(
    () => currentContact.value,
    () => {
      if (
        currentContact.value &&
        [
          ContactActions.MISSED,
          ContactActions.ENDED,
          ContactActions.ABANDON,
        ].includes(currentContact.value.action)
      ) {
        syncDuration.stop();
      }
      if (currentContact.value && currentContact.value.isReady) {
        syncAttributes.stop();
      }
      if (currentContact.value && !currentContact.value.isReady) {
        syncAttributes.start();
      }
    },
  );

  const activeCalls = computed(() => [
    {
      name: callerName.value,
      locale: state.locale.value
        ? _.get(state.locale.value, 'name_t', '').split(' ')[0]
        : '',
      time: callDuration.value,
      mobile: currentContact.value ? currentContact.value.callerId : '',
    },
  ]);

  const callerCases = computed(() => [
    ...state.pdas.value,
    ...state.worksites.value,
  ]);

  const { currentIncident } = useIncident();

  const activeIncident = computed(() => {
    if (currentContact.value && currentContact.value.incident) {
      return currentContact.value.incident;
    }
    return currentIncident.value;
  });

  return {
    activeIncident,
    callPending,
    callConnected,
    isReady,
    currentContact,
    callDnis,
    callerHistory,
    callerName,
    callState: state,
    callType,
    syncDuration,
    activeCalls,
    callDuration,
    callerCases,
    callerNumber,
  };
};
