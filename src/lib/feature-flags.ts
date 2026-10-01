// Next.js only inlines NEXT_PUBLIC_* values accessed statically, so each flag
// is read by its full name here rather than through a dynamic lookup.
const flags = {
  zeduOspreyContributors: process.env.NEXT_PUBLIC_FF_ZEDU_OSPREY_CONTRIBUTORS,
} as const;

export type FeatureFlag = keyof typeof flags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flags[flag]?.toLowerCase() === "on" || flags[flag] === "true";
}
