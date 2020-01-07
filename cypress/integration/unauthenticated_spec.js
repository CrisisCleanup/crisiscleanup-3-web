/**
 *
 * Tests for unauthenticated Login Page
 *
 * Cypress
 */

describe('The Login Page', () => {
  it('successfully loads', () => {
    cy.visit('/');
  });

  it('successfully redirects', () => {
    cy.visit('/');
    cy.url().should('match', /login/);
    cy.contains('Sign in to your account');
  });

  it('should match image snapshot', () => {
    cy.visit('/login').then(() => cy.get('div.login').toMatchImageSnapshot());
  });

  it('should login', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('junk@aarontitus.net');
    cy.get('input[type="password"]').type('12345678');
    cy.get('button').click();
    cy.url().should('match', /login/);
  });
});
