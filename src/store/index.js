import VueLog from '@dreipol/vue-log';
import VuexORM from '@vuex-orm/core';
import VuexORMAxios from '@vuex-orm/plugin-axios';
import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import database from './database';
import auth from './modules/auth';
import phone_legacy from './modules/phone_legacy';
import enums from './modules/enums';
import incident from './modules/incident';
import loading from './modules/loading';
import locale from './modules/locale';
import phone from './modules/phone';
import rc from './modules/rc';
import socket from './modules/socket';
import ui from './modules/ui';
import ConnectStores from './modules/phone/index';

VuexORM.use(VuexORMAxios, {
  axios,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  baseURL: `${process.env.VUE_APP_API_BASE_URL}`,
});

Vue.use(Vuex);
Vue.use(VueLog);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    incident,
    loading,
    locale,
    phone,
    enums,
    rc,
    socket,
    phone_legacy,
    ui,
    'phone/streams': ConnectStores.StreamsStore,
  },
  plugins: [VuexORM.install(database)],
  strict: debug,
});
