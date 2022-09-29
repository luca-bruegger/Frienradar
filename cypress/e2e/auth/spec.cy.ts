describe('Auth spec', () => {
  it('redirects unauthenticated user to login', () => {
    cy.visit('/tabs/radar');

    expect(cy.url()).to.eq('http://localhost:8100/login');
  });
});
