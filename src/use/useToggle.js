// @flow
/**
 * useToggle Hook
 */

import { ref } from '@vue/composition-api';

export type UseToggleOpts = {
  state?: boolean,
};

/**
 * Use Toggle Hook.
 * @param props - Optionally provide default state.
 * @returns {{toggle: toggle, state: Ref<UnwrapRef<boolean>>}}
 */
export default (props: UseToggleOpts = {}) => {
  const state = ref(props.state !== undefined ? props.state : false);

  const toggle = (value?: boolean) => {
    if (typeof value === 'boolean') {
      state.value = value;
      return;
    }
    state.value = !state.value;
  };
  return {
    state,
    toggle,
  };
};
