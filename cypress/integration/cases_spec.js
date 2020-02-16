/**
 *
 * Tests for Cases Page
 *
 * Cypress
 */

beforeEach(cy.login);

describe('Cases Page', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false;
    });

    cy.server();
    cy.route({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/worksites?incident=*`,
    }).as('apiIncident');

    cy.visit('/incident/158/cases/new');
    cy.wait('@apiIncident');
    cy.contains('Cases:').should('be.visible');
  });
  it('successfully loads and matches snapshot', () => {
    cy.percySnapshot();
  });
});
