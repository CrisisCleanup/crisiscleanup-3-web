/**
 * Search Hook
 */
import _ from 'lodash';
import { ref, watch } from 'vue';
interface useSearchProps {
  context: any;
  resolveSearch: (...args: Array<any>) => any;
  debounceInterval?: number;
}

const useSearch = ({
  context,
  resolveSearch,
  debounceInterval,
}: useSearchProps) => {
  const results = ref<[]>([]);
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

export default useSearch;
