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

// Login Helper
Cypress.Commands.add(
  'login',
  (
    { email, password, win } = {
      email: Cypress.env('WEB_USER'),
      password: Cypress.env('WEB_PASS'),
      win: window,
    },
  ) => {
    cy.request('POST', `${Cypress.env('API_URL')}/api-token-auth`, {
      email,
      password,
    })
      .its('body')
      .then(res => {
        win.localStorage.setItem('user', JSON.stringify(res));
      });
  },
);
