"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Github, Twitter, MapPin, GitPullRequest, Award, ExternalLink } from "lucide-react";
import { Contributor } from "../_data/contributorsData";

interface ContributorsGridProps {
  contributors: Contributor[];
  onNominateClick: () => void;
}

type TrackFilter = "all" | "core" | "frontend" | "realtime" | "ai" | "design" | "docs";
type SortOption = "contributions" | "name" | "recent";

const TRACKS: { id: TrackFilter; label: string }[] = [
  { id: "all", label: "All Tracks" },
  { id: "core", label: "Core Maintainers" },
  { id: "frontend", label: "Frontend & UI" },
  { id: "realtime", label: "Buzz & Realtime" },
  { id: "ai", label: "AI & Agents" },
  { id: "design", label: "Design & UX" },
  { id: "docs", label: "Docs & DevRel" },
];

export const ContributorsGrid: React.FC<ContributorsGridProps> = ({
  contributors,
  onNominateClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<TrackFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("contributions");
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);

  const filteredContributors = useMemo(() => {
    return contributors
      .filter((c) => {
        const matchesTrack = selectedTrack === "all" || c.track === selectedTrack;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.github.toLowerCase().includes(query) ||
          c.role.toLowerCase().includes(query) ||
          c.skills.some((s) => s.toLowerCase().includes(query)) ||
          c.location.toLowerCase().includes(query);

        return matchesTrack && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "contributions") {
          return b.contributionsCount - a.contributionsCount;
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [contributors, selectedTrack, searchQuery, sortBy]);

  return (
    <section className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Community Directory
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Explore the developers, designers, and authors driving Zedu forward.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-500">
              Showing <strong className="text-neutral-900 tabular-nums">{filteredContributors.length}</strong> contributors
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          {/* Track Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrack(t.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  selectedTrack === t.id
                    ? "bg-[#7141F8] text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skill, GitHub..."
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30 focus:border-[#7141F8]"
              />
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 w-full sm:w-auto px-3 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30"
            >
              <option value="contributions">Most Contributions</option>
              <option value="recent">Featured First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filteredContributors.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-12 text-center">
            <Search className="h-10 w-10 text-neutral-400 mb-3" />
            <h3 className="text-base font-semibold text-neutral-900">No contributors found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1 mb-4">
              We couldn&apos;t find any contributors matching &quot;{searchQuery}&quot;. Try adjusting your search query or track filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTrack("all");
              }}
              className="text-xs font-semibold text-[#7141F8] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Contributors Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredContributors.map((contributor) => (
            <div
              key={contributor.id}
              className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-[#7141F8]/40 hover:shadow-md"
            >
              {/* Card Header: Avatar & Info */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-100 flex-shrink-0">
                    <Image
                      src={contributor.avatar}
                      alt={contributor.name}
                      width={56}
                      height={56}
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {contributor.socials?.github && (
                      <a
                        href={contributor.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                        title="GitHub Profile"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {contributor.socials?.twitter && (
                      <a
                        href={contributor.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                        title="Twitter / X"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Name & Role */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold text-neutral-900 group-hover:text-[#7141F8] transition-colors">
                      {contributor.name}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-neutral-500">
                    {contributor.role}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-xs leading-relaxed text-neutral-600 line-clamp-2 mb-4">
                  {contributor.bio}
                </p>

                {/* Badges / Focus Area - Clean unboxed text with dots */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-500 mb-4">
                  <span>{contributor.team}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-neutral-600">
                    <MapPin className="h-3 w-3" />
                    {contributor.location}
                  </span>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {contributor.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {contributor.skills.length > 3 && (
                    <span className="rounded-md bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
                      +{contributor.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Metrics & PR */}
              <div className="border-t border-neutral-100 pt-3 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#7141F8] font-semibold">
                    <GitPullRequest className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{contributor.contributionsCount} commits</span>
                  </div>

                  <button
                    onClick={() => setSelectedContributor(contributor)}
                    className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner to Nominate or Join */}
        <div className="mt-12 rounded-2xl border border-[#7141F8]/20 bg-gradient-to-r from-[#7141F8]/5 via-purple-50/50 to-blue-50/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-neutral-900">
              Have you contributed to Zedu?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Whether you opened a PR, improved docs, or reported a critical issue, get your spot on our Wall of Fame.
            </p>
          </div>

          <button
            onClick={onNominateClick}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#7141F8] px-5 py-2.5 text-xs sm:text-sm font-medium text-white transition hover:bg-[#5E32D9] shadow-sm"
          >
            <Award className="h-4 w-4" />
            Claim Contributor Badge
          </button>
        </div>
      </div>

      {/* Contributor Details Modal */}
      {selectedContributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedContributor(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              ✕
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-100 flex-shrink-0">
                <Image
                  src={selectedContributor.avatar}
                  alt={selectedContributor.name}
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {selectedContributor.name}
                </h3>
                <p className="text-xs font-medium text-[#7141F8]">
                  {selectedContributor.role}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{selectedContributor.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedContributor.team}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">About</h4>
                <p className="text-neutral-600 leading-relaxed">
                  {selectedContributor.bio}
                </p>
              </div>

              {selectedContributor.recentPR && (
                <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200/80">
                  <span className="text-[11px] font-semibold text-neutral-500 block mb-1">
                    Featured Contribution
                  </span>
                  <p className="font-mono text-xs text-neutral-800 break-all">
                    {selectedContributor.recentPR}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">Technical Skills & Tooling</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedContributor.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">Recognitions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedContributor.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#7141F8]/10 px-2.5 py-1 text-xs font-medium text-[#7141F8]"
                    >
                      <Award className="h-3 w-3" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                <strong className="text-neutral-900">{selectedContributor.contributionsCount}</strong> verified contributions
              </span>

              {selectedContributor.socials?.github && (
                <a
                  href={selectedContributor.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7141F8] hover:underline"
                >
                  GitHub Profile
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
