import VueLog from '@dreipol/vue-log';
import Vue from 'vue';

export default (params) => {
  if (!('log' in Vue)) {
    Vue.use(VueLog);
  }
  return Vue.log(params);
};
