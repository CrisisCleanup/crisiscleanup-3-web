// @flow
/**
 * Use Phone Metrics Hook
 */

import { computed, onMounted } from '@vue/composition-api';
import ControllerStore from '@/store/modules/phone/controller';
import { getModule } from 'vuex-module-decorators';
import { useStore } from '@u3u/vue-hooks';
import type { PhoneMetric } from '@/store/modules/phone/types';

export type UsePhoneMetricsProps = {|
  metrics: PhoneMetric[],
|};

export default ({ metrics }: UsePhoneMetricsProps) => {
  const store = useStore();
  const ctrlStore = getModule(ControllerStore, store.value);

  const generalMetrics = computed(() => ctrlStore.getGeneralMetrics(metrics));
  const updateGenMetrics = async () => ctrlStore.updateMetrics();

  onMounted(async () => ctrlStore.updateMetrics());

  return {
    generalMetrics,
    updateGenMetrics,
  };
};
