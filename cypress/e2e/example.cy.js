// https://on.cypress.io/api

describe('CMS PWA smoke', () => {
  it('loads the app root', () => {
    cy.visit('/')
    cy.get('#app').should('exist')
    cy.get('body').should('not.be.empty')
  })
})
