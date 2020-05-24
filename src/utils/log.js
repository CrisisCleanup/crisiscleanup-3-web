import VueLog from '@dreipol/vue-log';
import Vue from 'vue';

export default ({ name, ...params }) => {
  if (!('log' in Vue)) {
    Vue.use(VueLog);
  }
  const opts = {
    name,
    middlewares: [
      (result) => {
        result.unshift(`[${name}] `);
        return result;
      },
    ],
    ...params,
  };

  return Vue.log(opts);
};
