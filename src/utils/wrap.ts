/**
 * Wrap/Unwrap Vue Composition Api Ref Helpers
 */

import { unref, isRef, ref, Ref } from 'vue';

export const wrap = (value): Ref => (isRef(value) ? value : ref(value));
export const unwrap = (value) => (isRef(value) ? unref(value) : value);
