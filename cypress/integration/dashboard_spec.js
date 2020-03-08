/**
 *
 * Tests for Dashboard Page
 *
 * Cypress
 */

describe('Dashboard', () => {
  beforeEach(cy.login);

  beforeEach(() => {
    cy.visit('');
    cy.waitLoader();
    cy.get('cy|navigation.dashboard').as('NavDashboard');
    cy.get('cy|navigation.cases').as('NavCases');
    cy.get('cy|navigation.my_organization').as('NavMyOrg');
  });

  it('Loads and matches snapshots', () => {
    cy.url().should('include', '/incident/158/dashboard');
    cy.get('@NavDashboard').should('have.class', 'router-link-active');
    cy.percySnapshot('Dashboard');
  });

  it('Navigates to the correct routes', () => {
    cy.get('@NavDashboard').click();
    cy.url().should('include', '/incident/158/dashboard');
    cy.get('@NavCases').click();
    cy.url().should('include', '/incident/158/cases/new');
    cy.get('@NavMyOrg').click();
    cy.url().should('include', '/organization/invitations');
  });
});
