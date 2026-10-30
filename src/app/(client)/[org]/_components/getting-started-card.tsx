"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import {
  GETTING_STARTED_CHANGED_EVENT,
  GETTING_STARTED_STEPS,
  type GettingStartedProgress,
  type GettingStartedStep,
  completedSteps,
  dismissGettingStarted,
  readGettingStarted,
  shouldShowChecklist,
} from "~/lib/onboarding/getting-started";

type Props = {
  /** Where "Say hello in a channel" goes, usually #general. */
  channelHref?: string | null;
};

const LABELS: Record<GettingStartedStep, { title: string; hint: string }> = {
  photo: {
    title: "Add a profile photo",
    hint: "Help your teammates recognise you.",
  },
  channel_message: {
    title: "Say hello in a channel",
    hint: "Post your first message so the team knows you're here.",
  },
  dm: {
    title: "Send a direct message",
    hint: "Start a one-to-one chat with a teammate.",
  },
  buzz: {
    title: "Join a Buzz call",
    hint: "Hop on a quick voice or video call with your team.",
  },
};

export default function GettingStartedCard({ channelHref }: Props) {
  const { state, dispatch } = useContext(DataContext);
  const { user, orgSlug } = state;
  const [progress, setProgress] = useState<GettingStartedProgress | null>(null);

  useEffect(() => {
    const sync = () => setProgress(readGettingStarted());
    sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key?.startsWith("zedu:getting-started:")) sync();
    };
    window.addEventListener(GETTING_STARTED_CHANGED_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(GETTING_STARTED_CHANGED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [user?.id]);

  const hasPhoto = Boolean(user?.avatar_url);
  if (!progress || !user || !shouldShowChecklist(progress, hasPhoto)) {
    return null;
  }

  const done = completedSteps(progress, hasPhoto);
  const total = GETTING_STARTED_STEPS.length;

  const openProfile = () => {
    dispatch({ type: ACTIONS.PROFILE, payload: user });
    dispatch({ type: ACTIONS.SHOW_USER_PROFILE, payload: true });
  };

  const action = (step: GettingStartedStep) => {
    const className =
      "shrink-0 rounded-md border border-[#D0D5DD] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#344054] hover:bg-[#F9FAFB]";
    switch (step) {
      case "photo":
        return (
          <button type="button" className={className} onClick={openProfile}>
            Add photo
          </button>
        );
      case "channel_message":
        return channelHref ? (
          <Link href={channelHref} className={className}>
            Open channel
          </Link>
        ) : null;
      case "dm":
        return (
          <Link href={`/${orgSlug}/home/people/new-chat`} className={className}>
            New message
          </Link>
        );
      case "buzz":
        return (
          <Link href={`/${orgSlug}/buzz`} className={className}>
            Go to Buzz
          </Link>
        );
    }
  };

  return (
    <section
      aria-labelledby="getting-started-title"
      className="w-full max-w-xl rounded-xl border border-[#E6EAEF] bg-white p-5 text-left shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="getting-started-title"
            className="text-lg font-bold text-[#1D2939]"
          >
            Getting started
          </h2>
          <p className="mt-0.5 text-sm text-[#667085]">
            A few quick steps to settle into your workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissGettingStarted}
          aria-label="Dismiss getting started"
          className="rounded-md p-1 text-[#667085] hover:bg-[#F2F4F7] hover:text-[#344054]"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-[#F2F4F7]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done.size}
          aria-label="Getting started progress"
        >
          <div
            className="h-full rounded-full bg-[#7141F8] transition-all"
            style={{ width: `${(done.size / total) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold text-[#667085]">
          {done.size} of {total} done
        </span>
      </div>

      <ul className="mt-4 divide-y divide-[#F2F4F7]">
        {GETTING_STARTED_STEPS.map((step) => {
          const isDone = done.has(step);
          return (
            <li key={step} className="flex items-center gap-3 py-3">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                  isDone
                    ? "border-[#7141F8] bg-[#7141F8] text-white"
                    : "border-[#D0D5DD] text-transparent"
                }`}
                aria-hidden="true"
              >
                <Check className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isDone ? "text-[#98A2B3] line-through" : "text-[#1D2939]"
                  }`}
                >
                  {LABELS[step].title}
                  <span className="sr-only">
                    {isDone ? " (done)" : " (not done yet)"}
                  </span>
                </p>
                {!isDone && (
                  <p className="text-[13px] text-[#667085]">
                    {LABELS[step].hint}
                  </p>
                )}
              </div>
              {!isDone && action(step)}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
