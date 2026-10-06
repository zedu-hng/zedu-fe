"use client";

import React from "react";
import { Code2, Bot, Palette, BookOpen, Sparkles, Radio, ArrowRight } from "lucide-react";
import { CONTRIBUTION_TRACKS, ContributionTrack } from "../_data/contributorsData";

interface ContributionTracksProps {
  onTrackSelect: (track: ContributionTrack) => void;
}

const ICONS_MAP = {
  Code2,
  Bot,
  Palette,
  BookOpen,
  Sparkles,
  Radio,
};

export const ContributionTracks: React.FC<ContributionTracksProps> = ({ onTrackSelect }) => {
  return (
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12 bg-neutral-50/70 border-y border-neutral-200/80">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
            Open Contribution Tracks
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            Zedu is built on a modern stack with diverse tracks suited for every level of experience. Pick your track and start building.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTRIBUTION_TRACKS.map((track) => {
            const IconComponent = ICONS_MAP[track.iconName] || Code2;

            return (
              <div
                key={track.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:border-primary-500/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500">
                      <IconComponent className="h-6 w-6" />
                    </div>

                    <span className="text-xs font-medium text-neutral-500">
                      {track.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {track.title}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 mb-4">
                    {track.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                      Core Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {track.skillsNeeded.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">
                    <strong className="text-primary-500">{track.openTasksCount}</strong> open tickets
                  </span>

                  <button
                    onClick={() => onTrackSelect(track)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 transition"
                  >
                    <span>Get Involved</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
