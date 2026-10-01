// Feature flags gate new routes and large features so we can merge them dark and
// turn them on deliberately. Flags are build-time: Next.js inlines NEXT_PUBLIC_*
// only when it is referenced statically, so every flag needs its own literal
// process.env entry in FEATURE_FLAGS below.
//
// To add a flag:
//   1. add NEXT_PUBLIC_FF_<NAME>=false to .env.example and to each environment;
//   2. register it in FEATURE_FLAGS with its literal env reference;
//   3. read it with isFeatureEnabled() (server or client) or useFeatureFlag()
//      inside a client component.
//
// Everything defaults to OFF: a flag is enabled only when its value is exactly
// "true".

export const FEATURE_FLAGS: Record<string, string | undefined> = {
  // TYPING_INDICATOR: process.env.NEXT_PUBLIC_FF_TYPING_INDICATOR,
};

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  if (!(flag in FEATURE_FLAGS)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[feature-flags] "${flag}" is not registered in FEATURE_FLAGS`
      );
    }
    return false;
  }

  return FEATURE_FLAGS[flag] === "true";
}

// Client components read flags through this hook so call sites stay consistent
// if the source ever moves (for example, to a remote config provider).
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return isFeatureEnabled(flag);
}
