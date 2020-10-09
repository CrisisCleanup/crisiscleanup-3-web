// @flow

/**
 * Use Event Preview Hook.
 */

import EventComponent, { EventParts } from '@/models/EventComponent';
import _ from 'lodash';
import { ref, computed, reactive } from '@vue/composition-api';
import type { EventPart, EventPartT } from '@/models/EventComponent';

export type EventInputMap = {
  [key: $ElementType<EventPartT, 'name'>]: EventComponent,
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
  const eventKeys = reactive<{ [key: EventPart]: string }>({
    [EventParts.ACTOR.name]: '',
    [EventParts.ACTION.name]: '',
    [EventParts.SUB_ACTION.name]: '',
    [EventParts.RECIPIENT.name]: '',
    [EventParts.PATIENT.name]: '',
  });

  const calcEventPoints = (inputs: EventInputMap) =>
    _.reduce(inputs, (result, value) => result * _.get(value, 'points', 1), 0);

  const updateEventKeys = (inputs: EventInputMap) => {
    const keyInputs = _.omit(inputs, ['user_badge']);
    _.mapValues(keyInputs, (value: string | null, key: string) => {
      eventKeys[key] = _.get(value, 'key', '');
    });
    eventPoints.value = calcEventPoints(inputs);
  };

  const eventKey = computed(() => {
    const mainKeys = _.omit(eventKeys, [EventParts.SUB_ACTION.name]);
    let _baseKey = _.snakeCase(Object.values(mainKeys).join(' '));
    if (!_.isEmpty(eventKeys[EventParts.SUB_ACTION.name])) {
      _baseKey = `${_baseKey}:${eventKeys[EventParts.SUB_ACTION.name]}`;
    }
    return _baseKey;
  });

  return {
    updateEventKeys,
    eventKey,
    eventPoints,
  };
};
