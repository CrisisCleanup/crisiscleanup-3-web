// @flow
/**
 * useAgent Hook
 */

import AgentClient from '@/models/phone/AgentClient';
import { computed, ref, watch } from '@vue/composition-api';
import { useGetters } from '@u3u/vue-hooks';

/**
 * Hook for utilizing connect agent.
 * @returns {{agent: ComputedRef<any>, loading: Ref<UnwrapRef<boolean>>}}
 */
export default () => {
  const loading = ref(true);
  const _agent = ref(null);
  const getters = {
    ...useGetters('phone.streams', ['agentClientId']),
  };

  const _agentClient = computed(() => AgentClient.query().first());

  watch(
    () => getters.agentClientId.value,
    () => {
      if (getters.agentClientId.value && loading.value) {
        _agent.value = AgentClient.query().first();
        loading.value = false;
      }
    },
  );

  return {
    loading,
    agent: _agentClient,
  };
};
