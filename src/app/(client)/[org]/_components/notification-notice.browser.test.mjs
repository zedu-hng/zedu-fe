// Run directly with Node 22. Uses installed Chrome and esbuild; no Zedu backend.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const testHost = "127.0.0.1";
const testProtocol = "http:";
const root = path.resolve(
  fileURLToPath(new URL("../../../../../", import.meta.url))
);
const esbuildDirectory = (
  await readdir(path.join(root, "node_modules/.pnpm"))
).find((name) => name.startsWith("esbuild@"));
assert.ok(
  esbuildDirectory,
  "This browser check requires the installed esbuild tooling"
);
const { build } = await import(
  path.join(
    root,
    "node_modules/.pnpm",
    esbuildDirectory,
    "node_modules/esbuild/lib/main.js"
  )
);
const components = "~/app/(client)/[org]/_components/";
const fixture = `
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { DataContext } from "~/store/GlobalState";
import ChannelHeader from "${components}channel-nav";
import ChatHeader from "${components}chat-nav";
import PeopleHeader from "${components}people-nav";
import ChannelMessages from "${components}ChannelMessage";
import GroupMessages from "${components}group-message";
import PeopleMessages from "${components}people-message";
import AgentMessages from "${components}agent-message";
import { NotificationPermissionHelp } from "${components}notification-permission-guidance";
import MessageBox from "${components}message-box";
import { TooltipProvider } from "~/components/ui/tooltip";
window.addEventListener("error", event => { document.body.dataset.runtimeError = event.message; });
localStorage.setItem("zedu:message-drafts", JSON.stringify({"fixture-draft":"<p>Unsent draft</p>"}));
let permission = "denied", account = "alice", navigate;
const messages = Array.from({length:80}, (_, i) => ({thread_id:"fixture-"+i,created_at:new Date().toISOString(),user_id:"fixture-member",content:"Fixture message "+i}));
Object.defineProperty(window, "Notification", { configurable: true,
  value: { get permission() { return permission; },
    requestPermission() { throw Error("Permission requests are forbidden"); } } });
function Fixture() {
  const [view, setView] = useState({ account, route: "channel" });
  navigate = (account, route = view.route) => setView({ account, route });
  return <DataContext.Provider value={{state:{user:view.account === "bob" ? {user_id:view.account} : {id:view.account}, mentions:[], channels:[],
    messages, chats:messages, bookmarks:[], channelName:"Fixture channel",
    channelDetails:{channels_id:"fixture",name:"Fixture channel",users:[]}}, dispatch:()=>{}}}>
    <main className="flex h-[calc(100dvh-70px)] relative w-full overflow-hidden">
      <div className="relative flex flex-col flex-1">
      {view.route === "channel" ? <ChannelHeader/> : view.route === "group DM"
        ? <ChatHeader participants={[{id:"fixture-member",username:"Fixture member"}]}/>
        : <PeopleHeader user={{id:"fixture-member",username:"Fixture member"}}/>}
      {view.route === "channel" ? <ChannelMessages/> : view.route === "group DM"
        ? <GroupMessages/> : view.route === "agent" ? <AgentMessages/> : <PeopleMessages/>}
      <div id="composer" className="absolute bottom-0 left-0 right-[17px]"><MessageBox subscription={null}
        draftKey="fixture-draft" showTyping={false}
        sendMessage={()=>{throw Error("Sending is forbidden");}}/></div>
      </div>
    </main>
    <NotificationPermissionHelp/>
  </DataContext.Provider>;
}
createRoot(document.getElementById("root")).render(<TooltipProvider><Fixture/></TooltipProvider>);
const settle = () => new Promise(resolve => setTimeout(resolve, 80));
const check = (value, message) => { if (!value) throw Error(message); };
const notice = () => document.querySelector('[aria-label="Dismiss notification notice"]');
const trigger = () => Array.from(document.querySelectorAll("header button")).find(button => button.textContent === "How to enable");
const setPermission = async value => {
  permission = value; await new Promise(resolve => setTimeout(resolve, 2200));
};
(async () => {
  await settle();
  if (sessionStorage.getItem("fixture-reloading")) {
    check(!notice(), "dismissal survives reload");
    sessionStorage.removeItem("fixture-reloading");
  } else {
    check(notice(), "denied account shows the notice");
    for (const state of ["default", "granted"]) {
      await setPermission(state); check(!notice(), state + " hides the notice");
    }
    delete window.Notification;
    navigate("alice", "DM"); await settle();
    check(!notice(), "unsupported hides the notice");
    Object.defineProperty(window, "Notification", { configurable:true,
      value:{ get permission() { return permission; } } });
    permission = "denied"; navigate("alice", "channel"); await settle();
    for (const route of ["DM", "group DM", "agent", "channel"]) {
      navigate("alice", route); await settle();
      check(notice(), route + " mounts the actual notice beneath its header");
      trigger().click(); await settle();
      check(document.getElementById("scrollableDivs").getBoundingClientRect().top >= document.querySelector("header").getBoundingClientRect().bottom - 1, route + " instructions remain in flow");
      check(document.querySelector('[contenteditable="true"]').textContent === "Unsent draft", route + " preserves draft");
      trigger().click(); await settle();
    }
    const button = trigger(); button.focus();
    check(document.activeElement === button, "disclosure receives keyboard focus");
    check(button.getAttribute("aria-expanded") === "false", "collapsed state is accessible");
    button.click(); await settle();
    check(button.getAttribute("aria-expanded") === "true", "expanded state is accessible");
    check(document.getElementById(button.getAttribute("aria-controls")), "disclosure labels its content");
    check(document.querySelector("header ol").textContent.includes("Site settings"), "Chrome guidance renders");
    const header = document.querySelector("header").getBoundingClientRect();
    const messages = document.getElementById("scrollableDivs").getBoundingClientRect();
    const draft = document.querySelector('[contenteditable="true"]');
    check(draft?.textContent === "Unsent draft", "real composer restores fixture draft");
    check(messages.top >= header.bottom - 1, "expanded notice does not overlay messages");
    check(messages.height > 0 && document.getElementById("scrollableDivs").scrollHeight > messages.height, "messages retain a scrollable viewport");
    check(document.querySelector("header").getBoundingClientRect().bottom <= document.getElementById("composer").getBoundingClientRect().top, "notice does not overlay composer");
    check(Array.from(document.querySelectorAll('[data-fixture-message]')).some(item => {
      const bounds = item.getBoundingClientRect();
      return bounds.top >= messages.top && bounds.bottom <= document.getElementById("composer").getBoundingClientRect().top;
    }), "message content remains visible above composer");
    check(document.documentElement.scrollWidth <= innerWidth, "narrow layout has no horizontal overflow");
    button.click(); await settle();
    check(draft === document.querySelector('[contenteditable="true"]') && draft.textContent === "Unsent draft", "disclosure preserves mounted composer and draft");
    notice().click(); await settle();
    check(!notice(), "dismiss hides notice");
    check(document.activeElement.tagName === "H2", "dismiss returns focus to conversation heading");
    check(draft === document.querySelector('[contenteditable="true"]') && draft.textContent === "Unsent draft", "dismiss preserves mounted composer and draft");
    navigate("alice", "group DM"); await settle(); check(!notice(), "navigation preserves dismissal");
    navigate("bob", "DM"); await settle(); check(notice(), "another account is not dismissed");
    navigate("alice"); await settle(); check(!notice(), "returning account remains dismissed");
    sessionStorage.setItem("fixture-reloading", "1"); location.reload(); return;
  }
  const help = document.querySelector('section[aria-label="Browser notification permissions"] button');
  help.click(); await settle();
  check(help.getAttribute("aria-expanded") === "true", "settings help remains available after dismissal");
  navigate("bob"); await settle(); trigger().click(); await settle();
  document.body.dataset.result = "PASS";
})().catch(error => { document.body.dataset.result = "FAIL";
  document.body.dataset.error = error.message; });
`;

