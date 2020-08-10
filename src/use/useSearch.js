// @flow
/**
 * Search Hook
 */

import _ from 'lodash';
import { ref, watch } from '@vue/composition-api';

export type useSearchProps = {|
  context: any,
  resolveSearch: Function,
  debounceInterval?: number,
|};

export default <T>({
  context,
  resolveSearch,
  debounceInterval,
}: useSearchProps = {}) => {
  const results = ref<T[]>([]);
  const loading = ref<boolean>(false);

  watch(
    () => loading.value,
    () => context.emit('update:loading', loading.value),
  );

  const _makeQuery = async (key: string) => {
    loading.value = true;
    results.value = await resolveSearch(key);
    loading.value = false;
    return results;
  };

  const makeQuery = _.debounce(_makeQuery, debounceInterval || 400);

  return {
    loading,
    results,
    makeQuery,
  };
};
