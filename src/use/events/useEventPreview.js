// @flow

/**
 * Use Event Preview Hook.
 */

import EventComponent from '@/models/EventComponent';
import _ from 'lodash';
import { ref, computed, reactive } from '@vue/composition-api';
import type { EventComponentTypeT } from '@/models/EventComponent';

export type EventInputMap = {
  [key: EventComponentTypeT]: EventComponent,
};

export type EventPreviewProps = {|
  context: any,
|};

/**
 * Use Event Preview Hook
 * Hook for processing event component inputs
 * and generating preview data.
 * @returns {{updateEventKeys: updateEventKeys, eventPoints: Ref<UnwrapRef<number>>, eventKey: ComputedRef<string>}}
 */
export default () => {
  const eventPoints = ref(0);
  const eventKeys = reactive<{ [key: string]: string }>({
    actor: '',
    action: '',
    subaction: '',
    recipient: '',
    patient: '',
  });

  const calcEventPoints = (inputs: EventInputMap) =>
    _.reduce(inputs, (result, value) => result + _.get(value, 'points', 0), 0);

  const updateEventKeys = (inputs: EventInputMap) => {
    const keyInputs = _.omit(inputs, ['user_badge']);
    _.mapValues(keyInputs, (value: string | null, key: string) => {
      eventKeys[key] = _.get(value, 'key', '');
    });
    eventPoints.value = calcEventPoints(inputs);
  };

  const eventKey = computed(() => {
    const mainKeys = _.omit(eventKeys, ['subaction']);
    let _baseKey = _.snakeCase(Object.values(mainKeys).join(' '));
    if (!_.isEmpty(eventKeys.subaction)) {
      _baseKey = `${_baseKey}:${eventKeys.subaction}`;
    }
    return _baseKey;
  });

  return {
    updateEventKeys,
    eventKey,
    eventPoints,
  };
};
