import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import incident from './modules/incident'
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import database from './database'
import {TokenService} from "@/services/storage.service";
import axios from 'axios'

VuexORM.use(VuexORMAxios, {
    axios,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TokenService.getToken()}`
    },
    baseURL: 'http://api.staging.crisiscleanup.io',
})

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        auth,
        incident,
    },
    plugins: [VuexORM.install(database)],
    strict: debug
})