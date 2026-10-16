describe("channel search scope (neo-272)", () => {
  const org = { id: "oracle-org", organisation_slug: "oracle", name: "Oracle" };
  const channel = { channels_id: "oracle-channel", name: "zedu-egret" };
  const user = {
    id: "oracle-user",
    user_id: "oracle-user",
    username: "oracle",
  };
  const result = (name) => ({
    user: { user_id: user.id, user_name: "Oracle" },
    channel: { channel_id: name, channel_name: name },
    messages: [
      { message_id: name, message: "ticket", timestamp: "2026-10-13" },
    ],
  });

  beforeEach(() => {
    cy.on("uncaught:exception", (error) => {
      if (error.message.includes("You need to provide your OneSignal appId."))
        return false;
    });
    cy.intercept("https://cdn.onesignal.com/**", {
      headers: { "content-type": "application/javascript" },
      body: "",
    });
    // An unset analytics URL otherwise loads the current page as JavaScript.
    cy.intercept("GET", "**?id=undefined", {
      headers: { "content-type": "application/javascript" },
      body: "",
    });
    cy.intercept("**/api/v1/**", (req) => {
      const path = new URL(req.url).pathname.replace("/api/v1", "");
      const data =
        {
          "/profile": user,
          "/organisations/oracle-org": org,
          "/users/organisations": [org],
          "/organisations/oracle-org/user-channels": [channel],
          "/channels/oracle-channel": channel,
        }[path] || [];
      req.reply({ statusCode: 200, body: { data } });
    });
    cy.intercept("**/search/organisation/oracle-org?*", (req) => {
      const query = new URL(req.url).searchParams.get("query");
      if (query.startsWith("ticket")) req.alias = "search";
      const scoped = query.includes(" in:");
      req.reply({
        statusCode: 200,
        body: { data: scoped ? [result(channel.name)] : [result("general")] },
      });
    });
    cy.visit("/oracle/home/channels/oracle-channel", {
      onBeforeLoad(win) {
        Object.entries({
          token: "local-test-token",
          orgId: org.id,
          orgSlug: "oracle",
          channelName: channel.name,
        }).forEach(([key, value]) => win.localStorage.setItem(key, value));
      },
    });
    cy.contains("Welcome to #zedu-egret").should("be.visible");
    cy.get('input[placeholder="Search in #zedu-egret"]').should("be.visible");
  });

  const expectScope = () => {
    cy.location("search").should("include", "channel=zedu-egret");
    cy.contains("button", "In: #zedu-egret").should("be.visible");
    cy.contains("Filtered query:").should("contain.text", "in:zedu-egret");
    cy.contains("1 result").should("be.visible");
    cy.contains("general").should("not.exist");
  };

  ["Enter", "View all results"].forEach((action) => {
    it(`preserves the channel via ${action}, refresh, and filter changes`, () => {
      // The channel composer can autofocus while its data finishes loading.
      for (const letter of "ticket")
        cy.get('input[placeholder="Search in #zedu-egret"]').type(letter);
      cy.get('input[placeholder="Search in #zedu-egret"]').should(
        "have.value",
        "ticket"
      );
      cy.wait("@search");
      if (action === "Enter") {
        cy.get('input[placeholder="Search in #zedu-egret"]').type("{enter}");
      } else {
        cy.contains('View all results for "ticket"').click();
      }
      cy.wait("@search")
        .its("request.query.query")
        .should("eq", "ticket in:zedu-egret");
      expectScope();
      cy.reload();
      cy.wait("@search")
        .its("request.query.query")
        .should("eq", "ticket in:zedu-egret");
      expectScope();
      cy.contains("button", "Sort:").click();
      cy.contains("button", /^Newest$/).click();
      cy.wait("@search");
      cy.contains("button", "In: #zedu-egret").find("svg.lucide-x").click();
      cy.wait("@search").its("request.query.query").should("eq", "ticket");
      cy.contains("button", "Sort: Newest").should("be.visible");
      cy.contains("button", /^In$/).should("be.visible");
      cy.contains("general").should("be.visible");
      cy.location("search").should("eq", "?query=ticket");
      cy.reload();
      cy.wait("@search").its("request.query.query").should("eq", "ticket");
      cy.contains("button", /^In$/).click();
      cy.get('[role="dialog"]').contains("button", "zedu-egret").click();
      cy.wait("@search")
        .its("request.query.query")
        .should("eq", "ticket in:zedu-egret");
      expectScope();
      cy.reload();
      cy.wait("@search")
        .its("request.query.query")
        .should("eq", "ticket in:zedu-egret");
      expectScope();
      cy.contains("button", "In: #zedu-egret").find("svg.lucide-x").click();
      cy.wait("@search").its("request.query.query").should("eq", "ticket");
    });
  });

  it("ignores a scoped response that finishes after the channel is cleared", () => {
    let releaseScoped;
    let scopedStarted = false;
    const pending = new Cypress.Promise((resolve) => (releaseScoped = resolve));
    cy.intercept("**/search/organisation/oracle-org?*", (req) => {
      if (new URL(req.url).searchParams.get("query").includes(" in:")) {
        req.alias = "delayedScope";
        scopedStarted = true;
        return pending.then(() =>
          req.reply({ body: { data: [result(channel.name)] } })
        );
      }
      req.alias = "workspace";
      req.reply({ body: { data: [result("general")] } });
    });
    cy.visit("/oracle/search?query=ticket&channel=zedu-egret");
    cy.wrap(null).should(() => expect(scopedStarted).to.eq(true));
    cy.contains("button", "In: #zedu-egret").find("svg.lucide-x").click();
    cy.wait("@workspace");
    cy.contains("general").should("be.visible");
    cy.then(() => releaseScoped());
    cy.wait("@delayedScope");
    cy.window().then(
      (win) =>
        new Cypress.Promise((resolve) =>
          win.requestAnimationFrame(() => win.requestAnimationFrame(resolve))
        )
    );
    cy.contains("button", /^In$/).should("be.visible");
    cy.contains("general").should("be.visible");
    cy.contains("Filtered query:").should("not.exist");
  });

  it("decodes channel names and resets scope when the URL changes", () => {
    const name = "oracle & team";
    cy.visit(`/oracle/search?query=ticket&channel=${encodeURIComponent(name)}`);
    cy.wait("@search")
      .its("request.query.query")
      .should("eq", 'ticket in:"oracle & team"');
    cy.contains("button", `In: #${name}`).should("be.visible");
    cy.get('input[placeholder^="Search"]').first().type("ticket{enter}");
    cy.wait("@search").its("request.query.query").should("eq", "ticket");
    cy.contains("button", /^In$/).should("be.visible");
  });
});
