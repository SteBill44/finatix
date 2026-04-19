import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify to clean potentially dangerous HTML
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "strong", "b", "em", "i", "u", "s", "strike",
      "a", "img",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
      "sup", "sub",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel",
      "src", "alt", "title", "width", "height",
      "class", "id", "style", "allowfullscreen",
      "colspan", "rowspan",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "style", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
}

/**
 * Sanitize and return HTML for use with dangerouslySetInnerHTML
 */
export function createSanitizedMarkup(html: string): { __html: string } {
  return { __html: sanitizeHtml(html) };
}
