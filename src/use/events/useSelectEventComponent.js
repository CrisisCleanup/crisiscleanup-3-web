// @flow
/**
 *  Use Select Event Component Hook.
 */

import EventComponent from '@/models/EventComponent';
import type { EventComponentTypeT } from '@/models/EventComponent';
import { ref, watchEffect, computed } from '@vue/composition-api';
import _ from 'lodash';

export type SelectEventComponentProps = {|
  context: any,
  type: EventComponentTypeT,
  multi?: boolean,
|};

export default ({ context, type, multi }: SelectEventComponentProps = {}) => {
  const items = ref<EventComponent[]>([]);
  const selected = ref<EventComponent[]>([]);

  watchEffect(async () => {
    items.value = await EventComponent.fetchAllByType(type);
  });

  const onSelected = async (itemId: number) => {
    if (!itemId) return;
    const item = await EventComponent.fetchOrFindId(itemId);
    context.root.$log.debug('selected: ', item);
    selected.value.push(item);
  };

  const value = computed(() => {
    if (multi) {
      return selected.value;
    }
    return _.head(selected.value) || null;
  });

  return {
    items,
    selected,
    onSelected,
    value,
  };
};
