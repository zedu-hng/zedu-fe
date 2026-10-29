import assert from "node:assert/strict";
import test from "node:test";

const { summarizeNotification } = await import("./message-preview.ts");

test("direct message: name and 'Sent you a message', no text", () => {
  const s = summarizeNotification({
    title: "Hey, are we still on for 3pm?",
    payload: { notification_type: "dm", sender_name: "Ada Obi" },
  });
  assert.deepEqual(s, { name: "Ada Obi", line: "Sent you a message" });
});

test("mention in a channel", () => {
  const s = summarizeNotification({
    payload: {
      notification_type: "mention",
      sender_name: "Ada Obi",
      channel_name: "general",
    },
  });
  assert.equal(s.line, "Mentioned you in #general");
});

test("channel message keeps an existing # and never shows text", () => {
  const s = summarizeNotification({
    title: "secret plans",
    payload: {
      notification_type: "channel",
      sender_name: "Ada Obi",
      channel_name: "#design",
    },
  });
  assert.equal(s.line, "New message in #design");
  assert.ok(!JSON.stringify(s).includes("secret"));
});

test("group DM from channel_type", () => {
  const s = summarizeNotification({
    payload: { channel_type: "group_dm", sender_name: "Ada Obi" },
  });
  assert.equal(s.line, "Sent a message in a group conversation");
});

test("never uses a title that is really the message", () => {
  const s = summarizeNotification({
    title: "Please send me the bank details before 5",
    message: "Please send me the bank details before 5",
    payload: { notification_type: "dm" },
  });
  assert.equal(s.name, "Someone");
  const long = summarizeNotification({
    title: "This is a long first line of a private message, not a name",
    payload: { notification_type: "dm" },
  });
  assert.equal(long.name, "Someone");
});

test("falls back to a short title for the name, then 'Someone'", () => {
  assert.equal(summarizeNotification({ title: "Ada Obi" }).name, "Ada Obi");
  assert.equal(summarizeNotification({}).name, "Someone");
  assert.equal(summarizeNotification(null).line, "Sent you a notification");
});

test("ignores blank strings", () => {
  const s = summarizeNotification({
    title: "  ",
    payload: { sender_name: "   ", notification_type: "dm" },
  });
  assert.deepEqual(s, { name: "Someone", line: "Sent you a message" });
});
