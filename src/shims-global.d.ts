import Vue from 'vue';
import VueLog from '@dreipol/vue-log';
import moment from 'moment';
import { Toasted } from 'vue-toasted';
import { AxiosStatic } from 'axios';
import Router from '@/router';
import { AclHelper } from 'vue-browser-acl/types';
import PhoneService from '@/services/phone.service';

declare global {
  interface CustomVue extends Vue {
    $log: VueLog;
    $can: AclHelper;
    $phoneService: PhoneService;
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
