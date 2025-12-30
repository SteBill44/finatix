import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import stepAccountImg from "@/assets/course-step-1-account.jpg";
import stepChooseImg from "@/assets/course-step-2-choose.png";
import stepSuccessImg from "@/assets/course-step-3-success.jpg";

const CourseLevels = () => {
  const steps = [
    {
      number: "01",
      title: "Create your account",
      description: "Join the CIMAStudy platform and benefit from our free and paid training courses.",
      features: [
        "Register your account for free",
        "No credit card details required",
        "Quick and easy setup"
      ],
      cta: "Register for Free",
      ctaLink: "/courses",
      imagePosition: "right",
      image: stepAccountImg
    },
    {
      number: "02",
      title: "Choose your course",
      description: "Pick the online training course that best suits your needs and begin learning.",
      features: [
        "Globally accredited training courses",
        "Created by industry experts",
        "Delivered through our bespoke learning platform"
      ],
      cta: "Explore Courses",
      ctaLink: "/courses",
      imagePosition: "left",
      image: stepChooseImg
    },
    {
      number: "03",
      title: "Share your success",
      description: "Successfully complete your training course final exam to receive your certification.",
      features: [
        "Earn industry-recognised certification",
        "Share your professional accomplishments",
        "Validate your certification on our website"
      ],
      cta: "View Certifications",
      ctaLink: "/courses",
      imagePosition: "right",
      image: stepSuccessImg
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className={`flex flex-col ${step.imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-12 mb-12 last:mb-0`}
          >
            {/* Content */}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3">
                <span className="text-charcoal">{step.title.split(' ').slice(0, -1).join(' ')}</span>{' '}
                <span className="text-primary">{step.title.split(' ').slice(-1)}</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                {step.description}
              </p>
              <ul className="space-y-2 mb-6">
                {step.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to={step.ctaLink}>
                <Button size="sm">{step.cta}</Button>
              </Link>
            </div>

            {/* Image */}
            <div className="flex-1 w-full">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className={`w-full h-auto ${step.number === "02" ? "object-contain bg-card" : "object-cover aspect-[4/3]"}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseLevels;