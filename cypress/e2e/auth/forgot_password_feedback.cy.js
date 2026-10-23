Cypress.on("uncaught:exception", () => false);

describe("forgot password request feedback", () => {
  it("shows the same neutral confirmation for success and unknown email", () => {
    cy.intercept("POST", "**/auth/password-reset", (request) => {
      request.reply({
        statusCode: request.body.email === "unknown@example.com" ? 404 : 200,
        body: { message: "Password reset response" },
      });
    }).as("requestReset");

    cy.visit("/auth/forgot-password");
    cy.get('input[type="email"]').type("unknown@example.com");
    cy.get("button").contains("Submit").click();
    cy.wait("@requestReset");

    cy.contains(
      "If an account exists for that email address, we will send instructions to reset your password."
    ).should("be.visible");
    cy.get('[role="status"]').should("be.visible");
    cy.contains("Password reset response").should("not.exist");

    cy.get("button").contains("Enter verification code").click();
    cy.url().should(
      "include",
      "/auth/reset-password?email=unknown%40example.com"
    );

    cy.visit("/auth/forgot-password");
    cy.get('input[type="email"]').type("member@example.com");
    cy.get("button").contains("Submit").click();
    cy.wait("@requestReset");

    cy.contains(
      "If an account exists for that email address, we will send instructions to reset your password."
    ).should("be.visible");
  });

  it("shows a generic error for unexpected server failures", () => {
    cy.intercept("POST", "**/auth/password-reset", {
      statusCode: 500,
      body: { message: "internal server details" },
    }).as("requestReset");

    cy.visit("/auth/forgot-password");
    cy.get('input[type="email"]').type("member@example.com");
    cy.get("button").contains("Submit").click();
    cy.wait("@requestReset");

    cy.contains("We couldn't process your request. Please try again.").should(
      "be.visible"
    );
    cy.contains("internal server details").should("not.exist");
  });
});
