/**
 * useAgent Hook
 */

import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import AgentClient from '@/models/phone/AgentClient';

/**
 * Hook for utilizing connect agent.
 * @returns {{agent: ComputedRef<any>, loading: Ref<UnwrapRef<boolean>>}}
 */
export default () => {
  const loading = ref(true);
  const _agent = ref<AgentClient | null>(null);
  const store = useStore();
  const agentClientId = computed(
    () => store.getters['phone.streams'].agentClientId,
  );

  const _agentClient = computed(() =>
    AgentClient.query().withAllRecursive().first(),
  );
  if (_agentClient.value) {
    loading.value = false;
  }

  watch(
    () => agentClientId.value,
    () => {
      if (agentClientId.value && loading.value) {
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
