"use client";

import { useState } from "react";
import { Crown, Github, Mail, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { Contributor, Team } from "../team";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const TeamLeadBadge = () => (
  <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
    <Crown className="h-3 w-3" />
    Team Lead
  </span>
);

const GithubLink = ({ username }: { username: string }) => (
  <a
    href={`https://github.com/${username}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-slate-900"
  >
    <Github className="h-4 w-4 shrink-0" />
    <span className="font-mono text-xs">@{username}</span>
  </a>
);

const ContributorCard = ({
  contributor,
  index,
}: {
  contributor: Contributor;
  index: number;
}) => (
  <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-slate-400">{index + 1}</span>
      <Avatar className="h-11 w-11">
        <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white">
          {getInitials(contributor.fullName)}
        </AvatarFallback>
      </Avatar>
    </div>
    <div className="min-w-0 flex-1 space-y-2">
      <div>
        <p className="font-semibold text-slate-900">{contributor.fullName}</p>
        {contributor.role === "Team Lead" && <TeamLeadBadge />}
      </div>
      {contributor.primary && (
        <p className="text-sm text-slate-600">{contributor.primary}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {contributor.zeduUsername && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
              @{contributor.zeduUsername}
            </code>
          </span>
        )}
        {contributor.githubUsername && (
          <GithubLink username={contributor.githubUsername} />
        )}
        <a
          href={`mailto:${contributor.githubEmail}`}
          className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-slate-900"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="break-all text-xs">{contributor.githubEmail}</span>
        </a>
      </div>
    </div>
  </div>
);

export const TeamMembers = ({ team }: { team: Team }) => {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? team.contributors.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.githubUsername?.toLowerCase().includes(q)
        );
      })
    : team.contributors;

  return (
    <section className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Team members
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 sm:hidden">
            {filtered.length} {filtered.length === 1 ? "member" : "members"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-56 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name or GitHub…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 sm:inline">
            {filtered.length} {filtered.length === 1 ? "member" : "members"}
          </span>
        </div>
      </div>

      {/* Mobile: card layout */}
      <div className="flex flex-col gap-3 p-4 md:hidden">
        {filtered.length > 0 ? (
          filtered.map((contributor, index) => (
            <ContributorCard
              key={contributor.githubEmail}
              contributor={contributor}
              index={index}
            />
          ))
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">
            No members match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 px-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
                #
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Zedu username
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Primary role
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                GitHub
              </TableHead>
              <TableHead className="px-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
                GitHub email
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((contributor, index) => (
                <TableRow key={contributor.githubEmail}>
                  <TableCell className="px-6 text-slate-400">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white">
                          {getInitials(contributor.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {contributor.fullName}
                        </span>
                        {contributor.role === "Team Lead" && <TeamLeadBadge />}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contributor.zeduUsername ? (
                      <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                        @{contributor.zeduUsername}
                      </code>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {contributor.primary ? (
                      <span className="text-sm text-slate-700">
                        {contributor.primary}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {contributor.githubUsername ? (
                      <GithubLink username={contributor.githubUsername} />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6">
                    <a
                      href={`mailto:${contributor.githubEmail}`}
                      className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-slate-900"
                    >
                      <Github className="h-4 w-4 shrink-0" />
                      <span className="break-all text-xs">
                        {contributor.githubEmail}
                      </span>
                    </a>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-slate-400"
                >
                  No members match &ldquo;{query}&rdquo;
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableCaption className="mb-4">
            Team {team.name} · Zedu contributors
          </TableCaption>
        </Table>
      </div>
    </section>
  );
};
