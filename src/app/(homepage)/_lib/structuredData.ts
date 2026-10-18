import { homeFAQs, pricingFAQs } from "./faqData";
import { siteUrl } from "~/lib/env-urls";

const createFaqSchema = (faqs: typeof homeFAQs, id: string) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": id,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const pricingStructuredData = createFaqSchema(
  pricingFAQs,
  `${siteUrl("/pricing")}#faq`
);
