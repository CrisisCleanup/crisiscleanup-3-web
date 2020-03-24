/**
 * sso.service.js
 * Single Sign On Service
 */

import AWSSPMetadata from '@/assets/saml/aws-metadata.xml';
import { AuthService } from '@/services/auth.service';
import { IDPApi } from '@/utils/api';
import * as validator from '@authenio/samlify-xsd-schema-validator';
import VueLog from '@dreipol/vue-log';
import AWS from 'aws-sdk';
import axios from 'axios';
import * as saml from 'samlify';
import Vue from 'vue';
import SPMetadata from '../../public/sp/metadata.xml';

Vue.use(VueLog, {
  name: 'sso.service',
  middlewares: [
    result => {
      result.unshift('[SSO] ');
      return result;
    },
  ],
});
const Log = Vue.log();

saml.setSchemaValidator(validator);

export const SP = saml.ServiceProvider({
  metadata: SPMetadata,
  entityId: `${process.env.VUE_APP_BASE_URL}/sp/metadata.xml`,
  assertionConsumerService: [
    {
      Binding: saml.Constants.BindingNamespace.Post,
      Location: `${process.env.VUE_APP_BASE_URL}/sp/acs`,
    },
  ],
});

export const AWS_SP = saml.ServiceProvider({
  metadata: AWSSPMetadata,
});

export const fetchMetadata = async () => {
  const content = await axios.get(IDPApi('metadata/'));
  Log.debug('fetched IDP metadata: ', content);
  return content.data;
};

export const IDP = metadata =>
  saml.IdentityProvider({
    metadata,
  });

export const consume = async SAMLResponse => {
  const sts = new AWS.STS();
  const awsCreds = await sts
    .assumeRoleWithSAML({
      PrincipalArn: process.env.VUE_APP_CCP_PRINCIPAL,
      RoleArn: process.env.VUE_APP_CCP_ROLE,
      SAMLAssertion: SAMLResponse,
    })
    .promise();
  Log.debug(awsCreds);

  const connect = new AWS.Connect({
    accessKeyId: awsCreds.Credentials.AccessKeyId,
    secretAccessKey: awsCreds.Credentials.SecretAccessKey,
    sessionToken: awsCreds.Credentials.SessionToken,
    region: 'us-east-1',
  });
  const tokenCreds = await connect
    .getFederationToken({
      InstanceId: process.env.VUE_APP_CCP_INSTANCE,
    })
    .promise();
  axios.defaults.headers.common['X-Amz-Security-Token'] =
    awsCreds.Credentials.SessionToken;
  return tokenCreds.Credentials;
};

export const retrieveCredentials = () => {
  const creds = localStorage.getItem('ccu-lily-auth');
  if (creds) {
    return JSON.parse(creds);
  }
  return null;
};

export const authenticate = async () => {
  const cached = retrieveCredentials();
  if (cached) {
    return cached;
  }
  const metadata = await fetchMetadata();
  const idp = IDP(metadata);
  const { context } = await SP.createLoginRequest(idp, 'redirect');
  Log.debug(context);
  const resp = await axios({
    method: 'get',
    url: context,
    withCredentials: true,
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${AuthService.getToken()}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  const el = document.createElement('html');
  el.innerHTML = resp.data;
  const SAMLResponse = el.querySelector('input[name="SAMLResponse"]').value;
  const tokenCreds = await consume(SAMLResponse);
  Log.debug('Recv Token Creds', tokenCreds);
  localStorage.setItem(
    'ccu-lily-auth',
    JSON.stringify({
      AccessToken: tokenCreds.AccessToken,
      AccessTokenExpiration: tokenCreds.AccessTokenExpiration.toGMTString(),
      RefreshToken: tokenCreds.RefreshToken,
      RefreshTokenExpiration: tokenCreds.RefreshTokenExpiration.toGMTString(),
    }),
  );
  return tokenCreds;
};
