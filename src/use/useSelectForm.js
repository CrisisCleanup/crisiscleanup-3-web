// @flow
/**
 *  Use Select Form for Model.
 */

import { ref, watchEffect, computed, reactive } from '@vue/composition-api';
import _ from 'lodash';
import CCUModel from '@/models/model';

export type SelectFormProps<T> = {|
  context: any,
  multi?: boolean,
  model: T,
  resolveFetch?: [Function, $Rest<SelectFormProps<T>, mixed>],
  resolveFromId?: Function,
  translate?: boolean,
  sortKey?: string,
|};

/**
 * Use Select Form Hook
 * Hook for using a select form to select an item
 * from a vuex-orm model.
 * @param context - event context.
 * @param multi - allow multi select.
 * @param model - Vuex-ORM model.
 * @param resolveFetch - Custom fetch method.
 * @param resolveFromId - Custom resolve method.
 * @param translate - Auto-translate results.
 * @param sortKey - Key to sort by.
 * @returns {{onSelected: onSelected, items: T[] extends Ref ? T[] : Ref<UnwrapRef<T[]>>, value: *, selected: T[] extends Ref ? T[] : Ref<UnwrapRef<T[]>>}}
 */
export default <T: typeof CCUModel>({
  context,
  multi,
  model,
  resolveFetch,
  resolveFromId,
  translate,
  sortKey,
}: SelectFormProps<T> = {}) => {
  const items = ref<T[]>([]);
  const selected = ref<T[]>([]);
  const _value = ref(null);

  let resolveFunc = _.get(model, 'fetchAll', () =>
    context.root.$log.error(
      `does not have a property named 'fetchAll!' You must provide 'resolveFetch'.`,
    ),
  );
  let resolveArgs = [];
  if (resolveFetch) {
    [resolveFunc, ...resolveArgs] = resolveFetch;
  }

  const debouncedFetch = _.throttle(_.bind(resolveFunc, model), 500, {
    leading: true,
  });

  watchEffect(async () => {
    let results = await debouncedFetch(...resolveArgs);
    if (translate) {
      results = results.map((r) => reactive(r.withTrans<T>()));
    }
    if (sortKey) {
      results = _.sortBy(results, sortKey);
    }
    items.value = results;
  });

  const onSelected = async (itemId: number | number[] | null) => {
    if (itemId === null) {
      selected.value = [];
      _value.value = null;
      return;
    }
    if (Array.isArray(itemId)) {
      itemId.map(onSelected);
      return;
    }
    if (itemId === -1) {
      selected.value.push(itemId);
      _value.value = multi ? selected.value : _.last(selected.value);
      context.root.$log.debug('selected: ', itemId);
      return;
    }
    const _resolveFromId = resolveFromId || model.fetchOrFindId;
    const item = await _.bind(_resolveFromId, model)(itemId);
    selected.value.push(translate ? item.withTrans() : item);
    _value.value = multi ? selected.value : _.last(selected.value);
    context.root.$log.debug('selected: ', item);
  };

  const value = computed(() => _value.value);

  return {
    items,
    selected,
    onSelected,
    value,
  };
};
