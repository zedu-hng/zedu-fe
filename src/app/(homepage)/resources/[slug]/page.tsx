import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteUrl } from "~/lib/env-urls";
import { ArrowBtn, OutlineBtn } from "../../_components/ui/Button";
import { ArticleBody } from "../../_components/resources/ArticleBody";
import {
  articleAuthor,
  articlePath,
  articles,
  getArticleBySlug,
} from "../../_lib/articles";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export const generateStaticParams = () =>
  articles.map((article) => ({ slug: article.slug }));

export const generateMetadata = async ({
  params,
}: ArticlePageProps): Promise<Metadata> => {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const url = siteUrl(articlePath(article.slug));
  const image = siteUrl(article.image);

  return {
    title: { absolute: article.metaTitle },
    description: article.description,
    authors: [articleAuthor],
    icons: {
      icon: "/TelexIcon.svg",
    },
    openGraph: {
      title: article.headline,
      description: article.description,
      url,
      siteName: "Zedu",
      images: [
        {
          url: image,
          width: article.imageWidth,
          height: article.imageHeight,
          alt: article.imageAlt,
        },
      ],
      type: "article",
      publishedTime: article.datePublished,
      authors: [articleAuthor.url],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: article.headline,
      description: article.description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const ArticlePage = async ({ params }: ArticlePageProps) => {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const url = siteUrl(articlePath(article.slug));
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: [siteUrl(article.image)],
    datePublished: article.datePublished,
    dateModified: article.datePublished,
    author: {
      "@type": "Person",
      name: articleAuthor.name,
      url: articleAuthor.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Zedu",
      logo: { "@type": "ImageObject", url: siteUrl("/Zedu.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 text-left sm:px-8 sm:py-16">
        <header className="flex flex-col gap-5">
          <Link
            href="/resources"
            className="text-sm font-medium text-primary-500 underline hover:text-primary-400"
          >
            Resources
          </Link>
          <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
            {article.headline}
          </h1>
          <p className="text-sm text-neutral-600">
            By{" "}
            <a
              href={articleAuthor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-500 underline hover:text-primary-400"
            >
              {articleAuthor.name}
            </a>{" "}
            ·{" "}
            <time dateTime={article.datePublished}>
              {formatDate(article.datePublished)}
            </time>
          </p>
          <Image
            src={article.image}
            alt={article.imageAlt}
            width={article.imageWidth}
            height={article.imageHeight}
            priority
            className="h-auto w-full rounded-lg object-cover"
          />
        </header>

        <ArticleBody markdown={article.body} />

        <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center">
          <ArrowBtn
            text={article.primaryCta.label}
            href={article.primaryCta.href}
          />
          <OutlineBtn
            text={article.secondaryCta.label}
            href={article.secondaryCta.href}
          />
        </div>

        <section className="flex flex-col gap-3 text-neutral-600">
          <h2 className="text-lg font-semibold text-neutral-900">
            Keep reading and exploring
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            {article.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-medium text-primary-500 underline hover:text-primary-400"
                >
                  {link.label}
                </Link>
                {link.description && `: ${link.description}`}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
};

export default ArticlePage;
