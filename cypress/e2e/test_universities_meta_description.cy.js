describe("Universities SEO metadata", () => {
  it("renders one unique meta description", () => {
    cy.visit(`${Cypress.env("baseUrl")}/solutions/universities`);
    cy.get('head meta[name="description"]')
      .should("have.length", 1)
      .and(
        "have.attr",
        "content",
        "Zedu helps universities, departments and academic teams organize communication, manage courses and engage students with AI-powered tools."
      );
  });
});
