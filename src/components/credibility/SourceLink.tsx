import { ExternalLink } from "lucide-react";
import type { ClaimSource } from "@/lib/claims";

/**
 * A discreet link to the source behind a claim. Deliberately small and quiet:
 * it should sit next to the claim without competing with the copy.
 */
export function SourceLink({
  source,
  prefix = "Source:",
  className = "",
}: {
  source: ClaimSource;
  prefix?: string;
  className?: string;
}) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary underline underline-offset-2 ${className}`}
    >
      {prefix} {source.label}
      <ExternalLink className="w-3 h-3" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export default SourceLink;
