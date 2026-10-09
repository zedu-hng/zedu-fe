export type SidebarPopoutKey = "dms" | "people";

export type DmPreviewItem = {
  channel_id?: string | number;
  channels_id?: string | number;
  username?: string;
  participants?: {
    full_name?: string;
    username?: string;
  }[];
  preview_message?: string;
  preview_thread?: {
    message?: string;
  }[];
};

export type PersonPreviewItem = {
  id?: string | number;
  user_id?: string | number;
  name?: string;
  full_name?: string;
  username?: string;
  email?: string;
  role?: string;
  job_title?: string;
  online?: boolean;
};
