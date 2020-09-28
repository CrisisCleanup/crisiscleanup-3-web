// @flow
/**
 * Use Incident Hook
 */

import { useGetters } from '@u3u/vue-hooks';

export default () => {
  const { currentIncident, currentIncidentId } = useGetters('incident', [
    'currentIncident',
    'currentIncidentId',
  ]);
  return {
    currentIncident,
    currentIncidentId,
  };
};
