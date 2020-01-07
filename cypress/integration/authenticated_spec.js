/**
 *
 * Tests for unauthenticated Login Page
 *
 * TODO: This is NOT the way to do this.
 *       Need test DB first. Just for POC purposes.
 *
 * Cypress
 */

describe('The Dashboard', () => {
  it('should login', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('junk@aarontitus.net');
    cy.get('input[type="password"]').type('12345678');
    cy.get('button').click();
    cy.get('div.layout').then(() => {
      cy.document().toMatchImageSnapshot();
    });
  });
});
