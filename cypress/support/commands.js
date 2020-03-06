// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import '@percy/cypress';
import 'cypress-localstorage-commands';
import 'cypress-wait-until';

// Login Helper
Cypress.Commands.add(
  'login',
  (
    { email, password } = {
      email: Cypress.env('WEB_USER'),
      password: Cypress.env('WEB_PASS'),
    },
  ) => {
    cy.request('POST', `${Cypress.env('API_URL')}/api-token-auth`, {
      email,
      password,
    })
      .its('body')
      .then(res => cy.setLocalStorage('user', JSON.stringify(res)));
  },
);
