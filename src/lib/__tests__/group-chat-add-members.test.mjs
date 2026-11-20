import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const source = readFileSync(
  new URL(
    "../../app/(client)/[org]/_components/chat-nav/menu-dropdown.tsx",
    import.meta.url
  ),
  "utf8"
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;

// Render the real menu with test context; unrelated dialogs and network calls
// are not exercised by these permission-visibility regression checks.
export function renderMenu({
  user,
  participants,
  permissions = [],
  isOpen = true,
}) {
  const context = React.createContext(undefined);
  const exports = {};
  const hiddenComponent = () => null;
  const dependencies = {
    react: React,
    "react/jsx-runtime": jsxRuntime,
    "next/navigation": {
      useParams: () => ({ id: "test-group" }),
      useRouter: () => ({}),
    },
    "~/store/GlobalState": { DataContext: context },
    "~/store/Actions": { ACTIONS: {} },
    "~/utils/new-request": {},
    "~/components/toast/sonner": {},
    "~/hooks/useRBAC": {
      useRBAC: () => ({ hasPermission: (key) => permissions.includes(key) }),
    },
    "~/components/ui/loading": hiddenComponent,
    "./add-members-modal": { AddMembersModal: hiddenComponent },
    "./view-members-modal": { ViewMembersModal: hiddenComponent },
    "../pinned-messages/pinned-messages-modal": hiddenComponent,
  };
  runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return renderToStaticMarkup(
    React.createElement(
      context.Provider,
      { value: { state: { user, dms: [] }, dispatch: () => {} } },
      React.createElement(exports.default, {
        isOpen,
        participants,
        onClose: () => {},
      })
    )
  );
}

test("ordinary group participants can access Add members without org-wide permissions", () => {
  const html = renderMenu({
    user: { user_id: "member" },
    participants: [{ user_id: "member" }, { user_id: "peer" }],
  });
  assert.match(html, /Add members/);
});

test("membership matches numeric and string IDs and supports the id field", () => {
  assert.match(
    renderMenu({ user: { id: 42 }, participants: [{ id: "42" }] }),
    /Add members/
  );
});

test("non-participants and missing user or membership data do not gain access", () => {
  for (const data of [
    { user: { id: "outsider" }, participants: [{ user_id: "member" }] },
    { user: null, participants: [{ user_id: "member" }] },
    { user: {}, participants: [{}] },
    { user: { id: "member" }, participants: null },
  ])
    assert.doesNotMatch(renderMenu(data), /Add members/);
});

test("existing organisation permission access is preserved", () => {
  for (const permission of ["manage:members", "invite:members"]) {
    assert.match(
      renderMenu({ user: { id: "admin" }, permissions: [permission] }),
      /Add members/
    );
  }
});

test("the closed conversation menu remains hidden", () => {
  assert.doesNotMatch(
    renderMenu({
      user: { id: "member" },
      participants: [{ user_id: "member" }],
      isOpen: false,
    }),
    /Add members/
  );
});
