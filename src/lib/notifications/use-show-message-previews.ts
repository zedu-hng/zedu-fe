"use client";

import { useSyncExternalStore } from "react";
import {
  getShowMessagePreviews,
  subscribeToMessagePreviews,
} from "./message-preview";

/** True when notifications may show message text (the default). */
export function useShowMessagePreviews(): boolean {
  return useSyncExternalStore(
    subscribeToMessagePreviews,
    getShowMessagePreviews,
    () => true
  );
}
