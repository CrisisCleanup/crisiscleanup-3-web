// @flow
/**
 * Decorators for Vuex-ORM Models.
 */

import _ from 'lodash';
import mixin from '@/utils/mixin';

export const Localized = mixin({
  /**
   * Returns event object with pre-translated values.
   * @returns {T}
   */
  withTrans<T>(): T {
    return _.transform(
      this,
      (result, value, key: string) => {
        result[key] = value;
        if (key.includes('_t')) {
          // set key AND key_t set to localized value for flexibility
          result[_.trimEnd(key, '_t')] = window.vue.$t(value);
          result[key] = window.vue.$t(value);
        }
      },
      {},
    );
  },
});
