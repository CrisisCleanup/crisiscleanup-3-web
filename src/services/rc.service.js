import Logger from '@/utils/log';
// import { SDK } from '@ringcentral/sdk';
// const { SDK } = require('@ringcentral/sdk');
import SDK from '@ringcentral/sdk';

const Log = Logger({
  name: 'rc.service',
  middlewares: [
    (result) => {
      result.unshift('[rc] ');
      return result;
    },
  ],
});

const RCConfig = {
  server: SDK.server.sandbox,
  clientId: process.env.VUE_APP_RC_CLIENT_ID,
  clientSecret: process.env.VUE_APP_RC_CLIENT_SECRET,
  // redirectUri:
};

export const initRingCentral = () => {
  Log.debug('initializing Ring Central...');
  const rcsdk = new SDK(RCConfig);
  return rcsdk;
};

export const authenticate = async (client) => {
  try {
    const loginUrl = client.loginUrl();
    const loginOpts = await client.loginWindow({ url: loginUrl });
    Log.debug('success! got login options: ', loginOpts);
    return client.login(loginOpts);
  } catch (e) {
    Log.error('failed to authenticate!', e);
    return false;
  }
};
