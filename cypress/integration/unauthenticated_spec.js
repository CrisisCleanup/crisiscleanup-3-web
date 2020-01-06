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
  });

  it('should match image snapshot', () => {
    cy.visit('/login').then(() => cy.get('div.login').toMatchImageSnapshot());
  });
});
