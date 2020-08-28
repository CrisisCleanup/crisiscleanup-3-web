// @flow
/**
 * Wrap/Unwrap Vue Composition Api Ref Helpers
 */

import { unref, isRef, ref, Ref } from '@vue/composition-api';

export const wrap = <T>(value: T): Ref<T> =>
  isRef(value) ? value : ref(value);
export const unwrap = <T>(value: T): T => (isRef(value) ? unref(value) : value);
