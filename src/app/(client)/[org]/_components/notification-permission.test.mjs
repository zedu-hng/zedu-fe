import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createNotificationDismissal,
  getGuidanceBrowser,
  getDismissalState,
  notificationGuidance,
  shouldShowNotificationNotice,
} from "./notification-permission.ts";

for (const permission of ["default", "denied", "granted", "unsupported"]) {
  test(`${permission} respects dismissal and initialization`, () => {
    for (const ready of [false, true]) {
      for (const dismissed of [false, true]) {
        assert.equal(
          shouldShowNotificationNotice(permission, { ready, dismissed }),
          permission === "denied" && ready && !dismissed
        );
      }
    }
  });
}

for (const [ua, browser] of [
  ["Chrome/130 Safari/537", "chrome"],
  ["Chrome/130 Safari/537 Edg/130", "edge"],
  ["Firefox/130", "firefox"],
  ["Version/18 Safari/605", "safari"],
  ["iPhone Version/18 Safari/605", "other"],
  ["Chrome/130 Safari/537 OPR/115", "other"],
  ["Unknown browser", "other"],
]) {
  test(`selects guidance for ${browser}: ${ua}`, () => {
    assert.equal(getGuidanceBrowser(ua), browser);
    assert.equal(notificationGuidance[browser].length, 2);
  });
}

test("dismissal stays unready until the current account's storage is read", () => {
  const alice = { accountId: "alice", dismissed: true };
  const bob = { accountId: "bob", dismissed: false };
  for (const [accountId, snapshot, ready, dismissed] of [
    ["alice", null, false, false],
    ["alice", alice, true, true],
    ["bob", alice, false, false],
    ["bob", bob, true, false],
    ["alice", bob, false, false],
    [null, alice, false, false],
  ]) {
    assert.deepEqual(getDismissalState(accountId, snapshot), {
      ready,
      dismissed,
    });
  }
});

test("dismissal persists for the session and stays scoped to its account", () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  };
  const store = createNotificationDismissal(() => storage);
  assert.equal(store.read("alice"), false);
  store.dismiss("alice");
  assert.equal(store.read("alice"), true);
  assert.equal(store.read("bob"), false);
  assert.equal(createNotificationDismissal(() => storage).read("alice"), true);
  assert.equal(
    createNotificationDismissal(() => undefined).read("alice"),
    false
  );
});

test("missing identity and unavailable or throwing storage are safe", () => {
  for (const getStorage of [
    () => undefined,
    () => {
      throw new Error("blocked");
    },
    () => ({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
    }),
  ]) {
    const store = createNotificationDismissal(getStorage);
    store.dismiss(null);
    assert.equal(store.read(null), false);
    assert.equal(store.read("alice"), false);
    store.dismiss("alice");
    assert.equal(store.read("alice"), true);
    assert.equal(store.read("bob"), false);
  }
});
