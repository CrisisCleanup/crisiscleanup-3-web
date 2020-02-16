/**
 *
 * Tests for Authenticated Layout
 *
 * Cypress
 */

beforeEach(cy.login);

describe('Authenticated Layout', () => {
  it('successfully loads and matches snapshot', () => {
    cy.visit('/').then(() =>
      cy
        .contains('MY CASES')
        .should('be.visible')
        .then(() => {
          cy.contains('Loading')
            .should('not.be.visible')
            .then(() => {
              cy.percySnapshot('dashboard');
              cy.url().should('match', /dashboard/);
            });
        }),
    );
  });
});
