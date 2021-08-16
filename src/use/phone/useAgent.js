// @flow
/**
 * useAgent Hook
 */

import { computed, ref, watch } from '@vue/composition-api';
import { useGetters } from '@u3u/vue-hooks';
import AgentClient from '@/models/phone/AgentClient';

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

  const _agentClient = computed(() =>
    AgentClient.query().withAllRecursive().first(),
  );
  if (_agentClient.value) {
    loading.value = false;
  }

  watch(
    () => getters.agentClientId.value,
    () => {
      if (getters.agentClientId.value && loading.value) {
        _agent.value = AgentClient.query().withAllRecursive().first();
        loading.value = false;
      }
    },
  );

  return {
    loading,
    agent: _agentClient,
  };
};
