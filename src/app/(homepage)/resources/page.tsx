import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourcesHub } from "./_components/resources-hub";
import {
  ZeduVsWhatsappTelegram,
  zeduVsWhatsappTelegramMetadata,
  zeduVsWhatsappTelegramSlug,
} from "./_components/zedu-vs-whatsapp-telegram";

type ResourcesPageProps = {
  searchParams: Promise<{ guide?: string | string[] }>;
};

const getGuideSlug = async (
  searchParams: ResourcesPageProps["searchParams"]
) => {
  const { guide } = await searchParams;
  return typeof guide === "string" ? guide : undefined;
};

export const generateMetadata = async ({
  searchParams,
}: ResourcesPageProps): Promise<Metadata> => {
  const slug = await getGuideSlug(searchParams);
  return slug === zeduVsWhatsappTelegramSlug
    ? zeduVsWhatsappTelegramMetadata
    : {};
};

const ResourcesPage = async ({ searchParams }: ResourcesPageProps) => {
  const slug = await getGuideSlug(searchParams);
  if (!slug) return <ResourcesHub />;
  if (slug === zeduVsWhatsappTelegramSlug) return <ZeduVsWhatsappTelegram />;

  notFound();
};

export default ResourcesPage;
