"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, ShieldAlert } from "lucide-react";
import { ROADMAP_STEPS } from "../_data/contributorsData";

export const ContributionRoadmap: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
            How to Contribute in 4 Steps
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            We follow strict software engineering practices with automated linting, typing, and Conventional Commits to keep our codebase pristine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ROADMAP_STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-xs relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7141F8]/10 text-xs font-bold text-[#7141F8]">
                  {step.step}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
                  {step.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Code Snippet Box */}
              <div className="mt-auto relative rounded-xl bg-neutral-950 p-4 font-mono text-xs text-neutral-200">
                <button
                  onClick={() => copyCode(step.code, idx)}
                  className="absolute right-3 top-3 rounded-md bg-neutral-800/80 p-1.5 text-neutral-400 hover:text-white transition"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>

                <div className="flex items-center gap-1.5 text-neutral-500 mb-2 border-b border-neutral-800 pb-2">
                  <Terminal className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Terminal</span>
                </div>

                <pre className="overflow-x-auto text-[11px] leading-relaxed text-neutral-300">
                  <code>{step.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Community Guidelines Notice */}
        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>Important Contributor Note:</strong> All PRs must target the <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-950 font-mono text-xs">dev</code> branch from your fork. Never commit <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-950 font-mono text-xs">.env</code> files or real API keys. Husky and CI will automatically verify formatting, types, and commit standards.
          </div>
        </div>
      </div>
    </section>
  );
};
