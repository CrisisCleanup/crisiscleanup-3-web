// @flow
/**
 * Use Incident Hook
 */

import { useGetters } from '@u3u/vue-hooks';

export default () => {
  const { currentIncident } = useGetters('incident', ['currentIncident']);
  return {
    currentIncident,
  };
};
