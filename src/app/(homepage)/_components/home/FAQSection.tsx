"use client";

import { useEffect, useState } from "react";
import { homeFAQs, type HomeFAQ } from "../../_lib/faqData";
import { Accordion } from "~/components/ui/accordion";
import { FAQAccordionItem } from "./faq/FAQAccordionItem";

type FAQSectionProps = {
  faqs?: HomeFAQ[];
  answerFragments?: Record<string, string>;
};

export const FAQSection = ({
  faqs = homeFAQs,
  answerFragments,
}: FAQSectionProps) => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  useEffect(() => {
    if (!answerFragments) return;

    let scrollFrame: number | undefined;

    const openLinkedAnswer = () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);

      let fragment: string;
      try {
        fragment = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }

      const faq = faqs.find(
        (item) => answerFragments[item.id] === fragment && fragment !== ""
      );

      if (!faq) return;

      setOpenItem(faq.id);
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = requestAnimationFrame(() => {
          document.getElementById(fragment)?.scrollIntoView({
            behavior: "auto",
            block: "start",
          });
        });
      });
    };

    openLinkedAnswer();
    window.addEventListener("hashchange", openLinkedAnswer);

    return () => {
      window.removeEventListener("hashchange", openLinkedAnswer);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
    };
  }, [answerFragments, faqs]);

  const handleToggle = (value: string) => {
    setOpenItem(value || null);
  };

  return (
    <section className="relative isolate flex w-full flex-col items-center gap-10 overflow-hidden px-4 py-12 text-center sm:px-8 sm:py-16 lg:px-12">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-center text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
          Got a Question?{" "}
          <span className="text-primary-500">We Have an Answer</span>
        </h1>
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
              answerFragment={answerFragments?.[faq.id]}
            />
          ))}
        </Accordion>
      </div>
    </section>
  );
};
