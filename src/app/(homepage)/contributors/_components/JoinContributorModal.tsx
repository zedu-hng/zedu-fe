"use client";

import React, { useState } from "react";
import { CheckCircle2, Sparkles, Send, Loader2 } from "lucide-react";
import { showSuccess } from "~/components/toast/sonner";

interface JoinContributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrack?: string;
  onAddContributor?: (contributorData: any) => void;
}

export const JoinContributorModal: React.FC<JoinContributorModalProps> = ({
  isOpen,
  onClose,
  defaultTrack = "frontend",
  onAddContributor,
}) => {
  const [name, setName] = useState("");
  const [github, setGithub] = useState("");
  const [email, setEmail] = useState("");
  const [track, setTrack] = useState(defaultTrack);
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !github.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const cleanGithub = github.replace(/^@/, "").trim();

      const newContributor = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        github: cleanGithub,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanGithub || name)}`,
        role: "Community Contributor",
        team: track === "frontend" ? "Frontend & UI" : track === "ai" ? "AI & Agents" : track === "realtime" ? "Buzz & RTC" : "Community & Docs",
        track: track as any,
        contributionsCount: 1,
        bio: bio.trim() || "Passionate software engineer and contributor to open source education tools.",
        skills: skillsArray.length > 0 ? skillsArray : ["Next.js", "TypeScript", "Tailwind CSS"],
        badges: ["New Contributor", "Community Member"],
        location: location.trim() || "Global",
        socials: {
          github: `https://github.com/${cleanGithub}`,
        },
      };

      if (onAddContributor) {
        onAddContributor(newContributor);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      showSuccess("Welcome to the Zedu Contributor Community!");
    }, 800);
  };

  const handleResetAndClose = () => {
    setName("");
    setGithub("");
    setEmail("");
    setSkills("");
    setBio("");
    setLocation("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-200">
        <button
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold text-neutral-900">
              You&apos;re on the Contributor Board!
            </h3>

            <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
              Thank you for stepping forward to build Zedu. Your profile has been added to our active community wall. Check out our open tickets on GitHub to submit your first PR!
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://github.com/timothymayor/zedu-fe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#7141F8] px-5 text-xs font-semibold text-white transition hover:bg-[#5E32D9]"
              >
                Browse Open Issues
              </a>
              <button
                onClick={handleResetAndClose}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Back to Directory
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-primary-500 mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Join the Team
              </span>
            </div>

            <h3 className="text-xl font-bold text-neutral-900">
              Join the Zedu Contributor Community
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-6">
              Connect with fellow builders, claim open issues, and get recognized on the wall of contributors.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    GitHub Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="e.g. jordan-codes"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, US"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Primary Track of Interest
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30"
                >
                  <option value="frontend">Frontend Engineering & UI</option>
                  <option value="ai">AI Coworkers & Agent Logic</option>
                  <option value="realtime">Buzz RTC Video/Audio & Centrifugo</option>
                  <option value="design">Design Systems & Accessibility</option>
                  <option value="docs">Documentation & Tutorials</option>
                  <option value="core">CI/CD, Testing & Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Skills & Tools (comma-separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Next.js, TypeScript, WebRTC, Tailwind"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Short Bio / What you want to build
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about yourself..."
                  className="w-full p-3 rounded-lg border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7141F8]/30 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7141F8] px-5 py-2 text-xs font-medium text-white transition hover:bg-[#5E32D9] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Submit & Join
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
