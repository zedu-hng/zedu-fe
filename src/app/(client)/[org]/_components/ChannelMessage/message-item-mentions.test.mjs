import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  fileURLToPath(new URL("../../../../../../", import.meta.url))
);
const require = createRequire(import.meta.url);

test("message rendering keeps structured multiword names and plain words separate", async () => {
  const esbuildDirectory = (
    await readdir(path.join(root, "node_modules/.pnpm"))
  ).find((name) => name.startsWith("esbuild@"));
  assert.ok(esbuildDirectory, "Installed esbuild is required");
  const { build } = await import(
    path.join(
      root,
      "node_modules/.pnpm",
      esbuildDirectory,
      "node_modules/esbuild/lib/main.js"
    )
  );
  const directory = await mkdtemp(path.join(tmpdir(), "zedu-391-mentions-"));
  const output = path.join(directory, "fixture.cjs");
  const fixture = `
    import React from "react";
    import { renderToStaticMarkup } from "react-dom/server";
    import { DataContext } from "~/store/GlobalState";
    import MessageItem from "~/app/(client)/[org]/_components/ChannelMessage/message-item";
    const message = 'support@example.com, **@username and team**; <span data-id="member-1" data-label="Jane Doe">@Jane Doe</span> and <span data-id="channel-1" data-label="Team Updates">#Team Updates</span>.';
    const state = { user: { id: "fixture-user" }, channels: [], allChannels: [] };
    const renderMessage = (message) => renderToStaticMarkup(
      <DataContext.Provider value={{ state, dispatch: () => {} }}>
        <MessageItem item={{ type: "message", message, media: [] }} />
      </DataContext.Provider>
    );
    export const markup = renderMessage(message);
    export const plainMarkup = renderMessage("<p>@username and person@gmail.com</p>");
    export const bareMarkup = renderMessage("@username and person@gmail.com");
    export const urlMarkup = renderMessage("<p>Visit www.fixture.test/@username and @second</p>");
  `;

  try {
    await build({
      stdin: { contents: fixture, resolveDir: root, loader: "tsx" },
      bundle: true,
      platform: "node",
      format: "cjs",
      outfile: output,
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      plugins: [
        {
          name: "isolated-message-dependencies",
          setup(builder) {
            builder.onResolve(
              {
                filter:
                  /^(next\/navigation|next\/image|\.\/image-viewer|\.\/preview-links|\.\/share-file-modal|\.\/document-attachment-card|\.\/document-preview-modal|\.\.\/voice\/voice-message|\.\.\/delete-message-modal\/delete-file|\.\.\/file-management\/FileList|\.\/mention|~\/components\/toast\/sonner|prismjs\/themes\/prism.css)$/,
              },
              ({ path: specifier }) => ({ path: specifier, namespace: "stub" })
            );
            builder.onLoad(
              { filter: /.*/, namespace: "stub" },
              ({ path: specifier }) => ({
                contents:
                  specifier === "next/navigation"
                    ? "export const useRouter = () => ({ push: () => {} });"
                    : specifier.includes("FileList")
                      ? 'export const getFileIconClass = () => "";'
                      : specifier.includes("sonner")
                        ? "export const showInfo = () => {};"
                        : "export default function Stub() { return null; } export const VoiceMessage = Stub;",
                resolveDir: root,
              })
            );
            builder.onResolve({ filter: /^~\/store\/GlobalState$/ }, () => ({
              path: "context",
              namespace: "fixture",
            }));
            builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
              contents:
                'import { createContext } from "react"; export const DataContext = createContext(null);',
              resolveDir: root,
            }));
          },
        },
      ],
    });

    const { markup, plainMarkup, bareMarkup, urlMarkup } = require(output);
    const mentionLabels = [
      ...markup.matchAll(/<span[^>]*cursor-pointer[^>]*>([^<]+)<\/span>/g),
    ].map((match) => match[1]);
    assert.deepEqual(mentionLabels, [
      "@username",
      "@Jane Doe",
      "#Team Updates",
    ]);
    assert.match(markup, /<\/span> and team/);
    assert.match(markup, /href="mailto:support@example.com"/);
    const plainMentionLabels = [
      ...plainMarkup.matchAll(/<span[^>]*cursor-pointer[^>]*>([^<]+)<\/span>/g),
    ].map((match) => match[1]);
    assert.deepEqual(plainMentionLabels, ["@username"]);
    assert.match(plainMarkup, /<\/span> and /);
    assert.match(plainMarkup, /<\/span> and person@gmail\.com/);
    const bareMentionLabels = [
      ...bareMarkup.matchAll(/<span[^>]*cursor-pointer[^>]*>([^<]+)<\/span>/g),
    ].map((match) => match[1]);
    assert.deepEqual(bareMentionLabels, ["@username"]);
    assert.match(bareMarkup, /<\/span> and /);
    assert.match(bareMarkup, /href="mailto:person@gmail.com"/);
    assert.match(urlMarkup, /href="https:\/\/www\.fixture\.test\/@username"/);
    const urlMentionLabels = [
      ...urlMarkup.matchAll(/<span[^>]*cursor-pointer[^>]*>([^<]+)<\/span>/g),
    ].map((match) => match[1]);
    assert.deepEqual(urlMentionLabels, ["@second"]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
