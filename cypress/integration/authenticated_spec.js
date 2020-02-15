/**
 *
 * Tests for Authenticated Layout
 *
 * Cypress
 */

describe('Authenticated Layout', () => {
  beforeEach(() => {
    cy.fixSpec(__filename);
    cy.login();
  });

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
              // eslint-disable-next-line cypress/no-unnecessary-waiting
              cy.wait(1000).then(() => cy.document().toMatchImageSnapshot());
              cy.url().should('match', /dashboard/);
            });
        }),
    );
  });
});
