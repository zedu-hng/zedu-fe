import { getSharedCentrifuge } from "~/lib/centrifugo/shared-centrifuge";

/** Reconnect the shared Centrifugo client if it dropped while the tab slept. */
export function ensureCentrifugeConnected(force = false): void {
  if (typeof window === "undefined") return;

  try {
    const client = getSharedCentrifuge();
    const state = client.state;
    if (force) {
      if (state !== "connected") {
        client.connect();
      }
    } else if (state !== "connected" && state !== "connecting") {
      client.connect();
    }
  } catch {
    // Token / env may not be ready yet — ignore
  }
}
