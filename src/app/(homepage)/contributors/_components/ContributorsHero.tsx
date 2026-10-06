"use client";

import React from "react";
import Link from "next/link";
import { Users, GitPullRequest, GitCommit, Award, ArrowUpRight, Sparkles, Heart } from "lucide-react";
import { ArrowBtn, OutlineBtn } from "../../_components/ui/Button";

interface ContributorsHeroProps {
  onJoinClick: () => void;
  totalContributors: number;
}

export const ContributorsHero: React.FC<ContributorsHeroProps> = ({
  onJoinClick,
  totalContributors,
}) => {
  return (
    <section className="relative isolate flex w-full flex-col items-center gap-6 overflow-hidden px-4 py-12 text-center sm:gap-8 sm:px-8 sm:py-20 lg:px-12 mt-4">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-[#7141F8]/10 via-blue-50/20 to-transparent blur-2xl"
      />

      {/* Clean unboxed announcement text */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7141F8]">
        <Heart className="h-4 w-4 fill-[#7141F8]/20" />
        <span>Open Source Community</span>
        <span aria-hidden="true">·</span>
        <span>Celebrating the Builders of Zedu</span>
      </div>

      {/* Main Headline */}
      <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl text-center leading-[1.15]">
        The People Behind <span className="text-primary-500">Zedu</span>
      </h1>

      {/* Subheading */}
      <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base md:text-lg">
        Meet the engineers, designers, educators, and community champions shaping
        structured, AI-assisted learning environments for teams and classrooms worldwide.
      </p>

      {/* Action Buttons */}
      <div className="flex w-full max-w-md flex-col justify-center gap-3 sm:flex-row items-center pt-2">
        <button
          onClick={onJoinClick}
          className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-medium text-white transition-all hover:bg-opacity-90 shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          Become a Contributor
        </button>

        <a
          href="https://github.com/timothymayor/zedu-fe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-800 transition-all hover:bg-neutral-50 hover:border-neutral-400"
        >
          View on GitHub
          <ArrowUpRight className="h-4 w-4 text-neutral-500" />
        </a>
      </div>

      {/* Metric Counters Banner */}
      <div className="w-full max-w-5xl mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:grid-cols-4 sm:gap-6">
        <div className="flex flex-col items-center justify-center border-b border-neutral-100 pb-4 sm:border-b-0 sm:border-r sm:pb-0">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <Users className="h-5 w-5" />
            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-neutral-900">
              {totalContributors}+
            </span>
          </div>
          <span className="text-xs font-medium text-neutral-500">Global Contributors</span>
        </div>

        <div className="flex flex-col items-center justify-center border-b border-neutral-100 pb-4 sm:border-b-0 sm:border-r sm:pb-0">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <GitPullRequest className="h-5 w-5" />
            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-neutral-900">
              480+
            </span>
          </div>
          <span className="text-xs font-medium text-neutral-500">PRs Merged</span>
        </div>

        <div className="flex flex-col items-center justify-center border-r-0 sm:border-r pb-4 sm:pb-0">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <GitCommit className="h-5 w-5" />
            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-neutral-900">
              2,100+
            </span>
          </div>
          <span className="text-xs font-medium text-neutral-500">Commits</span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Award className="h-5 w-5" />
            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-neutral-900">
              24
            </span>
          </div>
          <span className="text-xs font-medium text-neutral-500">Countries Represented</span>
        </div>
      </div>
    </section>
  );
};
