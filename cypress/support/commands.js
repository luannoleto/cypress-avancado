import 'cypress-localstorage-commands'

Cypress.Commands.add('verificarElementoLoadingExibido', () => {
  cy.contains('Loading ...').should('be.visible')
  cy.contains('Loading ...').should('not.exist')
})
