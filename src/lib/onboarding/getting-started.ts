/**
 * "Getting started" checklist for new workspace members.
 *
 * Progress and the dismissed state are saved in this browser (localStorage),
 * per organisation and per user. Saving them to the user's account is a
 * follow-up for the backend.
 */

export type GettingStartedStep = "photo" | "channel_message" | "dm" | "buzz";

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  "photo",
  "channel_message",
  "dm",
  "buzz",
];

export type GettingStartedProgress = {
  dismissed: boolean;
  done: Partial<Record<GettingStartedStep, true>>;
};

export const GETTING_STARTED_CHANGED_EVENT = "zedu:getting-started-changed";

const EMPTY: GettingStartedProgress = { dismissed: false, done: {} };

export function gettingStartedKey(
  orgId: string | null | undefined,
  userId: string | null | undefined
): string | null {
  if (!orgId || !userId) return null;
  return `zedu:getting-started:${orgId}:${userId}`;
}

/** Parse saved progress, ignoring anything malformed or unknown. */
export function parseProgress(raw: string | null): GettingStartedProgress {
  if (!raw) return { ...EMPTY, done: {} };
  try {
    const value = JSON.parse(raw);
    const done: GettingStartedProgress["done"] = {};
    for (const step of GETTING_STARTED_STEPS) {
      if (value?.done?.[step] === true) done[step] = true;
    }
    return { dismissed: value?.dismissed === true, done };
  } catch {
    return { ...EMPTY, done: {} };
  }
}

/** Steps done, counting the photo step as done when the user has a photo. */
export function completedSteps(
  progress: GettingStartedProgress,
  hasPhoto: boolean
): Set<GettingStartedStep> {
  const done = new Set<GettingStartedStep>();
  for (const step of GETTING_STARTED_STEPS) {
    if (progress.done[step] || (step === "photo" && hasPhoto)) done.add(step);
  }
  return done;
}

/** The card shows until it is dismissed or every step is done. */
export function shouldShowChecklist(
  progress: GettingStartedProgress,
  hasPhoto: boolean
): boolean {
  if (progress.dismissed) return false;
  return completedSteps(progress, hasPhoto).size < GETTING_STARTED_STEPS.length;
}

function currentKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const orgId = window.localStorage.getItem("orgId");
    const user = JSON.parse(window.localStorage.getItem("user") || "null");
    return gettingStartedKey(orgId, user?.id ? String(user.id) : null);
  } catch {
    return null;
  }
}

export function readGettingStarted(): GettingStartedProgress {
  const key = currentKey();
  if (!key) return { ...EMPTY, done: {} };
  try {
    return parseProgress(window.localStorage.getItem(key));
  } catch {
    return { ...EMPTY, done: {} };
  }
}

function write(update: (p: GettingStartedProgress) => GettingStartedProgress) {
  const key = currentKey();
  if (!key) return;
  try {
    const next = update(parseProgress(window.localStorage.getItem(key)));
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(GETTING_STARTED_CHANGED_EVENT));
}

/** Record that the user did a step. Safe to call anywhere, any number of times. */
export function markGettingStartedStep(step: GettingStartedStep): void {
  const current = readGettingStarted();
  if (current.done[step]) return;
  write((p) => ({ ...p, done: { ...p.done, [step]: true } }));
}

export function dismissGettingStarted(): void {
  write((p) => ({ ...p, dismissed: true }));
}

/** Which step a sent message counts for, from the page it was sent on. */
export function stepForMessagePath(
  pathname: string | null | undefined
): GettingStartedStep | null {
  if (!pathname) return null;
  if (/\/home\/channels\//.test(pathname)) return "channel_message";
  if (
    /\/dm\//.test(pathname) ||
    /\/home\/people\//.test(pathname) ||
    /\/colleagues\//.test(pathname)
  ) {
    return "dm";
  }
  return null;
}
