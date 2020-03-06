/**
 *
 * Tests for Organization Page
 *
 * Cypress
 */

describe('My Organization', () => {
  beforeEach(cy.login);

  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/users?organization=*`,
    }).as('ApiUserOrg');

    cy.visit('/organization');
    cy.get('[data-cy="myorg-dashboard"]').as('OrgDashboard');
    cy.get('[data-cy="myorg-nav-users"]').as('OrgNavUsers');
    cy.waitUntil(() => cy.get('@OrgDashboard').should('be.visible'));
  });

  it('Loads and matches snapshots', () => {
    cy.url().should('match', /organization/);
    cy.percySnapshot('My Organization');
  });

  it('Fetches Organization users', () => {
    cy.get('@OrgNavUsers').click();
    cy.waitUntil(() => cy.url().should('match', /users/));
    cy.wait('@ApiUserOrg');
    cy.percySnapshot('My Organization - Users');
  });
});
