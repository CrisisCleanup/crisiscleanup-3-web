/**
 *
 * Tests for Authenticated Layout
 *
 * Cypress
 */

describe('Authenticated Layout', () => {
  beforeEach(() => cy.login());

  it('successfully loads', () => {
    cy.visit('/');
  });

  it('should match image snapshot', () => {
    cy.visit('/').then(() =>
      cy
        .contains('MY CASES')
        .should('be.visible')
        .then(() => {
          cy.contains('Loading')
            .should('not.be.visible')
            .then(() => {
              cy.get('div#app').toMatchImageSnapshot();
              cy.url().should('match', /dashboard/);
            });
        }),
    );
  });
});
