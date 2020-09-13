// @flow
/**
 * Use Phone Metrics Hook
 */

import { computed, ref } from '@vue/composition-api';
import ControllerStore from '@/store/modules/phone/controller';
import { getModule } from 'vuex-module-decorators';
import { useStore } from '@u3u/vue-hooks';
import type { PhoneMetric } from '@/store/modules/phone/types';
import { wrap } from '@/utils/wrap';
import Language from '@/models/Language';
import _ from 'lodash';

export type UsePhoneMetricsProps = {|
  metrics: PhoneMetric[],
  category: string,
|};

export default ({ metrics, category }: UsePhoneMetricsProps) => {
  const _category = wrap(category);
  const store = useStore();
  const ctrlStore = getModule(ControllerStore, store.value);
  const _locales = ref();

  const generalMetrics = computed(() =>
    ctrlStore.getGeneralMetrics(metrics, _category.value),
  );
  const updateGenMetrics = async () => {
    await ctrlStore.updateMetrics();
    const subtags = _.keys(_.omit(ctrlStore.metrics, ['all']));
    _locales.value = await Language.fetchBySubtags(subtags);
  };

  const locales = computed(() => (_locales.value ? _locales.value : []));

  return {
    generalMetrics,
    updateGenMetrics,
    locales,
  };
};
