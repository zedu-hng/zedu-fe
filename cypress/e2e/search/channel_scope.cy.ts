// Start pnpm dev with NEXT_PUBLIC_BASE_URL=http://localhost:3002/mock-api,
// then run this spec with --config baseUrl=http://localhost:3002.
const channels = [
  { channels_id: "channel-neo", name: "zedu-neo", access: true },
  { channels_id: "channel-general", name: "general", access: true },
];

const searchHit = (channelName: string) => ({
  user: { user_id: "user-test", user_name: "Test User", avatar_url: "" },
  messages: [
    {
      message_id: `message-${channelName}`,
      message: `ticket in ${channelName}`,
      timestamp: "2026-01-01T12:00:00Z",
    },
  ],
  channel: {
    channel_id: `channel-${channelName}`,
    channel_name: channelName,
    channel_type: "channel",
  },
});

describe("Channel search scope", () => {
  beforeEach(() => {
    cy.on("window:before:load", (window) => {
      // Notifications are outside this search test; skip the external SDK.
      window.__oneSignalInitialized = true;
    });
    // Use a local mock API; no real account or backend is needed.
    cy.intercept("**/mock-api/**", (request) => {
      const path = new URL(request.url).pathname.replace("/mock-api", "");
      let data: unknown = [];
      if (path === "/profile") {
        data = { id: "user-test", username: "tester", name: "Test User" };
      } else if (path === "/organisations/org-test") {
        data = {
          id: "org-test",
          name: "Test Workspace",
          organisation_slug: "test",
        };
      } else if (path === "/users/organisations") {
        data = [
          { id: "org-test", name: "Test Workspace", organisation_slug: "test" },
        ];
      } else if (path.endsWith("/user-channels")) {
        data = channels;
      } else if (path === "/channels/channel-neo") {
        data = channels[0];
      } else if (path === "/search/organisation/org-test") {
        const query = new URL(request.url).searchParams.get("query");
        const channel = channels.find((item) =>
          query?.includes(`in:${item.name}`)
        );
        data = channel
          ? [searchHit(channel.name)]
          : [searchHit("zedu-neo"), searchHit("general"), searchHit("dm")];
        request.alias = "messageSearch";
      }
      request.reply({ statusCode: 200, body: { data } });
    });
  });

  const visit = (path: string) => {
    cy.visit(path, {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-only-token");
        window.localStorage.setItem("orgId", "org-test");
        window.localStorage.setItem("orgSlug", "test");
        window.localStorage.setItem("channelName", "zedu-neo");
        window.localStorage.setItem("channelId", "channel-neo");
      },
    });
  };

  const expectScopedResults = () => {
    cy.location("search").should((search) => {
      const params = new URLSearchParams(search);
      expect(params.get("channel")).to.equal("zedu-neo");
      expect(params.get("query")).to.equal("ticket");
    });
    cy.contains("button", "In: #zedu-neo").should("be.visible");
    cy.contains("1 result").should("be.visible");
    cy.contains("ticket in general").should("not.exist");
    cy.contains("ticket in dm").should("not.exist");
    cy.wait("@messageSearch")
      .its("request.url")
      .should((url) => {
        expect(new URL(url).searchParams.get("query")).to.equal(
          "ticket in:zedu-neo"
        );
      });
  };

  it("preserves the channel when pressing Enter", () => {
    visit("/test/home/channels/channel-neo");
    cy.get('[contenteditable="true"]').should("be.visible");
    cy.get('input[placeholder="Search in #zedu-neo"]').type("ticket");
    cy.contains("button", 'View all results for "ticket"').should("be.visible");
    cy.get('input[placeholder="Search in #zedu-neo"]').type("{enter}");
    expectScopedResults();
  });

  it("preserves the channel when opening all preview results", () => {
    visit("/test/home/channels/channel-neo");
    cy.get('[contenteditable="true"]').should("be.visible");
    cy.get('input[placeholder="Search in #zedu-neo"]')
      .type("ticket")
      .should("have.value", "ticket");
    cy.contains("button", 'View all results for "ticket"').click();
    expectScopedResults();
  });

  it("restores the filter on reload and allows clearing it", () => {
    visit("/test/search?query=ticket&channel=zedu-neo");
    expectScopedResults();
    cy.reload();
    cy.contains("button", "In: #zedu-neo").should("be.visible");
    cy.contains("button", "In: #zedu-neo").find("svg.lucide-x").click();
    cy.contains("button", "In: #zedu-neo").should("not.exist");
    cy.contains("ticket in general").should("be.visible");
    cy.contains("ticket in dm").should("be.visible");
    cy.location("search").should((search) => {
      expect(new URLSearchParams(search).has("channel")).to.equal(false);
    });
    cy.reload();
    cy.contains("button", "In: #zedu-neo").should("not.exist");
    cy.contains("ticket in general").should("be.visible");
    cy.contains("ticket in dm").should("be.visible");
  });

  it("preserves a changed channel in the URL and after reload", () => {
    visit("/test/search?query=ticket&channel=zedu-neo");
    cy.contains("button", "In: #zedu-neo").click();
    cy.contains("button", "#general").click();
    cy.location("search").should((search) => {
      const params = new URLSearchParams(search);
      expect(params.get("channel")).to.equal("general");
      expect(params.get("query")).to.equal("ticket");
    });
    cy.contains("button", "In: #general").should("be.visible");
    cy.contains("ticket in general").should("be.visible");
    cy.contains("ticket in zedu-neo").should("not.exist");
    cy.reload();
    cy.contains("button", "In: #general").should("be.visible");
    cy.contains("ticket in general").should("be.visible");
    cy.contains("ticket in zedu-neo").should("not.exist");
  });

  it("resets the originating channel for a new workspace-wide search", () => {
    visit("/test/search?query=ticket&channel=zedu-neo");
    cy.contains("button", "In: #zedu-neo").should("be.visible");
    cy.get('input[placeholder="Search messages and people..."]').type(
      "ticket{enter}"
    );
    cy.location("search").should((search) => {
      expect(new URLSearchParams(search).has("channel")).to.equal(false);
    });
    cy.contains("button", "In: #zedu-neo").should("not.exist");
    cy.contains("ticket in general").should("be.visible");
  });
});

export {};
