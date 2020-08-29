/**
 * sso.service.js
 * Single Sign On Service
 */

import { IDPApi } from '@/utils/api';
import Logger from '@/utils/log';
import axios from 'axios';
import * as saml from 'samlify';

const Log = Logger({
  name: 'sso.service',
  middlewares: [
    (result) => {
      result.unshift('[SSO] ');
      return result;
    },
  ],
});

// When SAML is revisited, setup the validator
// saml.setSchemaValidator(validator);
saml.setSchemaValidator({
  validate: () => new Promise(),
});

export const SP = (metadata) =>
  saml.ServiceProvider({
    metadata,
    relayState: `https://us-east-1.console.aws.amazon.com/connect/federate/${process.env.VUE_APP_CCP_INSTANCE}?destination=%2Fconnect%2Fccp#/`,
  });

export const fetchMetadata = async () => {
  const content = await axios.get(IDPApi('metadata/'));
  Log.debug('fetched IDP metadata: ', content);
  return content.data;
};

export const IDP = (metadata) =>
  saml.IdentityProvider({
    metadata,
  });

export const authenticate = async (token) => {
  let metadata;
  let awsMeta;
  try {
    metadata = await fetchMetadata();
    awsMeta = await axios.get('/sp/aws-metadata.xml');
  } catch (e) {
    Log.warn('failed to fetch metadata, using local...', e);
    return '';
  }
  awsMeta = awsMeta.data;
  const idp = IDP(metadata);
  const sp = SP(awsMeta);
  const { context } = await sp.createLoginRequest(idp, 'redirect');
  const url = `${context}&jwt=${token}`;
  console.log(url);
  return url;
};
