/**
 *
 * Tests for unauthenticated Login Page
 *
 * Cypress
 */

describe('unAuthenticated Layout', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('cy|loginForm.email').as('LoginEmail');
    cy.get('cy|loginForm.password').as('LoginPassword');
    cy.get('cy|loginForm.login').as('LoginBtn');
  });

  it('successfully redirects', () => {
    cy.visit('/');
    cy.url().should('match', /login/);
  });

  it('should match image snapshot', () => {
    cy.visit('/login');
    cy.waitUntil(() => cy.get('@LoginEmail').should('be.visible'));
    cy.percySnapshot('login page');
  });

  it('should authenticate and redirect', () => {
    cy.visit('/').then(() => {
      cy.get('@LoginEmail').type(Cypress.env('WEB_USER'));
      cy.get('@LoginPassword').type(Cypress.env('WEB_PASS'));
      cy.get('@LoginBtn').click();
      cy.url().should('match', /dashboard/);
      // ensure user session gets stored in local storage
      cy.contains('Dashboard')
        .should('be.visible')
        .then(() => {
          const userItem = window.localStorage.getItem('user');
          expect(userItem).to.be.a('string');
          const user = JSON.parse(userItem);
          expect(user).to.be.an('object');
          expect(user).to.have.keys([
            'access_token',
            'user_claims',
            'organizations',
          ]);
          expect(user.access_token).to.be.a('string');
        });
      // logout
      cy.get('cy|auth.userprofile').click();
      cy.get('cy|auth.userprofile.logout').as('UserProfile.Logout');
      cy.get('@UserProfile.Logout').should('be.visible');
    });
  });

  it('should not have access to protected resource', () => {
    cy.request({
      url: `${Cypress.env('API_URL')}/organizations/12`,
      failOnStatusCode: false,
    })
      .its('status')
      .should('equal', 401);
  });

  it('should not allow a bad login', () => {
    cy.url().should('match', /login/);
    cy.get('@LoginEmail').type('user');
    cy.get('@LoginPassword').type('pass{enter}');
    cy.get('@LoginBtn').click();
    // should have toast error and remain on login page
    cy.url().should('match', /login/);
  });

  it('should redirect to case post-auth', () => {
    // @see - CrisisCleanup/crisiscleanup-3-web#64
    cy.visit('/incident/158/cases/142359').then(() => {
      cy.location().should(loc => {
        expect(loc.search).to.eq('?from=%2Fincident%2F158%2Fcases%2F142359');
      });
    });
  });
});
