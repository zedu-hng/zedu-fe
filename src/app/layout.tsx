import type { Metadata } from "next";
// import { Plus_Jakarta_Sans } from "next/font/google";
import React from "react";
import "./globals.css";
import "./responsive.css";
import "react-loading-skeleton/dist/skeleton.css";
import { DataProvider } from "~/store/GlobalState";
import Script from "next/script";
import ClientLayout from "./client-layout";
import { gtmScriptUrl } from "~/lib/env-urls";
import { ThemeProvider } from "~/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "Zedu",
  icons: {
    icon: "/TelexIcon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsId = process.env.NEXT_PUBLIC_GA_ID;
  const analyticsScriptUrl = gtmScriptUrl();

  return (
    <html
      lang="en"
      className="max-w-screen overflow-x-hidden relative"
      suppressHydrationWarning
    >
      <head>
        {analyticsId && analyticsScriptUrl ? (
          <>
            <Script async src={`${analyticsScriptUrl}?id=${analyticsId}`} />
            <Script
              id="google-analytics"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${analyticsId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        ) : null}
      </head>

      <body className="max-w-screen overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider>
          <ClientLayout>
            <DataProvider>{children}</DataProvider>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
