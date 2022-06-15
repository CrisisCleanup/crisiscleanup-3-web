import Vue from 'vue';
import VueLog from '@dreipol/vue-log';
import moment from 'moment';
import { Toasted } from 'vue-toasted';
import { AxiosStatic } from 'axios';
import { ComponentInstance } from '@vue/composition-api';
import Router from '@/router';

declare global {
  interface CustomVue extends Vue {
    $log: VueLog;
    $router: Router;
    $moment: moment;
    $toasted: Toasted;
    $http: AxiosStatic;
    $t: (key: string, data?: Record<string, any>) => string;
  }

  interface Window {
    vue: CustomVue;
    ResizeObserver: any;
  }
}
