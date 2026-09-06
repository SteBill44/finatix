import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  canonicalUrl?: string;
  noIndex?: boolean;
}

const SITE_URL = "https://finatix.io";
const DEFAULT_TITLE = "Finatix | CIMA Training & Exam Prep";
const DEFAULT_DESCRIPTION =
  "CIMA training from Certificate to Strategic level - courses, mock exams, AI study tools, and competency analytics to help you pass faster.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png?v=2`;

const toAbsolute = (url: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonicalUrl,
  noIndex = false,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | Finatix` : DEFAULT_TITLE;
  const absoluteOgImage = toAbsolute(ogImage);
  // Self-referencing canonical: use provided value or current pathname
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const resolvedCanonical = canonicalUrl
    ? toAbsolute(canonicalUrl)
    : `${SITE_URL}${pathname}`;

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const updateLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    updateMeta("description", description);
    if (keywords) updateMeta("keywords", keywords);

    // Open Graph
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:image", absoluteOgImage, true);
    updateMeta("og:image:width", "1200", true);
    updateMeta("og:image:height", "630", true);
    updateMeta("og:image:alt", fullTitle, true);
    updateMeta("og:url", resolvedCanonical, true);
    updateMeta("og:site_name", "Finatix", true);

    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", absoluteOgImage);
    updateMeta("twitter:image:alt", fullTitle);
    updateMeta("twitter:site", "@Finatix");

    // Canonical (self-referencing by default)
    updateLink("canonical", resolvedCanonical);

    if (noIndex) updateMeta("robots", "noindex, nofollow");
    else updateMeta("robots", "index, follow");

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, keywords, absoluteOgImage, ogType, resolvedCanonical, noIndex]);

  return null;
};

export default SEOHead;
