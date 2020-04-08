/**
 *
 * Tests for Cases Page
 *
 * Cypress
 */

describe('Cases Page', () => {
  beforeEach(cy.login);
  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/worksites?incident=*`,
    }).as('apiIncident');
    cy.route({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/worksites/*`,
    }).as('getWorksite');
    cy.route({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/worksites?id__in=*`,
    }).as('printWorksite');
  });
  beforeEach(() => {
    cy.visit('/incident/158/cases/new');
    cy.get('cy|cases.tableButton').as('TableView');
    cy.get('div[data-cy="worksiteview"]').as('WorksiteView');
    cy.get('div[data-cy="worksiteview_actions"]').as('WorksiteView_Actions');
  });
  it('successfully loads and matches snapshot', () => {
    cy.waitLoader();
    cy.percySnapshot('cases - map view');
    cy.get('@TableView').click();
    cy.get('.table-operations').should('be.visible');
    // context btn action should only be available on table view
    cy.get('svg[data-icon="ellipsis-h"]').should('be.visible');
    cy.percySnapshot('cases - table view');
  });

  it('performs worksite actions', () => {
    cy.visit('/incident/158/cases/141324');
    cy.wrap('@WorksiteView_Actions')
      .get('cy|cases.icons.download')
      .parent()
      .click();
    cy.wait('@getWorksite');
    // printing functionality
    cy.wrap('@WorksiteView_Actions')
      .get('cy|cases.icons.print')
      .parent()
      .click();
    cy.wait('@printWorksite');
  });

  it('performs worksite batch actions', () => {
    cy.visit('/incident/158/cases/141324');
    // batch actions
    cy.get('@TableView')
      .click()
      .then(() => {
        // Select Items
        cy.get('.table')
          .find('[data-cy="tableview_actionSelect"]')
          .first()
          .find('input')
          .check({ force: true });
        cy.get('button[data-cy="worksiteview_actionContext"]').click();
        cy.get('button[data-cy="worksiteview_actionBatchDownload"]').as(
          'BatchDownloadBtn',
        );
        cy.get('button[data-cy="worksiteview_actionBatchPrint"]').as(
          'BatchPrintBtn',
        );
        // Batch Download
        cy.get('@BatchDownloadBtn').should('be.visible').click();
        cy.wait('@getWorksite');
        cy.get('@BatchPrintBtn').should('be.visible').click();
        cy.wait('@printWorksite');
      });
  });
});
