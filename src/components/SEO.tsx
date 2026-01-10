import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  structuredData?: object;
}

const SITE_NAME = 'Finaptics';
const DEFAULT_DESCRIPTION = 'Finaptics - Modern CIMA study platform with competency-based analytics, adaptive learning, and expert-led courses to help you pass first time.';
const DEFAULT_IMAGE = 'https://finaptics.com/og-image.png';
const SITE_URL = 'https://finaptics.com';

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  structuredData,
}: SEOProps) => {
  const location = useLocation();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | CIMA Study Platform`;
  const canonicalUrl = `${SITE_URL}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Standard meta tags
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    if (noindex) setMeta('robots', 'noindex, nofollow');
    else setMeta('robots', 'index, follow');

    // Open Graph tags
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);

    // Twitter Card tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // Canonical URL
    setLink('canonical', canonicalUrl);

    // Structured data
    const existingScript = document.querySelector('script[data-seo="structured-data"]');
    if (existingScript) {
      existingScript.remove();
    }

    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'structured-data');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[data-seo="structured-data"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [fullTitle, description, keywords, image, type, noindex, canonicalUrl, structuredData]);

  return null;
};

// Pre-built structured data helpers
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Finaptics',
  url: 'https://finaptics.com',
  logo: 'https://finaptics.com/favicon.png',
  description: 'Modern CIMA study platform with competency-based analytics and adaptive learning.',
  sameAs: [
    'https://twitter.com/Finaptics',
    'https://linkedin.com/company/finaptics',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@finaptics.com',
    contactType: 'customer service',
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Finaptics',
  url: 'https://finaptics.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://finaptics.com/courses?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const createCourseSchema = (course: {
  name: string;
  description: string;
  provider?: string;
  url: string;
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.name,
  description: course.description,
  provider: {
    '@type': 'EducationalOrganization',
    name: course.provider || 'Finaptics',
    url: 'https://finaptics.com',
  },
  url: course.url,
  image: course.image,
});

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export default SEO;
