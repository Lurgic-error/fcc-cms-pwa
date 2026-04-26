function assertNoHorizontalOverflow(selector) {
  cy.get(selector).then(($element) => {
    const { clientWidth, scrollWidth } = $element[0]
    expect(scrollWidth, `${selector} should not overflow horizontally`).to.be.at.most(
      clientWidth + 1,
    )
  })
}

function assertAuthControlHeights() {
  cy.get('form.auth-form .base-input__control .el-input__wrapper')
    .first()
    .then(($input) => {
      const inputHeight = Math.round($input[0].getBoundingClientRect().height)

      cy.get('form.auth-form .base-button').each(($button) => {
        const buttonHeight = Math.round($button[0].getBoundingClientRect().height)
        expect(
          Math.abs(buttonHeight - inputHeight),
          'auth buttons and inputs should share the same height',
        ).to.be.at.most(1)
      })
    })
}

function auditAuthPage(pathname, _screenshotKey) {
  cy.viewport(390, 844)
  cy.visit(pathname)
  cy.get('form.auth-form').should('be.visible')
  assertNoHorizontalOverflow('.auth-main')
  assertAuthControlHeights()

  cy.viewport(1440, 960)
  cy.visit(pathname)
  cy.get('form.auth-form').should('be.visible')
  assertNoHorizontalOverflow('.auth-main')
  assertAuthControlHeights()
}

describe('Auth controls audit', () => {
  it('keeps the login form controls aligned', () => {
    auditAuthPage('/auth/login?redirect=/dashboard', 'visual-auth-login-controls')
  })

  it('keeps the forgot password form controls aligned', () => {
    auditAuthPage('/auth/forgot-password', 'visual-auth-forgot-controls')
  })

  it('keeps the reset password form controls aligned', () => {
    auditAuthPage('/auth/reset-password?email=test@fcc.go.tz', 'visual-auth-reset-controls')
  })
})
