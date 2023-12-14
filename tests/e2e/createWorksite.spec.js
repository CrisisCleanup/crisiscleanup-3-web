import workSiteData from '../fixtures/worksiteCreateData.json';

const TEST_BASE_URL = 'https://app.staging.crisiscleanup.io';
const EMAIL = 'abc@example.com';
const PASSWORD = 'password';

describe('My First Test', () => {
  beforeEach(() => {
    cy.visit(TEST_BASE_URL);
  });

  it('Creates worksite', { retries: 1 }, () => {
    // eslint-disable-next-line cypress/no-assigning-return-values
    const isLoginPage = cy.url().should('include', 'login');
    if (isLoginPage) {
      cy.contains('Login');
      // login
      cy.get('input[placeholder="Email"]').type(EMAIL);
      cy.get('input[placeholder="Password"]').type(PASSWORD);
      cy.get('button[data-cy="loginForm.login"]').click();
    }

    // wait for 3 seconds
    cy.wait(3000);

    // visit phone page
    cy.visit(`${TEST_BASE_URL}/phone`);

    // wait for 5 seconds
    cy.wait(5000);

    // create worksites
    // const d = workSiteData.slice(5);
    const d = [workSiteData[12], workSiteData[13]];
    d.forEach((w) => {
      cy.wait(5000);
      cy.get('.case-form__footer button[data-cy="js-cancel"]').click();
      cy.get('input[data-cy="js-worksite-name"').clear().type(w.residentName);
      cy.get('input[data-cy="js-worksite-phone1"').clear().type(w.phone);
      cy.get('input[data-cy="js-worksite-address"').clear().type(w.address);
      cy.wait(1000);
      // press down arrow key
      cy.get('input[data-cy="js-worksite-address"').type('{downarrow}');
      // press enter key
      cy.get('input[data-cy="js-worksite-address"').type('{enter}');
      cy.wait(3000);
      // press muck out label
      cy.get('.form-tree div').contains('Muck Out').click();
      cy.get('.form-tree div').contains('Tree Work').click();
      cy.wait(1000);
      // press save button
      cy.get('button[data-cy="worksite-formaction-save"').click();
    });
  });
});
