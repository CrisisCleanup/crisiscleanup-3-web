import Vue from 'vue';
import type { ILogger } from 'js-logger';
import moment from 'moment';
import { Toasted } from 'vue-toasted';
import { AxiosStatic } from 'axios';
// import { AclHelper } from 'vue-browser-acl/types';
import Router from '@/router';
import PhoneService from '@/services/phone.service';

declare global {
  interface CustomVue extends Vue {
    $log: ILogger;
    $can: any;
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
