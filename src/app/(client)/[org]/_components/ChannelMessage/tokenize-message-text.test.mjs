import assert from "node:assert/strict";
import { test } from "node:test";
import { tokenizeMessageText } from "./tokenize-message-text.ts";

// Plain strings deliberately bypass mailto anchors and explicit mention markup.
const cases = [
  ["person@gmail.com", ["person@gmail.com"], []],
  ["first.last+tag@example.co.uk", ["first.last+tag@example.co.uk"], []],
  ["Contact person@team.example.org.", ["person@team.example.org"], []],
  ["@username and person@gmail.com", ["person@gmail.com"], ["@username and"]],
  ["person@gmail.com and @username", ["person@gmail.com"], ["@username"]],
  ["(@username)", [], ["@username"]],
  [".@username", [], ["@username"]],
  ["Hello @username", [], ["@username"]],
  ["@first and @second", [], ["@first and", "@second"]],
  ["@channel", [], ["@channel"]],
  ["#channel", [], ["#channel"]],
  ["@channel and #channel", [], ["@channel and", "#channel"]],
  [
    "@first person@gmail.com @second first.last+tag@example.co.uk",
    ["person@gmail.com", "first.last+tag@example.co.uk"],
    ["@first", "@second"],
  ],
  ["www.person@example.com", ["www.person@example.com"], []],
];

for (const [input, emails, mentions] of cases) {
  test(`tokenizes plain text: ${input}`, () => {
    const tokens = tokenizeMessageText(input);
    assert.equal(tokens.map((token) => token.text).join(""), input);
    assert.deepEqual(
      tokens.filter((token) => token.isEmail).map((token) => token.text),
      emails
    );
    assert.deepEqual(
      tokens.filter((token) => token.isMention).map((token) => token.text),
      mentions
    );
    assert.ok(tokens.every((token) => !(token.isEmail && token.isMention)));
  });
}
