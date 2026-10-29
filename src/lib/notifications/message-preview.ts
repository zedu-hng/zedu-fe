/**
 * "Show message previews" for in-app notifications.
 *
 * When previews are off, a notification shows who it is from and what
 * happened ("Sent you a message", "Mentioned you in #general") instead of
 * the message text. The choice is saved on this device.
 */

export const MESSAGE_PREVIEWS_STORAGE_KEY = "zedu:show-message-previews";
export const MESSAGE_PREVIEWS_CHANGED_EVENT = "zedu:message-previews-changed";

type NotificationLike = {
  title?: string | null;
  message?: string | null;
  payload?: Record<string, unknown> | null;
};

export type NotificationSummary = {
  /** Who the notification is from, e.g. "Ada Obi". */
  name: string;
  /** What happened, without the message text, e.g. "Sent you a message". */
  line: string;
};

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const normaliseType = (value: unknown) =>
  (getString(value) || "").toLowerCase().replace(/[\s_-]/g, "");

const formatChannel = (name: string) =>
  name.startsWith("#") ? name : `#${name}`;

/** Short, content-free description of a notification. */
export function summarizeNotification(
  notification: NotificationLike | null | undefined
): NotificationSummary {
  const payload = notification?.payload || {};
  // Use the title as the name only when it looks like a name, not the
  // message itself, so hiding previews never leaks the text.
  const title = getString(notification?.title);
  const titleIsName =
    !!title && title.length <= 40 && title !== getString(notification?.message);
  const name =
    getString(payload.sender_name) || (titleIsName ? title : null) || "Someone";

  const type = normaliseType(payload.notification_type);
  const channelType = normaliseType(payload.channel_type);
  const channelName = getString(payload.channel_name);

  if (type === "mention" || type.includes("mention")) {
    return {
      name,
      line: channelName
        ? `Mentioned you in ${formatChannel(channelName)}`
        : "Mentioned you",
    };
  }

  const isGroupDm = type === "groupdm" || channelType.startsWith("groupdm");
  if (isGroupDm) {
    return { name, line: "Sent a message in a group conversation" };
  }

  if (type === "dm" || channelType === "dm") {
    return { name, line: "Sent you a message" };
  }

  if (type === "channel" || channelName) {
    return {
      name,
      line: channelName
        ? `New message in ${formatChannel(channelName)}`
        : "New channel message",
    };
  }

  return { name, line: "Sent you a notification" };
}

/** Previews are on unless the user turned them off on this device. */
export function getShowMessagePreviews(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(MESSAGE_PREVIEWS_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setShowMessagePreviews(show: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (show) {
      window.localStorage.removeItem(MESSAGE_PREVIEWS_STORAGE_KEY);
    } else {
      window.localStorage.setItem(MESSAGE_PREVIEWS_STORAGE_KEY, "off");
    }
  } catch {
    // Storage can be blocked (private mode); the change then lasts this page only.
  }
  window.dispatchEvent(new Event(MESSAGE_PREVIEWS_CHANGED_EVENT));
}

/** Subscribe to changes from this tab and from other tabs. */
export function subscribeToMessagePreviews(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === MESSAGE_PREVIEWS_STORAGE_KEY) onChange();
  };
  window.addEventListener(MESSAGE_PREVIEWS_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(MESSAGE_PREVIEWS_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
