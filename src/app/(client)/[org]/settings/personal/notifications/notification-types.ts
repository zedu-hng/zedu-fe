export type NotificationType = "all" | "mentions" | "nothing";
export type ActiveDays = "everyday" | "weekdays" | "weekends";
export type AllDayOption = "all_day" | "custom";
export type SaveStatus = "idle" | "saving" | "saved" | "unsaved";
export type Preferences = {
  notificationType: NotificationType;
  timeFrom: string;
  timeTo: string;
  allDay: AllDayOption;
  activeDays: ActiveDays;
  emailNotifications: boolean;
  directMentionEmail: boolean;
};
export type UpdatePref = <K extends keyof Preferences>(
  key: K,
  value: Preferences[K]
) => void;

export const DEFAULTS: Preferences = {
  notificationType: "all",
  timeFrom: "09:00",
  timeTo: "17:00",
  allDay: "all_day",
  activeDays: "everyday",
  emailNotifications: true,
  directMentionEmail: false,
};

export const parseNotifyType = (s: string): NotificationType =>
  s === "all_new_messages" ? "all" : s === "mentions" ? "mentions" : "nothing";

export const to24h = (t: string) => {
  const p = t.trim().split(" ");
  if (p.length < 2) return t;
  let [h, m] = p[0].split(":").map(Number);
  if (p[1] === "PM" && h !== 12) h += 12;
  if (p[1] === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const to12h = (t: string) => {
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${String(hr % 12 === 0 ? 12 : hr % 12).padStart(2, "0")}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};
