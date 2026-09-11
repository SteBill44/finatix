import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
  id?: string;
}

/**
 * Shared heading block so every homepage section shares one rhythm,
 * type scale and eyebrow treatment.
 */
const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  id,
}: SectionHeadingProps) => (
  <div
    className={cn(
      "mb-10 max-w-2xl lg:mb-14",
      align === "center" ? "mx-auto text-center" : "text-left",
      className,
    )}
  >
    {eyebrow && (
      <span className="mb-4 inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </span>
    )}
    <h2
      id={id}
      className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-charcoal md:text-4xl"
    >
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
        {description}
      </p>
    )}
  </div>
);

export default SectionHeading;
