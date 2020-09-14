// @flow
/**
 * Use Phone Metrics Hook
 */

import { computed, ref } from '@vue/composition-api';
import ControllerStore from '@/store/modules/phone/controller';
import { getModule } from 'vuex-module-decorators';
import { useStore } from '@u3u/vue-hooks';
import Language from '@/models/Language';
import _ from 'lodash';

export default () => {
  const store = useStore();
  const ctrlStore = getModule(ControllerStore, store.value);
  const _locales = ref();
  const _metrics = ref();
  const loading = ref(true);

  const generalMetrics = computed(() => (_metrics.value ? _metrics.value : []));

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
    loading,
  };
};
