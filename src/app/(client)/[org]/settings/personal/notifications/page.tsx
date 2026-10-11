"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import SettingsLabel from "../../components/settings-label";
import { GetRequest, PostRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";
import { showError, showSuccess } from "~/components/toast/sonner";
import {
  NotificationTypeSection,
  ScheduleSection,
  DeliveryChannelsSection,
  SaveStatusIndicator,
  ActionBar,
} from "./notification-sections";
import {
  DEFAULTS,
  to12h,
  to24h,
  parseNotifyType,
  type ActiveDays,
  type Preferences,
  type SaveStatus,
} from "./notification-types";

const NotificationPage = () => {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [savedPrefs, setSavedPrefs] = useState<Preferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const hasChanges = useMemo(
    () => JSON.stringify(prefs) !== JSON.stringify(savedPrefs),
    [prefs, savedPrefs]
  );

  useEffect(() => {
    if (hasChanges) setSaveStatus("unsaved");
  }, [hasChanges]);

  const fetchPreferences = useCallback(async () => {
    const orgId = localStorage.getItem("orgId") || "";
    setLoading(true);
    try {
      const res = await GetRequest(
        `/organisations/${orgId}/notification-preference?device_type=web`
      );
      if (res.status === 200 || res.status === 201) {
        const d = res.data.data,
          [from, to] = d.time_range.split(" - ").map(to24h);
        const parsed: Preferences = {
          notificationType: parseNotifyType(d.notify_about),
          timeFrom: from || "09:00",
          timeTo: to || "17:00",
          allDay: d.all_day === false ? "custom" : "all_day",
          activeDays: (d.active_days as ActiveDays) ?? "everyday",
          emailNotifications: Boolean(d.send_mail),
          directMentionEmail: Boolean(d.direct_mention_email),
        };
        setPrefs(parsed);
        setSavedPrefs(parsed);
      }
    } catch {
      showError("Failed to load notification preferences");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleSave = async () => {
    const orgId = localStorage.getItem("orgId") || "";
    setSaving(true);
    setSaveStatus("saving");
    const payload = {
      notify_about:
        prefs.notificationType === "all"
          ? "all_new_messages"
          : prefs.notificationType === "mentions"
            ? "mentions"
            : "nothing",
      send_mail: prefs.emailNotifications,
      time_range:
        prefs.allDay === "all_day"
          ? "12:00 AM - 11:59 PM"
          : `${to12h(prefs.timeFrom)} - ${to12h(prefs.timeTo)}`,
      device_type: "web",
      all_day: prefs.allDay === "all_day",
      active_days: prefs.activeDays,
      direct_mention_email: prefs.directMentionEmail,
    };
    try {
      const res = await PostRequest(
        `/organisations/${orgId}/notification-preference?device_type=web`,
        payload
      );
      if (res.status === 200 || res.status === 201) {
        setSavedPrefs(prefs);
        setSaveStatus("saved");
        showSuccess("Preferences saved");
      } else setSaveStatus("unsaved");
    } catch {
      setSaveStatus("unsaved");
      showError("Failed to save preferences");
    }
    setSaving(false);
  };

  const updatePref = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => setPrefs((prev) => ({ ...prev, [key]: value }));

  if (loading)
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6">
        <Loading />
      </div>
    );

  return (
    <div>
      <SettingsLabel />
      <div className="mx-auto max-w-2xl p-4 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">
              Your Notification Preferences
            </h1>
            <p className="text-sm text-[#667085]">
              Manage when and why you get notified.
            </p>
          </div>
          <SaveStatusIndicator
            saveStatus={saveStatus}
            hasChanges={hasChanges}
          />
        </div>
        <div className="space-y-6">
          <NotificationTypeSection prefs={prefs} updatePref={updatePref} />
          <ScheduleSection prefs={prefs} updatePref={updatePref} />
          <DeliveryChannelsSection prefs={prefs} updatePref={updatePref} />
        </div>
        <ActionBar
          hasChanges={hasChanges}
          saving={saving}
          onRestoreDefaults={() => setPrefs(DEFAULTS)}
          onCancel={() => setPrefs(savedPrefs)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default NotificationPage;
