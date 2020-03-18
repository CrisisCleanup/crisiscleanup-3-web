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
import setup from 'cypress-cy-select';
import 'cypress-localstorage-commands';
import 'cypress-wait-until';

// Cy Select
setup();

// Prevent exceptions from failing tests
Cypress.on('uncaught:exception', () => {
  return false;
});

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

// Wait until an element exists and then does not
Cypress.Commands.add('waitTillHidden', selector => {
  cy.get('body')
    .then($body => {
      if ($body.find(selector).length) {
        return selector;
      }
      return false;
    })
    .then(element => {
      if (element) {
        cy.waitUntil(() =>
          cy
            .get(element)
            .parent()
            .should('not.be.visible'),
        );
      }
    });
});

// Wait until finished loader
Cypress.Commands.add('waitLoader', () =>
  cy.waitTillHidden('[data-cy="overlay.loader"]'),
);
