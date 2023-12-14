/**
 * Wrap/Unwrap Vue Composition Api Ref Helpers
 */

import { unref, isRef, ref } from 'vue';
import type { MaybeRef } from '@vueuse/core';

export const wrap = <T>(value: MaybeRef<T>) =>
  isRef(value) ? value : ref(value);
export const unwrap = <T>(value: MaybeRef<T>) =>
  isRef(value) ? unref(value) : value;
