"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import { GetRequest, PostRequest } from "~/utils/new-request";

export const POLLS_FEATURE_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_POLLS === "true";

export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;
export const MAX_POLL_QUESTION_LENGTH = 300;
export const MAX_POLL_OPTION_LENGTH = 200;

export interface PollResult {
  poll_id: string;
  thread_id: string;
  channels_id: string;
  question: string;
  created_by: string;
  created_at: string;
  total_voters: number;
  has_voted: boolean;
  options: {
    option_id: string;
    text: string;
    position: number;
    vote_count: number;
    voted_by_user: boolean;
  }[];
}

type PollsByThread = Record<string, PollResult>;

const EMPTY: PollsByThread = {};
const pollsStore = new Map<string, PollsByThread>();
const listeners = new Set<() => void>();

const setChannelPolls = (channelId: string, polls: PollsByThread) => {
  pollsStore.set(channelId, polls);
  listeners.forEach((listener) => listener());
};

const applyPoll = (channelId: string, poll: PollResult | null) => {
  if (!poll?.thread_id) return null;

  setChannelPolls(channelId, {
    ...pollsStore.get(channelId),
    [poll.thread_id]: poll,
  });

  return poll;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const readPoll = (res: any, status: number) =>
  res?.status === status ? (res?.data?.data?.poll as PollResult | null) : null;

export const useChannelPolls = () => {
  const channelId = String(useParams()?.id || "");
  const pollsByThread = useSyncExternalStore(
    subscribe,
    () => pollsStore.get(channelId) ?? EMPTY,
    () => EMPTY
  );

  useEffect(() => {
    if (!POLLS_FEATURE_ENABLED || !channelId) return;

    GetRequest(`/polls/channels/${channelId}`).then((res) => {
      if (res?.status !== 200) return;
      const polls = res?.data?.data?.polls;
      setChannelPolls(
        channelId,
        Array.isArray(polls)
          ? polls.reduce<PollsByThread>((acc, poll) => {
              if (poll?.thread_id) acc[poll.thread_id] = poll;
              return acc;
            }, {})
          : {}
      );
    });
  }, [channelId]);

  const createPoll = useCallback(
    async ({
      threadId,
      question,
      options,
    }: {
      threadId: string;
      question: string;
      options: string[];
    }) => {
      const res = await PostRequest(`/polls/channels/${channelId}`, {
        thread_id: threadId,
        question,
        options,
      });

      return applyPoll(channelId, readPoll(res, 201));
    },
    [channelId]
  );

  const votePoll = useCallback(
    async (pollId: string, optionId: string) => {
      const res = await PostRequest(`/polls/vote/${pollId}`, {
        option_id: optionId,
      });

      applyPoll(channelId, readPoll(res, 200));
    },
    [channelId]
  );

  return { pollsByThread, createPoll, votePoll };
};
