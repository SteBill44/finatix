import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APPROVED_TESTIMONIALS } from "@/data/testimonials";

/**
 * Shows student testimonials. Renders nothing at all until at least one
 * genuine, approved testimonial exists, so the page never carries invented
 * praise or an empty "what students say" shell.
 */
export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const items = APPROVED_TESTIMONIALS;

  if (items.length === 0) return null;

  const current = items[Math.min(index, items.length - 1)];

  return (
    <section className="py-12 lg:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What our students say
          </h2>
          <p className="text-muted-foreground">
            Every quote below is published with the student's written permission.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <figure className="bg-background rounded-xl border border-border p-8 md:p-12 mb-8">
            <Quote className="w-8 h-8 text-primary mb-4" aria-hidden="true" />
            <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
              {current.quote}
            </blockquote>
            <figcaption className="text-sm">
              <span className="font-semibold text-foreground">{current.name}</span>
              {current.role && (
                <span className="text-muted-foreground"> - {current.role}</span>
              )}
              <span className="block text-muted-foreground mt-1">{current.date}</span>
            </figcaption>
          </figure>

          {items.length > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label="Previous testimonial"
                onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex gap-2">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Show testimonial ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === index ? "bg-primary w-8" : "bg-border hover:bg-muted-foreground w-2.5"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label="Next testimonial"
                onClick={() => setIndex((i) => (i + 1) % items.length)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
