import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Management Accountant",
      company: "Deloitte",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      quote: "The competency-based analytics completely changed how I studied. I passed P2 on my first attempt after failing twice with other providers.",
      rating: 5,
    },
    {
      name: "James Chen",
      role: "Finance Manager",
      company: "HSBC",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "Best investment I made for my CIMA journey. The mock exams and instant feedback helped me identify exactly where I needed to improve.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Senior Analyst",
      company: "PwC",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "As someone studying while working full-time, the mobile app and adaptive learning made it possible to study efficiently during my commute.",
      rating: 5,
    },
    {
      name: "Michael Thompson",
      role: "Financial Controller",
      company: "Unilever",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: "The strategic level courses are exceptional. The case study preparation was thorough and gave me confidence going into the exam.",
      rating: 5,
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Student Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted by{" "}
            <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join our community of successful CIMA professionals who passed their exams with confidence.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-card">
            <Quote className="w-12 h-12 text-primary/20 mb-6" />
            
            <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">
              "{testimonials[currentIndex].quote}"
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonials[currentIndex].name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
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

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">94%</p>
            <p className="text-sm text-muted-foreground">Pass Rate</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">4.9/5</p>
            <p className="text-sm text-muted-foreground">Student Rating</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">10,000+</p>
            <p className="text-sm text-muted-foreground">Students</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">50+</p>
            <p className="text-sm text-muted-foreground">Countries</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
