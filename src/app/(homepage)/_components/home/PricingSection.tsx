"use client";

import { useEffect, useState } from "react";
import { pricingCardsByCycle } from "../../_lib/pricingData";
import { PricingCard } from "../ui/PricingCard";
import Link from "next/link";
import { PurpleArrowRight } from "../svgs";
import { SlackZeduCalculator } from "../pricing/SlackZeduCalculator";

type PricingSectionProps = {
  showSubtitle?: boolean;
};

export const PricingSection = ({
  showSubtitle = false,
}: PricingSectionProps) => {
  const [billingCycle] = useState<"monthly" | "yearly">("yearly");
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const plans = pricingCardsByCycle[billingCycle];

  // Listen for the custom event dispatched by the "Calculate Your Savings" button
  useEffect(() => {
    const handler = () => setCalculatorOpen(true);
    window.addEventListener("open-zedu-calculator", handler);
    return () => window.removeEventListener("open-zedu-calculator", handler);
  }, []);

  return (
    <>
      <section className="relative isolate flex w-full flex-col items-center gap-6 overflow-hidden px-4 py-12 text-center sm:gap-6 sm:px-8 sm:py-16  lg:gap-8 lg:px-12">
        <div
          className={`flex flex-col items-center ${
            showSubtitle ? "gap-6" : "gap-3"
          }`}
        >
          <h1 className=" text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl text-center">
            Simple, Flexible Pricing for Education
          </h1>
          {showSubtitle ? (
            <p className="max-w-3xl text-sm text-neutral-700 sm:text-base">
              Flexible plans for educators, bootcamps, and institutions building
              structured learning environments with collaboration and AI
              support.
            </p>
          ) : null}

          {/* <div className="inline-flex items-center rounded-full bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              aria-pressed={billingCycle === "monthly"}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                billingCycle === "monthly"
                  ? "bg-white text-neutral-900"
                  : "text-neutral-600"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              aria-pressed={billingCycle === "yearly"}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                billingCycle === "yearly"
                  ? "bg-white text-neutral-900"
                  : "text-neutral-600"
              }`}
            >
              <span>Yearly</span>
              <span className="ml-1 text-xs text-primary-500">SAVE 16.6%</span>
            </button>
          </div> */}
        </div>

        {/* cards */}
        <div className="grid w-full max-w-7xl grid-cols-1 mt-6 place-items-center gap-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <PricingCard
              key={plan.key}
              title={plan.title}
              description={plan.description}
              amount={plan.amount}
              periodLabel={plan.periodLabel}
              footnote={plan.footnote}
              features={plan.features}
              ctaText={plan.ctaText}
              ctaHref={plan.ctaHref}
              ctaVariant={plan.ctaVariant}
              variant={plan.variant}
              badgeText={plan.badgeText}
            />
          ))}
        </div>

        <h1 className="text-xs sm:text-sm md:text-md font-medium text-neutral-700 ">
          Launching a bootcamp? Let&apos;s build a pricing model that fits your
          cohort size.
        </h1>

        {/* Existing "Compare different plans" link — behaviour unchanged */}
        <Link
          href={"client/settings/organisation/billing/all-plans"}
          className="group flex items-center gap-2 font-semibold text-primary-500"
        >
          Compare different plans
          <span className="inline-flex transition-transform duration-300 ease-out group-hover:translate-x-1">
            <PurpleArrowRight />
          </span>
        </Link>

        {/* New CTA: open Slack vs. Zedu comparison calculator */}
        <button
          type="button"
          onClick={() => setCalculatorOpen(true)}
          className="group flex items-center -mt-4 gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-400 transition-colors duration-150 focus:outline-none focus-visible:underline"
          aria-haspopup="dialog"
        >
          Compare Zedu with other platform
          <span className="inline-flex transition-transform duration-300 ease-out group-hover:translate-x-1">
            <PurpleArrowRight />
          </span>
        </button>
      </section>

      {/* Calculator modal — rendered outside the section so it can use a portal-like overlay */}
      <SlackZeduCalculator
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </>
  );
};
