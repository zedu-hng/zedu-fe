import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Execute the actual reducer without loading the application's alias imports.
const source = readFileSync(
  new URL("../../store/Reducers.ts", import.meta.url),
  "utf8"
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
runInNewContext(compiled, {
  exports,
  require: (name) => {
    if (name === "./Actions")
      return { ACTIONS: new Proxy({}, { get: (_, key) => key }) };
    if (name === "~/utils/saved-bookmarks") return {};
    throw new Error(`Unexpected dependency invoked: ${name}`);
  },
});
const reduce = (state, type, payload) =>
  JSON.parse(JSON.stringify(exports.default(state, { type, payload })));
const group = (id, count = 0) => ({
  thread_id: id,
  thread_messages: [{ thread_id: id, message_count: count }],
});

test("activity refresh inserts new threads, updates existing ones and retains older pages", () => {
  const result = reduce(
    {
      threadMentions: [group("updated"), group("older")],
      threadMentionsHasMore: true,
      unseenThreadCount: 4,
    },
    "THREAD_MENTIONS",
    { refresh: true, newThreads: [group("new"), group("updated", 2)] }
  );
  assert.deepEqual(
    result.threadMentions.map((item) => item.thread_id),
    ["new", "updated", "older"]
  );
  assert.equal(result.threadMentions[1].thread_messages[0].message_count, 2);
  assert.equal(result.threadMentionsHasMore, true);
  assert.equal(result.unseenThreadCount, 4);
});

test("refresh handles nested IDs and preserves an exhausted pagination cursor", () => {
  const result = reduce(
    { threadMentions: [group("same")], threadMentionsHasMore: false },
    "THREAD_MENTIONS",
    {
      refresh: true,
      newThreads: [{ thread_messages: [{ thread_id: "same" }] }],
    }
  );
  assert.equal(result.threadMentions.length, 1);
  assert.equal(result.threadMentionsHasMore, false);
});

test("an empty list can receive its first thread and restore pagination", () => {
  const result = reduce(
    { threadMentions: [], threadMentionsHasMore: false },
    "THREAD_MENTIONS",
    { refresh: true, newThreads: [group("first")], hasMore: true }
  );
  assert.equal(result.threadMentions[0].thread_id, "first");
  assert.equal(result.threadMentionsHasMore, true);
});

test("pagination continues past a page that overlaps after new activity", () => {
  const result = reduce(
    { threadMentions: [group("same")], threadMentionsHasMore: true },
    "THREAD_MENTIONS",
    { newPage: 2, newThreads: [group("same")], hasMore: true }
  );
  assert.equal(result.threadMentions.length, 1);
  assert.equal(result.threadMentionsHasMore, true);
});

test("reply refresh preserves older replies and deduplicates overlapping pages and realtime deliveries", () => {
  let state = { replies: [{ id: "existing" }, { id: "older" }] };
  state = reduce(state, "REPLIES", {
    refresh: true,
    newThreads: [{ id: "new" }, { id: "existing", message: "updated" }],
  });
  state = reduce(state, "REPLIES", {
    isRealTime: true,
    newMessage: { id: "new" },
  });
  state = reduce(state, "REPLIES", {
    newPage: 2,
    newThreads: [{ id: "older" }, { id: "oldest" }],
  });
  assert.deepEqual(
    state.replies.map((item) => item.id),
    ["new", "existing", "older", "oldest"]
  );
  assert.equal(state.replies[1].message, "updated");
});
