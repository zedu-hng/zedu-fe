import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import Image from "next/image";
import { ArrowBtn, OutlineBtn } from "../../_components/ui/Button";
import { ChannelsFeatures } from "../../_components/products/channels-features";
import { ChannelsScale } from "../../_components/products/channels-scale";
import { ChannelsPlatform } from "../../_components/products/channels-platform";
import { ChannelsFAQ } from "../../_components/products/channels-faq";
import { ChannelsCTA } from "../../_components/products/channels-cta";

export const metadata: Metadata = {
  title: "Channels",
  description:
    "Explore Zedu Channels for structured classroom and cohort communication. Organize discussions by subject, share updates clearly, and scale collaboration across learning teams.",
  keywords: [
    "Zedu channels",
    "education communication channels",
    "classroom discussion platform",
    "cohort collaboration tools",
    "threaded learning conversations",
    "school communication software",
    "university discussion channels",
    "bootcamp class communication",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Zedu Channels - Organized Communication for Learning Teams",
    description:
      "Keep learning conversations structured with channels built for schools, universities, and cohort-based programs.",
    url: siteUrl("/products/channels"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu channels for organized learning communication",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu Channels - Structured Class Communication",
    description:
      "Create focused discussions, announcements, and threaded conversations with channels designed for modern education teams.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/products/channels"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const ChannelProductPage = () => {
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[30%] w-screen -translate-x-1/2 bg-gradient-to-t from-blue-50/30 to-white"
        />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 rounded-[28px] px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-12 lg:py-14 min-h-[85dvh]">
          <div className="flex flex-col items-center gap-5 text-center lg:max-w-[470px] lg:items-start lg:text-left">
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              <span className="text-primary-500">Organise Learning</span> with
              Structured Channels.
            </h1>
            <p className="max-w-[46ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Channels keep discussions organized by course, cohort, or topic so
              students and educators always know where conversations belong.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowBtn text="Start using channels" linkToHome />
              <OutlineBtn text="Watch a Demo" />
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/11] w-full sm:aspect-[4/3] lg:aspect-[16/10]">
              <Image
                src="/images/homepage/products/channels-hero.png"
                alt="Zedu channels product screenshot"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 680px"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>
      <ChannelsFeatures />
      <ChannelsScale />
      <ChannelsPlatform />
      <ChannelsFAQ />
      <ChannelsCTA />
    </>
  );
};

export default ChannelProductPage;
