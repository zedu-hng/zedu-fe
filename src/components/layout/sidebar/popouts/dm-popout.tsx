import { stripHtmlTags } from "~/utils/utils";
import type { DmPreviewItem, PersonPreviewItem } from "./types";
import type { ReactNode } from "react";

const COLORS = ["bg-[#E87932]", "bg-[#279E7A]", "bg-[#8B4ED8]", "bg-[#3979E8]"];

type PreviewRow = {
  key: string | number;
  initial: string;
  avatarClassName: string;
  title: string;
  description: string;
  contentClassName: string;
  trailing?: ReactNode;
};

const renderRows = (rows: PreviewRow[]) => (
  <div className="flex flex-col gap-3">
    {rows.map(
      ({
        key,
        initial,
        avatarClassName,
        title,
        description,
        contentClassName,
        trailing,
      }) => (
        <div key={key} className="flex min-w-0 items-center gap-3">
          <span className={avatarClassName}>{initial}</span>
          <div className={contentClassName}>
            <p className="truncate text-[13px] font-semibold">{title}</p>
            <p className="truncate text-xs text-[#5959A8]">{description}</p>
          </div>
          {trailing}
        </div>
      )
    )}
  </div>
);

const emptyMessage = (message: string) => (
  <p className="text-sm text-[#667085]">{message}</p>
);

export const DmPopout = ({ dms }: { dms: DmPreviewItem[] }) => {
  const rows = dms.slice(0, 4).map((dm, index) => {
    const name =
      dm?.username ||
      dm?.participants?.[0]?.full_name ||
      dm?.participants?.[0]?.username ||
      "Direct message";
    const message =
      dm?.preview_message ||
      dm?.preview_thread?.[0]?.message ||
      "No recent message";

    return {
      key: dm?.channel_id ?? dm?.channels_id ?? `${name}-${index}`,
      initial: name.trim().charAt(0).toUpperCase(),
      avatarClassName: `flex size-9 shrink-0 items-center justify-center rounded-[9px] text-sm font-semibold text-white ${COLORS[index % COLORS.length]}`,
      title: name,
      description: stripHtmlTags(String(message)),
      contentClassName: "min-w-0",
    };
  });

  return dms.length ? renderRows(rows) : emptyMessage("No recent messages");
};

export const PeoplePopout = ({ people }: { people: PersonPreviewItem[] }) => {
  const rows = people.slice(0, 4).map((person, index) => {
    const name =
      person?.name ||
      person?.full_name ||
      person?.username ||
      person?.email ||
      "Organization member";

    return {
      key: person?.id ?? person?.user_id ?? `${name}-${index}`,
      initial: name.trim().charAt(0).toUpperCase(),
      avatarClassName: `flex size-9 shrink-0 items-center justify-center rounded-[9px] text-sm font-semibold text-white ${COLORS[index % COLORS.length]}`,
      title: name,
      description: person?.role || person?.job_title || "Organization member",
      contentClassName: "min-w-0 flex-1",
      trailing: (
        <span className="shrink-0 text-xs text-[#5959A8]">
          {person?.online ? "Active" : "Away"}
        </span>
      ),
    };
  });

  return people.length ? renderRows(rows) : emptyMessage("No people to show");
};
