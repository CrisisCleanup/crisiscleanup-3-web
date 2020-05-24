/**
 * UI Store Actions.
 *
 */
import Logger from '@/utils/log';
import * as types from './types';

const Log = Logger({
  name: 'ui.store',
  middlewares: [
    (result) => {
      result.unshift('[ui.store] ');
      return result;
    },
  ],
});


export default {};
