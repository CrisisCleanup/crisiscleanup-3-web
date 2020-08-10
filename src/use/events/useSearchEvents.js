// @flow

/**
 * Use Search Events Hook
 */

import useSearch from '@/use/useSearch';
import Event from '@/models/Event';
import type { EventSearchResult } from '@/models/Event';
import { ref, watch } from '@vue/composition-api';
import _ from 'lodash';

export default ({ context }) => {
  const items = ref<Event[]>([]);
  const { loading, results, makeQuery } = useSearch<EventSearchResult>({
    context,
    resolveSearch: async (key) => Event.search(key, 5),
  });

  watch(
    () => results.value,
    async () => {
      loading.value = true;
      items.value = [];
      await _.mapValues(results.value, async ({ id }) => {
        const event = await Event.fetchOrFindId(id);
        items.value.push(event);
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
