"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { cn } from "~/lib/utils";
import { useChannelPolls, type PollResult } from "./channel-polls-context";

const PollCard = ({ poll }: { poll: PollResult }) => {
  const { votePoll } = useChannelPolls();
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);

  const totalVotes = poll.options.reduce((sum, o) => sum + o.vote_count, 0);

  const handleVote = async (optionId: string) => {
    if (pendingOptionId) return;

    setPendingOptionId(optionId);
    await votePoll(poll.poll_id, optionId);
    setPendingOptionId(null);
  };

  return (
    <div className="mt-2 w-full max-w-md rounded-lg border border-[#E6EAEF] bg-white p-3">
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage =
            totalVotes > 0
              ? Math.round((option.vote_count / totalVotes) * 100)
              : 0;

          return (
            <button
              key={option.option_id}
              type="button"
              disabled={pendingOptionId !== null}
              onClick={() => handleVote(option.option_id)}
              className={cn(
                "relative block w-full overflow-hidden rounded-md border px-3 py-2 text-left transition-colors",
                option.voted_by_user
                  ? "border-[#0A5CFF] bg-[#F5F9FF]"
                  : "border-[#E6EAEF] hover:bg-[#F8FAFC]",
                pendingOptionId !== null && "cursor-not-allowed opacity-70"
              )}
            >
              <span
                className="absolute inset-y-0 left-0 bg-[#E8F0FE]"
                style={{ width: `${percentage}%` }}
                aria-hidden="true"
              />

              <span className="relative flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  {option.voted_by_user && (
                    <Check size={14} className="shrink-0 text-[#0A5CFF]" />
                  )}
                  <span className="truncate text-sm text-[#1D1D1D]">
                    {option.text}
                  </span>
                </span>

                <span className="shrink-0 text-xs tabular-nums text-[#606060]">
                  {option.vote_count} ({percentage}%)
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-[#606060]">
        {poll.total_voters} {poll.total_voters === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
};

export default PollCard;
