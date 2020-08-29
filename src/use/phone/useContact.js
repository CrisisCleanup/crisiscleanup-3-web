// @flow
/**
 * Use Contact Hook
 */

import { ref, computed, watch } from '@vue/composition-api';
import { wrap } from '@/utils/wrap';
import AgentClient from '@/models/phone/AgentClient';
import { useState } from '@u3u/vue-hooks';
import _ from 'lodash';
import { CallType, ContactActions } from '@/models/phone/Contact';
import { useIntervalFn } from '@vueuse/core';

export type UseContactProps = {|
  agent: AgentClient,
|};

export default ({ agent }) => {
  const _agent = wrap<AgentClient>(agent);

  const callPending = computed(() =>
    _agent.value ? _agent.value.isConnecting : false,
  );

  const callConnected = computed(() =>
    _agent.value ? _agent.value.isConnected : false,
  );

  const currentContact = computed(() =>
    _agent.value ? _agent.value.currentContact : null,
  );

  const { currentCase } = useState('phone.controller', ['currentCase']);
  const state = {
    ...useState('entities/phone/contact', [
      'dnis',
      'worksites',
      'pdas',
      'locale',
      'outbounds',
      'inbound',
      'outbound',
    ]),
  };

  const callerName = computed(() =>
    currentCase.value ? currentCase.value.name : 'Unknown',
  );

  const callType = computed(() =>
    state.inbound.value ? CallType.INBOUND : CallType.OUTBOUND,
  );

  const callDnis = computed(() => (state.dnis.value ? state.dnis.value : null));

  const callerHistory = computed(() => {
    if (callDnis.value) {
      return {
        total: callDnis.value.totalCalls,
        recent: callDnis.value.lastCallDays,
      };
    }
    return {
      total: 1,
      recent: '~~First Call',
    };
  });

  const callDuration = ref(0);

  const syncDuration = useIntervalFn(() => {
    if (callConnected.value) {
      currentContact.value.getCallDuration().then((time) => {
        if (time > callDuration.value) {
          callDuration.value = time;
        }
      });
    }
  }, 1000);

  watch(
    () => currentContact.value,
    () => {
      if (
        currentContact.value &&
        currentContact.value.action === ContactActions.ENDED
      ) {
        syncDuration.stop();
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

  return {
    callPending,
    callConnected,
    currentContact,
    callDnis,
    callerHistory,
    callerName,
    callState: state,
    callType,
    syncDuration,
    activeCalls,
    callDuration,
  };
};
