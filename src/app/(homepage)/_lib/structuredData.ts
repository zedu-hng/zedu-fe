import { homeFAQs, pricingFAQs } from "./faqData";
import { siteUrl } from "~/lib/env-urls";

const organizationSchema = {
  "@type": "Organization",
  "@id": `${siteUrl()}/#organization`,
  name: "Zedu",
  url: siteUrl(),
  logo: siteUrl("/Zedu.png"),
  description:
    "Zedu is a communication and learning platform built for schools, bootcamps, and training programs.",
};

const softwareApplicationSchema = {
  "@type": "SoftwareApplication",
  "@id": `${siteUrl()}/#software`,
  name: "Zedu",
  url: siteUrl(),
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "Zedu helps schools, bootcamps, and training programs organize learning, communication, and cohort collaboration.",
  publisher: {
    "@id": `${siteUrl()}/#organization`,
  },
};

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

export const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    softwareApplicationSchema,
    createFaqSchema(homeFAQs, `${siteUrl()}/#faq`),
  ],
};

export const pricingStructuredData = createFaqSchema(
  pricingFAQs,
  `${siteUrl("/pricing")}#faq`
);
