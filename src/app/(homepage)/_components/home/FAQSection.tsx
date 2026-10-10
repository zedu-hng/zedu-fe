"use client";

import { useState } from "react";
import { homeFAQs, type HomeFAQ } from "../../_lib/faqData";
import { Accordion } from "~/components/ui/accordion";
import { FAQAccordionItem } from "./faq/FAQAccordionItem";
import { cn } from "~/lib/utils";

type FAQSectionProps = {
  faqs?: HomeFAQ[];
  headingLevel?: "h1" | "h2";
  className?: string;
};

export const FAQSection = ({
  faqs = homeFAQs,
  headingLevel = "h1",
  className,
}: FAQSectionProps) => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const Heading = headingLevel;

  const handleToggle = (value: string) => {
    setOpenItem(value || null);
  };

  return (
    <section
      className={cn(
        "relative isolate flex w-full flex-col items-center gap-10 overflow-hidden px-4 py-12 text-center sm:px-8 sm:py-16 lg:px-12",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Heading className="text-center text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
          Got a Question?{" "}
          <span className="text-primary-500">We Have an Answer</span>
        </Heading>
        <p className="text-sm text-neutral-600 sm:text-base">
          Need clarity? We have clear, practical answers to help you move
          forward with confidence.
        </p>
      </div>
      <div className="w-full max-w-4xl text-left">
        <Accordion
          type="single"
          collapsible
          value={openItem || ""}
          onValueChange={handleToggle}
          className="space-y-4"
        >
          {faqs.map((faq) => (
            <FAQAccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openItem === faq.id}
            />
          ))}
        </Accordion>
      </div>
    </section>
  );
};
