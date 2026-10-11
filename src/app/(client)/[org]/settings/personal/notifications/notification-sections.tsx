import React from "react";
import { Bell, BellRing, BellOff, Clock, Check, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Checkbox } from "~/components/ui/checkbox";
import Loading from "~/components/ui/loading";
import { cn } from "~/lib/utils";
import type {
  NotificationType,
  ActiveDays,
  AllDayOption,
  Preferences,
  UpdatePref,
  SaveStatus,
} from "./notification-types";

const NOTIF = [
  {
    id: "all" as NotificationType,
    label: "All",
    desc: "Get notified for every new message",
    icon: Bell,
  },
  {
    id: "mentions" as NotificationType,
    label: "Mentions",
    desc: "Only when someone mentions you",
    icon: BellRing,
  },
  {
    id: "nothing" as NotificationType,
    label: "Nothing",
    desc: "Turn off all notifications",
    icon: BellOff,
  },
];

const DAYS = [
  { id: "everyday" as ActiveDays, label: "Everyday" },
  { id: "weekdays" as ActiveDays, label: "Weekdays" },
  { id: "weekends" as ActiveDays, label: "Weekends" },
];

export const NotificationTypeSection = ({
  prefs,
  updatePref,
}: {
  prefs: Preferences;
  updatePref: UpdatePref;
}) => (
  <section className="rounded-xl border border-[#E6EAEF] p-5">
    <h2 className="mb-1 text-sm font-semibold">Send notifications for</h2>
    <p className="mb-4 text-xs text-[#667085]">
      Choose what types of notifications you want to receive.
    </p>
    <div className="grid gap-3 sm:grid-cols-3">
      {NOTIF.map((o) => {
        const I = o.icon,
          s = prefs.notificationType === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={s}
            onClick={() => updatePref("notificationType", o.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
              s
                ? "border-primary-500 bg-primary-50"
                : "border-[#E6EAEF] hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                s ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              <I className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{o.label}</span>
            <span className="text-xs text-[#667085]">{o.desc}</span>
          </button>
        );
      })}
    </div>
  </section>
);

export const ScheduleSection = ({
  prefs,
  updatePref,
}: {
  prefs: Preferences;
  updatePref: UpdatePref;
}) => (
  <section className="rounded-xl border border-[#E6EAEF] p-5">
    <div className="mb-4 flex items-center gap-2">
      <Clock className="h-4 w-4 text-[#667085]" />
      <h2 className="text-sm font-semibold">Schedule & Notification Window</h2>
    </div>
    <p className="mb-4 text-xs text-[#667085]">
      Set when you want to receive notifications. Outside this window,
      notifications are paused.
    </p>
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-medium text-[#344054]">
        Time window
      </label>
      <div className="flex items-center gap-3">
        <Select
          value={prefs.allDay}
          onValueChange={(v) => updatePref("allDay", v as AllDayOption)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_day">All day</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {prefs.allDay === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="time"
              aria-label="Start time"
              value={prefs.timeFrom}
              onChange={(e) => updatePref("timeFrom", e.target.value)}
              className="rounded-md border border-[#E6EAEF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-[#667085]">to</span>
            <input
              type="time"
              aria-label="End time"
              value={prefs.timeTo}
              onChange={(e) => updatePref("timeTo", e.target.value)}
              className="rounded-md border border-[#E6EAEF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
      </div>
    </div>
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#344054]">
        Active days
      </label>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((o) => {
          const s = prefs.activeDays === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={s}
              onClick={() => updatePref("activeDays", o.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                s
                  ? "bg-primary-500 text-white"
                  : "border border-[#E6EAEF] text-[#344054] hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

export const DeliveryChannelsSection = ({
  prefs,
  updatePref,
}: {
  prefs: Preferences;
  updatePref: UpdatePref;
}) => (
  <section className="rounded-xl border border-[#E6EAEF] p-5">
    <h2 className="mb-1 text-sm font-semibold">Delivery channels</h2>
    <p className="mb-4 text-xs text-[#667085]">
      Choose how you want to be notified.
    </p>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Email notifications</p>
          <p className="text-xs text-[#667085]">
            Receive notifications via email
          </p>
        </div>
        <Switch
          checked={prefs.emailNotifications}
          onCheckedChange={(c) => updatePref("emailNotifications", c)}
        />
      </div>
      {prefs.emailNotifications && (
        <div className="flex items-center gap-2 pl-6">
          <Checkbox
            id="direct-mention-email"
            checked={prefs.directMentionEmail}
            onCheckedChange={(c) =>
              updatePref("directMentionEmail", c === true)
            }
          />
          <label
            htmlFor="direct-mention-email"
            className="cursor-pointer text-sm text-[#344054]"
          >
            Only send email for direct mentions
          </label>
        </div>
      )}
    </div>
  </section>
);

export const SaveStatusIndicator = ({
  saveStatus,
  hasChanges,
}: {
  saveStatus: SaveStatus;
  hasChanges: boolean;
}) => (
  <div className="flex items-center gap-1.5 text-xs">
    {saveStatus === "saving" ? (
      <span className="flex items-center gap-1 text-[#667085]">
        <Loading width="14" height="14" />
        Saving…
      </span>
    ) : saveStatus === "saved" && !hasChanges ? (
      <span className="flex items-center gap-1 text-green-600">
        <Check className="h-3.5 w-3.5" />
        All changes saved
      </span>
    ) : hasChanges ? (
      <span className="flex items-center gap-1 text-amber-600">
        Unsaved changes
      </span>
    ) : null}
  </div>
);

export const ActionBar = ({
  hasChanges,
  saving,
  onRestoreDefaults,
  onCancel,
  onSave,
}: {
  hasChanges: boolean;
  saving: boolean;
  onRestoreDefaults: () => void;
  onCancel: () => void;
  onSave: () => void;
}) => (
  <div className="mt-6 flex items-center justify-between border-t border-[#E6EAEF] pt-4">
    <button
      type="button"
      onClick={onRestoreDefaults}
      className="flex items-center gap-1.5 text-sm text-[#667085] transition-colors hover:text-primary-500"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Restore defaults
    </button>
    <div className="flex gap-3">
      {hasChanges && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={saving || !hasChanges}
        className={cn(
          "rounded-md px-5 py-2 text-sm font-medium text-white transition-colors",
          hasChanges && !saving
            ? "bg-primary-500 hover:bg-primary-400"
            : "cursor-not-allowed bg-gray-300"
        )}
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Loading width="16" height="16" />
            Saving…
          </span>
        ) : (
          "Save changes"
        )}
      </button>
    </div>
  </div>
);
