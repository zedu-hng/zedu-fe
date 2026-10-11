import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zedu Yoda Contributors Board | Zedu",
  description: "Browse Zedu Yoda contributor names and Zedu usernames.",
  openGraph: {
    title: "Zedu Yoda Contributors Board | Zedu",
    description: "Browse Zedu Yoda contributor names and Zedu usernames.",
    url: "/contributors/zedu-yoda",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu Yoda Contributors Board | Zedu",
    description: "Browse Zedu Yoda contributor names and Zedu usernames.",
  },
  alternates: {
    canonical: "/contributors/zedu-yoda",
  },
};

export default function ZeduYodaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
