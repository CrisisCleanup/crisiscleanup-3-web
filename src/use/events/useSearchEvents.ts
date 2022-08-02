/**
 * Use Search Events Hook
 */

import { ref, watch } from 'vue';
import _ from 'lodash';
import useSearch from '@/use/useSearch';
import Event from '@/models/Event';

/**
 * Hook for searching Event items.
 * @param context - component context.
 * @returns {{loading: Ref<UnwrapRef<boolean>>, items: Ref<UnwrapRef<Event[]>>, makeQuery: *}}
 */
export default ({ context }: { context: any }) => {
  const items = ref<Event[]>([]);
  const { loading, results, makeQuery } = useSearch({
    context,
    resolveSearch: async (key) => Event.search(key, 5),
  });

  watch(
    () => results.value,
    async () => {
      loading.value = true;
      items.value = [];
      _.mapValues(results.value, async ({ id }: any) => {
        const event = await Event.fetchOrFindId(id);
        items.value.push(event as Event);
      });
      context.emit('update:event-items', items.value);
      loading.value = false;
    },
  );
  return {
    loading,
    items,
    makeQuery,
  };
};
