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

const DEFAULT_TITLE = "Finatix | CIMA Training & Exam Prep";
const DEFAULT_DESCRIPTION = "Master your CIMA qualification with Finatix. Comprehensive courses from Certificate to Strategic level, practice exams, and AI-powered study tools.";
const DEFAULT_OG_IMAGE = "/og-image.png";

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

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
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

    // Update or create link tag
    const updateLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // Basic meta tags
    updateMeta("description", description);
    if (keywords) {
      updateMeta("keywords", keywords);
    }

    // Open Graph tags
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:image", ogImage, true);

    // Twitter Card tags
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);

    // Canonical URL
    if (canonicalUrl) {
      updateLink("canonical", canonicalUrl);
    }

    // Robots meta
    if (noIndex) {
      updateMeta("robots", "noindex, nofollow");
    } else {
      updateMeta("robots", "index, follow");
    }

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, keywords, ogImage, ogType, canonicalUrl, noIndex]);

  return null; // This component doesn't render anything
};

export default SEOHead;
