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
});
