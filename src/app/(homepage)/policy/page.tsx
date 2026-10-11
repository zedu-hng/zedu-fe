"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import SectionWrapper from "./component/SectionWrapper";
import { siteUrl } from "~/lib/env-urls";
import { cn } from "~/lib/utils";

const POLICY_SECTIONS = [
  { id: "info-collected", title: "Information We Collect" },
  { id: "how", title: "How We Use Your Information" },
  { id: "disclosure", title: "Disclosure of Your Information" },
  { id: "security", title: "Security of Your Information" },
  { id: "rights", title: "Your Rights" },
  { id: "policy", title: "Changes to This Privacy Policy" },
  { id: "cookie", title: "Cookies and Tracking Technologies" },
  { id: "data-retention", title: "Data Retention" },
  { id: "contact-us", title: "Contact Us" },
];

// Height of the fixed site header (h-20 in _components/header)
const SITE_HEADER_HEIGHT = 80;

// Set document title for client component
const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
function Policy() {
  const [activeSection, setActiveSection] = useState<string>("");

  // Set document title
  useDocumentTitle("Privacy Policy - Zedu");

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Mobile contents menu (the desktop sidebar is hidden below md)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSectionIndex, setMobileSectionIndex] = useState(0);
  // The homepage layout sets overflow-x-hidden, which disables
  // position: sticky, so the bar is pinned with position: fixed instead
  const [pinnedBox, setPinnedBox] = useState<{
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuSlotRef = useRef<HTMLDivElement>(null);
  const mobileMenuSentinelRef = useRef<HTMLDivElement>(null);
  const currentSection = POLICY_SECTIONS[mobileSectionIndex];

  // Pin the bar under the site header once the 1px sentinel above it
  // scrolls behind the header
  useEffect(() => {
    const sentinel = mobileMenuSentinelRef.current;
    const slot = mobileMenuSlotRef.current;
    if (!sentinel || !slot) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast =
          !entry.isIntersecting &&
          entry.boundingClientRect.top < SITE_HEADER_HEIGHT;
        if (!scrolledPast) {
          setPinnedBox(null);
          return;
        }
        const { left, width } = slot.getBoundingClientRect();
        setPinnedBox({
          left,
          width,
          height: mobileMenuRef.current?.offsetHeight ?? 0,
        });
      },
      { rootMargin: `-${SITE_HEADER_HEIGHT}px 0px 0px 0px` }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // The current section is the last heading that has reached the top
  // quarter of the screen below the bar
  useEffect(() => {
    let frame = 0;
    const updateMobileSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const barBottom = Math.max(
          mobileMenuRef.current?.getBoundingClientRect().bottom ?? 0,
          SITE_HEADER_HEIGHT
        );
        const readingLine = barBottom + (window.innerHeight - barBottom) * 0.25;
        let index = 0;
        POLICY_SECTIONS.forEach(({ id }, i) => {
          const heading = document.getElementById(id);
          if (heading && heading.getBoundingClientRect().top <= readingLine) {
            index = i;
          }
        });
        setMobileSectionIndex(index);
      });
    };

    updateMobileSection();
    window.addEventListener("scroll", updateMobileSection, { passive: true });
    window.addEventListener("resize", updateMobileSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateMobileSection);
      window.removeEventListener("resize", updateMobileSection);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Scroll so the heading sits just below the header and pinned bar
  const goToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    const barHeight = mobileMenuRef.current?.offsetHeight ?? 0;
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      SITE_HEADER_HEIGHT -
      barHeight -
      16;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  useEffect(() => {
    const sections = document.querySelectorAll("li[id]");
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.25,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    sections.forEach((section) => {
      observer.observe(section);
      sectionRefs.current[section.id] = section as HTMLElement;
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <SectionWrapper container="wide" variant="small">
      <div className="w-full flex py-8 ">
        <div className="hidden w-[314px] md:block mt-28 top-16 sticky self-start">
          <p className="text-2xl font-semibold leading-8 text-stone-900">
            Contents
          </p>
          <ul className="list-decimal p-4 flex flex-col gap-5 text-zinc-800">
            {POLICY_SECTIONS.map(({ id, title }) => (
              <Link key={id} href={`#${id}`}>
                <li
                  className={`hover:text-blue-500 ${
                    activeSection === id ? "text-blue-500" : ""
                  }`}
                >
                  {title}
                </li>
              </Link>
            ))}
          </ul>
        </div>

        <div className="mt-16 md:mt-10 w-[375px] md:w-[700px] lg:w-[815px] py-3 px-5 text-black">
          <p className="text-2xl md:text-4xl font-semibold leading-10 pb-5">
            Our Privacy Policy
          </p>
          <div
            ref={mobileMenuSentinelRef}
            aria-hidden="true"
            className="h-px md:hidden"
          />
          <div
            ref={mobileMenuSlotRef}
            className="-mx-5 mb-5 md:hidden"
            style={pinnedBox ? { height: pinnedBox.height } : undefined}
          >
            <div
              ref={mobileMenuRef}
              className={cn(
                "z-20 bg-white px-5 py-2",
                pinnedBox ? "fixed top-20 shadow-sm" : "relative"
              )}
              style={
                pinnedBox
                  ? { left: pinnedBox.left, width: pinnedBox.width }
                  : undefined
              }
            >
              <button
                type="button"
                aria-expanded={isMobileMenuOpen}
                aria-controls="policy-mobile-contents"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Contents · {mobileSectionIndex + 1} of{" "}
                    {POLICY_SECTIONS.length}
                  </span>
                  <span className="truncate text-base font-semibold text-primary-500">
                    {currentSection.title}
                  </span>
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-5 transition-transform",
                      isMobileMenuOpen && "rotate-180"
                    )}
                  />
                </span>
              </button>
              {isMobileMenuOpen && (
                <nav
                  id="policy-mobile-contents"
                  aria-label="Privacy Policy contents"
                  className="absolute inset-x-5 top-full rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
                >
                  <ol>
                    {POLICY_SECTIONS.map(({ id, title }, index) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          onClick={(event) => goToSection(event, id)}
                          aria-current={
                            id === currentSection.id ? "location" : undefined
                          }
                          className={cn(
                            "flex gap-3 rounded-lg px-3 py-2.5 text-[15px] text-neutral-800",
                            id === currentSection.id &&
                              "bg-primary-50 font-semibold text-primary-500"
                          )}
                        >
                          <span
                            className={cn(
                              "w-4 shrink-0 text-neutral-400",
                              id === currentSection.id && "text-primary-500"
                            )}
                          >
                            {index + 1}
                          </span>
                          {title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </div>
          </div>
          <p className="text-base font-normal leading-6 text-neutral-800">
            Thank you for using Zedu. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you
            visit our website
            <span className="p-1">
              <Link
                href={siteUrl()}
                target="_blank"
                rel=""
                className="text-blue-500"
              >
                www.zedu.chat
              </Link>
            </span>
            including any other media form, media channel, mobile website, or
            mobile application related or connected thereto Zedu. Please read
            this privacy policy carefully. If you do not agree with the terms of
            this privacy policy, please do not access the site.
          </p>
          <br />
          <br />

          <ol className="list-decimal p-4 gap-[72px]">
            <li
              className="text-xl md:text-2xl font-semibold leading-6 pb-3"
              id="info-collected"
            >
              Information We Collect
            </li>
            <p>
              <b>Personal Information:</b> We may collect personal information
              that you voluntarily provide to us when you register on the site,
              express interest in obtaining information about us or our products
              and services, when you participate in activities on the site or
              otherwise when you contact us. <br />
              <br />
              <b>Non-Personal Information:</b> We may collect non-personal
              information about you whenever you interact with our site.
              Non-personal information may include the browser name, the type of
              computer and technical information about your means of connection
              to our site, such as the operating system and the internet service
              providers utilized and other similar information.
            </p>
            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5"
              id="how"
            >
              How We Use Your Information
            </li>

            <p>We may use the information we collect in the following way:</p>
            <ul className="list-disc">
              <li>To personalize user experience</li>
              <li>To improve our site To send periodic emails</li>
              <li>To send you service updates or promotional messages</li>
              <li>To respond to inquiries or support requests</li>
            </ul>

            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5"
              id="disclosure"
            >
              Disclosure of Your Information
            </li>
            <p>
              We may share information we have collected about you in certain
              situations. Your information may be disclosed as follows:
            </p>
            <ul className="list-disc">
              <li>
                <b>Third-Party Service Providers:</b> We may share your
                information with third-party service providers who perform
                services on our behalf to help us operate our business and the
                Site or administer activities on our behalf.
              </li>
              <li>
                <b>Business Transfers:</b> We may share or transfer your
                information in connection with, or during negotiations of, any
                merger, sale of company assets, financing, or acquisition of all
                or a portion of our business to another company.
              </li>
              <li>
                <b>With your Consent: </b>We may disclose your personal
                information for any other purpose with your consent.
              </li>
            </ul>

            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5"
              id="security"
            >
              Security of Your Information
            </li>
            <p>
              We use administrative, technical, and physical security measures
              to help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to
              us, please be aware that despite our efforts, no security measures
              are perfect or impenetrable, and no method of data transmission
              can be guaranteed against any interception or other type of
              misuse.
            </p>
            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5"
              id="rights"
            >
              Your Rights
            </li>
            <p>
              If you are a resident of Nigeria, you may have certain rights
              regarding your personal information under the Nigerian Data
              Protection Regulation (NDPR). These rights may include the right
              to access, correct, or delete your personal information.
            </p>
            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5 whitespace-nowrap"
              id="policy"
            >
              Changes to This Privacy Policy
            </li>
            <p>
              We may update this Privacy Policy from time to time in order to
              reflect, for example, changes to our practices or for other
              operational, legal, or regulatory reasons.
            </p>
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5 whitespace-nowrap"
              id="cookie"
            >
              Cookies and Tracking Technologies
            </li>
            <p>
              We may use cookies, web beacons, tracking pixels, and other
              technologies to help customize the site and improve your
              experience. Most browsers are set to accept cookies by default.
              You can choose to remove or reject cookies, but doing so may
              affect the availability and functionality of the site.
            </p>
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5 whitespace-nowrap"
              id="data-retention"
            >
              Data Retention
            </li>
            <p>
              We retain personal information for as long as necessary to fulfill
              the purposes outlined in this Privacy Policy unless otherwise
              required by law.
            </p>
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5 whitespace-nowrap"
              id="contact-us"
            >
              Contact Us
            </li>
            <p>
              If you have questions or comments about this Privacy Policy, you
              may contact us at{" "}
              <span className="p-1">
                <Link
                  href="mailto:support@zedu.chat"
                  target="_blank"
                  rel=""
                  className="text-blue-500"
                >
                  support@zedu.chat
                </Link>
              </span>
            </p>
          </ol>
        </div>
      </div>
    </SectionWrapper>
  );
}

export default Policy;
