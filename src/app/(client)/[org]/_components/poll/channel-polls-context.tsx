"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { GetRequest, PostRequest } from "~/utils/new-request";

export const POLLS_FEATURE_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_POLLS === "true";

export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;
export const MAX_POLL_QUESTION_LENGTH = 300;
export const MAX_POLL_OPTION_LENGTH = 200;

export interface PollOptionResult {
  option_id: string;
  text: string;
  position: number;
  vote_count: number;
  voted_by_user: boolean;
}

export interface PollResult {
  poll_id: string;
  thread_id: string;
  channels_id: string;
  question: string;
  created_by: string;
  created_at: string;
  total_voters: number;
  has_voted: boolean;
  options: PollOptionResult[];
}

interface ChannelPollsValue {
  pollsByThread: Record<string, PollResult>;
  loading: boolean;
  createPoll: (input: {
    threadId: string;
    question: string;
    options: string[];
  }) => Promise<PollResult | null>;
  votePoll: (pollId: string, optionId: string) => Promise<void>;
}

const ChannelPollsContext = createContext<ChannelPollsValue | null>(null);

const readPolls = (res: any): PollResult[] => {
  if (res?.status !== 200) return [];
  const polls = res?.data?.data?.polls;
  return Array.isArray(polls) ? polls : [];
};

const readPoll = (res: any, status: number): PollResult | null => {
  if (res?.status !== status) return null;
  const poll = res?.data?.data?.poll;
  return poll && typeof poll === "object" ? (poll as PollResult) : null;
};

const indexByThread = (polls: PollResult[]) =>
  polls.reduce<Record<string, PollResult>>((acc, poll) => {
    if (poll?.thread_id) acc[poll.thread_id] = poll;
    return acc;
  }, {});

export const ChannelPollsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const params = useParams();
  const channelId = String(params?.id || "");

  const [pollsByThread, setPollsByThread] = useState<
    Record<string, PollResult>
  >({});
  const [loading, setLoading] = useState(false);

  const upsertPoll = useCallback((poll: PollResult | null) => {
    if (!poll?.thread_id) return;
    setPollsByThread((prev) => ({ ...prev, [poll.thread_id]: poll }));
  }, []);

  useEffect(() => {
    if (!POLLS_FEATURE_ENABLED || !channelId) {
      setPollsByThread({});
      return;
    }

    let cancelled = false;
    setLoading(true);

    GetRequest(`/polls/channels/${channelId}`).then((res) => {
      if (cancelled) return;
      setPollsByThread(indexByThread(readPolls(res)));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  const createPoll = useCallback<ChannelPollsValue["createPoll"]>(
    async ({ threadId, question, options }) => {
      const res = await PostRequest(`/polls/channels/${channelId}`, {
        thread_id: threadId,
        question,
        options,
      });

      const poll = readPoll(res, 201);
      upsertPoll(poll);

      return poll;
    },
    [channelId, upsertPoll]
  );

  const votePoll = useCallback<ChannelPollsValue["votePoll"]>(
    async (pollId, optionId) => {
      const res = await PostRequest(`/polls/vote/${pollId}`, {
        option_id: optionId,
      });

      upsertPoll(readPoll(res, 200));
    },
    [upsertPoll]
  );

  const value = useMemo<ChannelPollsValue>(
    () => ({ pollsByThread, loading, createPoll, votePoll }),
    [pollsByThread, loading, createPoll, votePoll]
  );

  return (
    <ChannelPollsContext.Provider value={value}>
      {children}
    </ChannelPollsContext.Provider>
  );
};

export const useChannelPolls = () => {
  const context = useContext(ChannelPollsContext);

  if (!context) {
    return {
      pollsByThread: {} as Record<string, PollResult>,
      loading: false,
      createPoll: async () => null,
      votePoll: async () => {},
    };
  }

  return context;
};
