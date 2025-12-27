import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Management Accountant",
      initials: "SM",
      quote: "Wish I had enrolled in these courses sooner! The competency-based analytics completely changed how I studied. Each module provides real-world scenarios with actionable tools and techniques that I was able to apply immediately in my role. The engaging mix of video walkthroughs, interactive labs, and quizzes ensures you can revisit the different concepts until you feel confident.",
    },
    {
      name: "Chris T.",
      role: "Cyber Threat and Risk Manager",
      initials: "CT",
      quote: "The courses provided by CIMAStudy are the best in terms of content and structure I have come across. An absolute must for anyone wanting to pursue their CIMA certification but also anyone wanting to gain a solid baseline knowledge set for a career in management accounting.",
    },
    {
      name: "Brod K.",
      role: "Finance Analyst",
      initials: "BK",
      quote: "This course is great for practitioners. Details & deep knowledge from this course helped me pass on my first attempt.",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
            Trusted by <span className="text-primary">Security Professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of professionals who have advanced their careers
          </p>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-xl border border-border p-8 md:p-12 mb-8">
            <p className="text-lg md:text-xl text-charcoal leading-relaxed mb-8">
              "{testimonials[currentIndex].quote}"
            </p>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {testimonials[currentIndex].initials}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-charcoal">{testimonials[currentIndex].name}</h4>
                <p className="text-sm text-muted-foreground">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-border hover:bg-muted-foreground"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;