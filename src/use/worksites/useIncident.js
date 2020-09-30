// @flow
/**
 * Use Incident Hook
 */

import { useGetters, useMutations } from '@u3u/vue-hooks';
import User from '@/models/User';
import Incident from '@/models/Incident';
import { computed } from '@vue/composition-api';

export default () => {
  const { currentIncident } = useGetters('incident', ['currentIncident']);

  const { setCurrentIncidentId } = useMutations('incident', [
    'setCurrentIncidentId',
  ]);

  const currentIncidentId = computed(
    () => currentIncident.value && currentIncident.value.id,
  );

  const setCurrentIncident = async (id: number | string) => {
    if (parseInt(id) !== parseInt(currentIncidentId.value)) {
      await Incident.fetchOrFindId(id);
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
