/**
 *
 * Tests for Cases Page
 *
 * Cypress
 */

describe('Cases Page', () => {
  beforeEach(cy.login);
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
  beforeEach(() => {
    cy.get('.ccu-icon[title="Table View"]').as('TableView');
  });
  it('successfully loads and matches snapshot', () => {
    cy.percySnapshot('cases - map view');
    cy.get('@TableView').click();
    cy.get('.table-operations').should('be.visible');
    // context btn action should only be available on table view
    cy.get('svg[data-icon="ellipsis-h"]').should('be.visible');
    cy.percySnapshot('cases - table view');
  });
});
