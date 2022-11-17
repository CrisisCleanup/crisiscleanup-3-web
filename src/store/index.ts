import { createStore } from 'vuex'
import auth from './modules/auth';
import VuexORM from '@vuex-orm/core';
import database from "./database";

// import events from './modules/events';
// import phone_legacy from './modules/phone_legacy';
// import enums from './modules/enums';
// import incident from './modules/incident';
// import loading from './modules/loading';
// import locale from './modules/locale';
// import rc from './modules/rc';
// import socket from './modules/socket';
// import ui from './modules/ui';
// import map from './modules/map';

const debug = process.env.NODE_ENV !== 'production';

export const store = createStore({
    modules: {
        auth,
        // events,
        // incident,
        // loading,
        // locale,
        // enums,
        // rc,
        // socket,
        // phone_legacy,
        // map,
        // ui,
    },
    plugins: [VuexORM.install(database)],
    strict: debug,

})
