const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "page.tsx"), "utf8");
const file = ts.createSourceFile(
  "page.tsx",
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const handlers = new Map();
function visit(node) {
  if (
    ts.isVariableDeclaration(node) &&
    ["startCheckout", "handleSubscription", "handleUpgrade"].includes(
      node.name.getText(file)
    )
  ) {
    handlers.set(node.name.getText(file), node.initializer.getText(file));
  }
  ts.forEachChild(node, visit);
}
visit(file);
const program = ts.transpileModule(
  [...handlers].map(([name, value]) => `const ${name} = ${value};`).join("\n") +
    "\n({ handleSubscription, handleUpgrade });",
  { compilerOptions: { target: ts.ScriptTarget.ES2020 } }
).outputText;

function setup(request, overrides = {}) {
  const state = { plan: "", errors: [], redirects: [], calls: [] };
  const pending = { current: false };
  const invoke = (method) => async (url, payload) => {
    state.calls.push({ method, url, payload });
    return request();
  };
  const context = {
    URL,
    canManageBilling: true,
    checkoutPending: pending,
    setLoadingPlan: (value) => {
      state.plan = value;
    },
    setIsLoading: () => {},
    orgData: { id: "test-org", subscription_plan_id: "pro" },
    orgId: "test-org",
    email: "org@example.com",
    user: { email: "payer@example.com" },
    PostRequest: invoke("POST"),
    PutRequest: invoke("PUT"),
    showError: (message) => state.errors.push(message),
    window: { location: { assign: (url) => state.redirects.push(url) } },
    ...overrides,
  };
  const actions = vm.runInNewContext(program, context);
  return { state, pending, ...actions };
}
const success = (url) => ({
  status: 201,
  data: { data: { checkout_session_url: url } },
});

for (const [name, result] of [
  ["resolved Axios error", { response: { status: 503 } }],
  ["HTTP failure", { status: 503 }],
  ["missing response", undefined],
  ["missing checkout data", { status: 201 }],
  ...[
    undefined,
    "",
    "   ",
    42,
    "/checkout",
    "not a url",
    "javascript:alert(1)",
    "data:text/plain,no",
  ].map((url) => [`invalid checkout URL ${JSON.stringify(url)}`, success(url)]),
]) {
  test(`${name} releases all buttons and permits retry`, async () => {
    const app = setup(async () => result);
    await app.handleSubscription("pro-id");
    assert.equal(app.state.plan, "");
    assert.equal(app.pending.current, false);
    assert.equal(app.state.redirects.length, 0);
    assert.equal(app.state.errors.length, 1);
    await app.handleSubscription("another-plan");
    assert.equal(app.state.calls.length, 2);
  });
}

test("rejected request releases the pending state", async () => {
  const app = setup(async () => {
    throw new Error("offline");
  });
  await app.handleSubscription("pro-id");
  assert.equal(app.state.plan, "");
  assert.equal(app.pending.current, false);
  assert.equal(app.state.errors.length, 1);
});

test("rapid same-plan and cross-plan clicks produce only one request", async () => {
  let resolve;
  const app = setup(
    () =>
      new Promise((done) => {
        resolve = done;
      })
  );
  const first = app.handleSubscription("pro-id");
  await app.handleSubscription("pro-id");
  await app.handleUpgrade("lower-id", "Lower");
  assert.equal(app.state.plan, "pro-id");
  assert.equal(app.state.calls.length, 1);
  resolve({ status: 503 });
  await first;
  assert.equal(app.state.plan, "");
  assert.equal(app.pending.current, false);
});

test("downgrade shows its plan spinner, preserves the payload and recovers", async () => {
  let resolve;
  const app = setup(
    () =>
      new Promise((done) => {
        resolve = done;
      })
  );
  const first = app.handleUpgrade("pro-id", "Pro");
  await app.handleUpgrade("pro-id", "Pro");
  assert.equal(app.state.plan, "pro-id");
  assert.equal(app.state.calls.length, 1);
  assert.equal(app.state.calls[0].method, "PUT");
  assert.equal(app.state.calls[0].url, "/subscriptions/modify");
  assert.equal(
    JSON.stringify(app.state.calls[0].payload),
    JSON.stringify({ plan_name: "Pro", org_id: "test-org" })
  );
  resolve({ status: 503 });
  await first;
  assert.equal(app.pending.current, false);
  assert.equal(app.state.plan, "");
});

for (const protocol of ["https", "http"]) {
  test(`valid ${protocol} checkout redirects once and stays locked until navigation`, async () => {
    const destination = `${protocol}://checkout.example.com/session`;
    const app = setup(async () => success(destination));
    await app.handleSubscription("pro-id");
    assert.deepEqual(app.state.redirects, [destination]);
    assert.equal(app.state.plan, "pro-id");
    assert.equal(app.pending.current, true);
    assert.equal(
      JSON.stringify(app.state.calls[0].payload),
      JSON.stringify({
        plan_id: "pro-id",
        org_id: "test-org",
        email: "payer@example.com",
      })
    );
    await app.handleSubscription("pro-id");
    assert.equal(app.state.calls.length, 1);
  });
}

test("failed browser navigation releases the lock", async () => {
  const app = setup(
    async () => success("https://checkout.example.com/session"),
    {
      window: {
        location: {
          assign: () => {
            throw new Error("blocked");
          },
        },
      },
    }
  );
  await app.handleSubscription("pro-id");
  assert.equal(app.pending.current, false);
  assert.equal(app.state.plan, "");
});

test("users without billing permission cannot start either request", async () => {
  const app = setup(
    async () => success("https://checkout.example.com/session"),
    { canManageBilling: false }
  );
  await app.handleSubscription("pro-id");
  await app.handleUpgrade("pro-id", "Pro");
  assert.equal(app.state.calls.length, 0);
});

test("legacy free-plan modification keeps the create endpoint and name payload", async () => {
  const app = setup(async () => ({ status: 503 }), {
    orgData: { id: "test-org", subscription_plan_id: "free" },
  });
  await app.handleUpgrade("pro-id", "Pro");
  assert.equal(app.state.calls[0].method, "POST");
  assert.equal(app.state.calls[0].url, "/subscriptions/create");
  assert.equal(app.state.calls[0].payload.plan_name, "Pro");
});
