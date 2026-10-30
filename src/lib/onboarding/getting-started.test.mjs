import assert from "node:assert/strict";
import test from "node:test";

const {
  gettingStartedKey,
  parseProgress,
  completedSteps,
  shouldShowChecklist,
  stepForMessagePath,
} = await import("./getting-started.ts");

test("key needs both org and user", () => {
  assert.equal(gettingStartedKey("org1", "u1"), "zedu:getting-started:org1:u1");
  assert.equal(gettingStartedKey("org1", null), null);
  assert.equal(gettingStartedKey("", "u1"), null);
});

test("parseProgress ignores bad JSON and unknown steps", () => {
  assert.deepEqual(parseProgress(null), { dismissed: false, done: {} });
  assert.deepEqual(parseProgress("{not json"), { dismissed: false, done: {} });
  assert.deepEqual(
    parseProgress(
      '{"dismissed":"yes","done":{"dm":true,"hack":true,"buzz":1}}'
    ),
    { dismissed: false, done: { dm: true } }
  );
});

test("a profile photo counts as the photo step", () => {
  const p = parseProgress('{"done":{"dm":true}}');
  assert.deepEqual([...completedSteps(p, true)].sort(), ["dm", "photo"]);
  assert.deepEqual([...completedSteps(p, false)], ["dm"]);
});

test("card shows until dismissed or all four steps are done", () => {
  const none = parseProgress(null);
  assert.equal(shouldShowChecklist(none, false), true);
  assert.equal(
    shouldShowChecklist(parseProgress('{"dismissed":true}'), false),
    false
  );
  const three = parseProgress(
    '{"done":{"channel_message":true,"dm":true,"buzz":true}}'
  );
  assert.equal(shouldShowChecklist(three, false), true);
  assert.equal(shouldShowChecklist(three, true), false);
});

test("messages count for the right step by page", () => {
  assert.equal(
    stepForMessagePath("/acme/home/channels/123"),
    "channel_message"
  );
  assert.equal(stepForMessagePath("/acme/dm/abc/def"), "dm");
  assert.equal(stepForMessagePath("/acme/home/people/abc/dms"), "dm");
  assert.equal(stepForMessagePath("/acme/colleagues/a/b"), "dm");
  assert.equal(stepForMessagePath("/acme/later"), null);
  assert.equal(stepForMessagePath(undefined), null);
});
