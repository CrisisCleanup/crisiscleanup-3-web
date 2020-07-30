/* eslint-disable global-require */

const percyHealthCheck = require('@percy/cypress/task');
const preprocessor = require('cypress-vue-unit-test/dist/plugins/webpack');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  preprocessor(on, config);
  require('cypress-plugin-retries/lib/plugin')(on);
  on('task', percyHealthCheck);
  return config;
};
