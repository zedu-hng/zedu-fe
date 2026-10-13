const sectionHeadings = [
  "Everything you need for Modern Learning",
  "Fewer Tools, Smarter Learning",
  "The Platform for Every Type of Learning",
  "Simple, Flexible Pricing for Education",
  "Launching a bootcamp? Let's build a pricing model that fits your cohort size.",
  "Why Educators Choose Zedu",
  "Got a Question? We Have an Answer",
  "Run Your Next Cohort Without Limits",
];

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];

describe("Homepage heading hierarchy", () => {
  viewports.forEach(({ name, width, height }) => {
    it(`has a logical heading outline on ${name}`, () => {
      cy.viewport(width, height);
      cy.visit(Cypress.env("baseUrl"));

      cy.get("h1")
        .should("have.length", 1)
        .and("contain.text", "Built for Bootcamps and Learning Communities");

      sectionHeadings.forEach((heading) => {
        cy.contains("h2", heading).should("be.visible");
      });

      ["Organized Channels", "Starter", "Pro", "Enterprise"].forEach(
        (heading) => {
          cy.contains("h3", heading).should("be.visible");
        }
      );

      cy.get("h1, h2, h3").then(($headings) => {
        const levels = Array.from($headings, (heading) =>
          Number(heading.tagName.slice(1))
        );
        const hasSkippedLevel = levels.some(
          (level, index) => index > 0 && level > levels[index - 1] + 1
        );

        expect(hasSkippedLevel).to.be.false;
      });
    });
  });
});
