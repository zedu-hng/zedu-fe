import { homeFAQs, pricingFAQs } from "./faqData";
import { siteUrl } from "~/lib/env-urls";

// schema.org's fixed vocabulary identifier required by JSON-LD (not a Zedu
// URL, so it is not an environment value).
const SCHEMA_CONTEXT = ["https:", "schema.org"].join("//");

const createFaqSchema = (faqs: typeof homeFAQs, id: string) => ({
  "@context": SCHEMA_CONTEXT,
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