for (const width of [1280, 375, 320]) {
  test(
    `isolated notice behavior at ${width}px`,
    { timeout: 60000 },
    async () => {
      const directory = await mkdtemp(path.join(tmpdir(), "zedu-414-browser-"));
      const server = createServer(async (req, res) => {
        res.setHeader(
          "Content-Security-Policy",
          "default-src 'none'; script-src 'self'; style-src 'self'; img-src data:; connect-src 'none'"
        );
        const file =
          req.url === "/fixture.js"
            ? "fixture.js"
            : req.url === "/style.css"
              ? "style.css"
              : "index.html";
        res.setHeader(
          "Content-Type",
          file.endsWith(".js")
            ? "text/javascript"
            : file.endsWith(".css")
              ? "text/css"
              : "text/html"
        );
        res.end(await readFile(path.join(directory, file)));
      });
      try {
        await build({
          stdin: { contents: fixture, resolveDir: root, loader: "tsx" },
          bundle: true,
          outfile: path.join(directory, "fixture.js"),
          jsx: "automatic",
          define: { "process.env.NODE_ENV": '"production"' },
          plugins: [
            {
              name: "isolated-context",
              setup(builder) {
                builder.onResolve(
                  { filter: /\/hooks\/(channel-message|people-message)$/ },
                  () => ({ path: "messages", namespace: "message-fixture" })
                );
                builder.onResolve(
                  {
                    filter:
                      /^(\.\/message|\.\/thread|\.\.\/ChannelMessage\/message)$/,
                  },
                  ({ importer }) => {
                    if (
                      /\/(ChannelMessage|people-message|group-message|agent-message)\/index.tsx$/.test(
                        importer
                      )
                    )
                      return { path: "message", namespace: "message-fixture" };
                  }
                );
                builder.onLoad(
                  { filter: /.*/, namespace: "message-fixture" },
                  ({ path }) => ({
                    contents:
                      path === "messages"
                        ? "export default ()=>({fetchMoreData:()=>{},hasMore:true,loading:false});"
                        : 'import {createElement} from "react"; export default ({item})=>createElement("p",{"data-fixture-message":true},item.content);',
                    resolveDir: root,
                  })
                );
                builder.onResolve(
                  {
                    filter:
                      /^(next\/navigation|next\/image|~\/assets\/images|~\/utils\/new-request|~\/components\/layout\/user-avatar|~\/components\/theme\/themed-emoji-picker|~\/components\/gifs\/gif-picker|\.\.\/channel-intro|\.\.\/hover-card\/username|\.\.\/voice\/voice-(recorder|thumbnails)|\.\.\/buzz-management\/(call-button|start-buzz-confirm-modal)|\.\.\/channel-details-dialog|\.\.?\/(channel-nav\/)?menu-dropdown|\.\/view-members-modal|\.\.\/pinned-messages\/pinned-messages-modal)$/,
                  },
                  ({ path }) => ({ path, namespace: "safe-stub" })
                );
                builder.onLoad(
                  { filter: /.*/, namespace: "safe-stub" },
                  ({ path }) => ({
                    contents:
                      path === "next/navigation"
                        ? 'export const useParams=()=>({id:"fixture"}); export const useSearchParams=()=>new URLSearchParams();'
                        : path === "~/utils/new-request"
                          ? 'export const UploadRequest=()=>{throw Error("Network forbidden");}; export const PostRequest=UploadRequest, PutRequest=UploadRequest; export const GetRequest=async()=>({status:200,data:{data:[]}});'
                          : path === "~/assets/images"
                            ? "export default {};"
                            : "export default function Stub({children}){return children || null;} export const VoiceRecorder=Stub, VoiceThumbnails=Stub, ViewMembersModal=Stub;",
                    resolveDir: root,
                  })
                );
                builder.onResolve(
                  { filter: /^~\/store\/GlobalState$/ },
                  () => ({ path: "context", namespace: "fixture" })
                );
                builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
                  contents:
                    'import {createContext} from "react"; export const DataContext=createContext(null);',
                  resolveDir: root,
                }));
              },
            },
          ],
        });
        await writeFile(
          path.join(directory, "index.html"),
          '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>'
        );
        await run(
          path.join(root, "node_modules/.bin/tailwindcss"),
          [
            "-i",
            "src/app/globals.css",
            "-o",
            path.join(directory, "style.css"),
          ],
          { cwd: root }
        );
        await new Promise((resolve, reject) => {
          server.once("error", reject);
          server.listen(0, "127.0.0.1", resolve);
        });
        const screenshot = path.join(tmpdir(), `zedu-414-notice-${width}.png`);
        const { stdout } = await run(
          process.env.CHROME_BIN || "/usr/bin/google-chrome",
          [
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-background-networking",
            "--disable-extensions",
            "--no-first-run",
            "--no-default-browser-check",
            "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1",
            `--user-data-dir=${directory}/profile`,
            `--window-size=${width},900`,
            "--virtual-time-budget=30000",
            "--dump-dom",
            `--screenshot=${screenshot}`,
            `${testProtocol}//${testHost}:${server.address().port}`,
          ],
          { timeout: 45000, maxBuffer: 2_000_000 }
        );
        assert.match(stdout, /data-result="PASS"/, stdout);
        console.log(`Screenshot: ${screenshot}`);
      } finally {
        server.closeAllConnections();
        if (server.listening) {
          await new Promise((resolve) => server.close(resolve));
        }
        await rm(directory, { recursive: true, force: true });
      }
    }
  );
}
