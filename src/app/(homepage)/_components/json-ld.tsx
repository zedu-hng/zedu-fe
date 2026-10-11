import { siteUrl } from "~/lib/env-urls";

const DESCRIPTION =
  "Zedu is an AI-powered education platform built for bootcamps and learning communities. Organize cohorts, run classes, manage communication, and scale modern learning in one workspace.";

export function JsonLd() {
  const base = siteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Zedu",
        url: base,
        logo: {
          "@type": "ImageObject",
          url: `${base}/Zedu.png`,
        },
        description: DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "Zedu - Learning Platform for Bootcamps, Schools, and Cohorts",
        description: DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${base}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
