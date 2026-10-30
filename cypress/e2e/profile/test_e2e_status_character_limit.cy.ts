/// <reference types="cypress" />

const STATUS_INPUT = 'input[aria-label="Status text"]';
const STATUS_COUNTER = "#status-character-count";

const setNativeValue = ($el: JQuery<HTMLElement>, value: string) => {
  const el = $el[0] as HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
};

describe("e2e tests for the status character limit", () => {
  it("limits status text to 100 characters and keeps the dialog working", () => {
    const baseRoute = Cypress.env("baseUrl");

    // Sign up and complete onboarding so the profile menu is reachable.
    cy.visit(baseRoute);
    cy.get('a:contains("Get started")').eq(0).click();

    const email = `statuslimit${Date.now()}@email.com`;
    cy.contains("Email address").parent()?.find("input").type(email);
    cy.contains("Username").parent()?.find("input").type("UserName");
    cy.contains("Password").parent()?.find("input").type("UserLast1234*");
    cy.contains("Create Account").click();
    cy.wait(2000);
    cy.contains("user created successfully", { timeout: 10000 }).should(
      "exist"
    );

    cy.location("pathname").should("eq", "/auth/login");
    cy.contains("Email address").parent()?.find("input").type(email);
    cy.contains("Password").parent()?.find("input").type("UserLast1234*");
    cy.contains("button", "Login").click();
    cy.wait(5000);

    cy.url().should("include", "/dashboard/welcome");
    cy.contains("button", "Get Started").click();

    cy.get('input[name="organisationName"]').type("Status Limit Org");
    cy.get('input[name="organisationType"]').type("OrganisationType");
    cy.get('button:contains("Select")').eq(0).click();
    cy.contains('[role="option"]', "United States").click({ force: true });
    cy.get('button:contains("Select")').click();
    cy.contains('[role="option"]', "Alabama").click({ force: true });
    cy.get('button:contains("Submit")').click();
    cy.get('button:contains("Proceed")').click();
    cy.wait(3000);

    // Open profile menu > status block.
    cy.get("#profile-trigger").click();
    cy.get('[role="menu"]').find(".cursor-pointer").first().click();
    cy.get('[role="dialog"]')
      .should("be.visible")
      .and("contain", "Set a status");

    // 1. The input accepts valid text and shows a live counter.
    cy.get(STATUS_INPUT).should("have.attr", "maxlength", "100");
    cy.get(STATUS_COUNTER).should("have.text", "0/100");
    cy.get(STATUS_INPUT).type("In a meeting");
    cy.get(STATUS_INPUT).should("have.value", "In a meeting");
    cy.get(STATUS_COUNTER).should("have.text", "12/100");

    // 2. Typing stops at 100 characters.
    cy.get(STATUS_INPUT).clear().type("x".repeat(140));
    cy.get(STATUS_INPUT).invoke("val").should("have.length", 100);
    cy.get(STATUS_COUNTER).should("have.text", "100/100");

    // 3. Pasting/inserting a longer value is truncated to the limit.
    cy.get(STATUS_INPUT).then(($el) => setNativeValue($el, "p".repeat(150)));
    cy.get(STATUS_INPUT).invoke("val").should("have.length", 100);
    cy.get(STATUS_COUNTER).should("have.text", "100/100");

    // 4. Empty and whitespace-only statuses keep the existing validation.
    cy.get(STATUS_INPUT).clear();
    cy.contains("button", "Save").should("be.disabled");
    cy.get(STATUS_INPUT).type("   ");
    cy.contains("button", "Save").should("not.be.disabled");
    cy.get(STATUS_INPUT).clear();

    // 5. Presets still fill the text and duration.
    cy.contains("Commuting").click();
    cy.get(STATUS_INPUT).should("have.value", "Commuting");
    cy.get(STATUS_COUNTER).should("have.text", "9/100");
    cy.get("select").should("have.value", "30 minutes");

    // 6. Saving still posts the status and closes the dialog.
    cy.intercept("POST", "**/profile/change-status", {
      statusCode: 200,
      body: {},
    }).as("saveStatus");
    cy.contains("button", "Save").click();
    cy.wait("@saveStatus").then(({ request }) => {
      expect(request.body.text).to.eq("Commuting");
      expect(request.body.status_timeout).to.eq("30 minutes");
    });
    cy.get('[role="dialog"]').should("not.exist");
  });
});

export {};
