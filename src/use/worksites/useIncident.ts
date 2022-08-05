/**
 * Use Incident Hook
 */

import { computed } from 'vue';
import { useStore } from 'vuex';
import User from '@/models/User';
import Incident from '@/models/Incident';

export default () => {
  const store = useStore();
  const currentIncident = computed(
    () => store.getters['incident/currentIncident'],
  );
  const currentIncidentId = computed(
    () => currentIncident.value && currentIncident.value.id,
  );
  // see: https://vuex.vuejs.org/guide/composition-api.html#accessing-mutations-and-actions
  const setCurrentIncidentId = (id: string | number) =>
    store.commit('incident/setCurrentIncidentId', id);

  const setCurrentIncident = async (id: number | string) => {
    if (parseInt(id.toString()) !== parseInt(currentIncidentId.value)) {
      await Incident.fetchById(id);
      await User.api().updateUserState({
        incident: id,
      });
      await setCurrentIncidentId(id);
    }
  };

  return {
    setCurrentIncident,
    currentIncident,
    currentIncidentId,
  };
};
