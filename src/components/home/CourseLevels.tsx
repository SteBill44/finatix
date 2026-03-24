import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { motion } from "framer-motion";
import stepAccountImg from "@/assets/course-step-1-account.jpg";
import stepChooseImg from "@/assets/course-step-2-choose.png";
import certificatePreviewImg from "@/assets/certificate-preview.jpg";
import AdminImageDropZone from "@/components/admin/AdminImageDropZone";
import { useSiteImages, useUpsertSiteImage } from "@/hooks/useSiteImages";

const CourseLevels = () => {
  const { user } = useAuth();
  const siteImageKeys = ["course-step-1", "course-step-2", "course-step-3"];
  const { data: siteImages } = useSiteImages(siteImageKeys);
  const { upsertSiteImage } = useUpsertSiteImage();

  const fallbacks: Record<string, string> = {
    "course-step-1": stepAccountImg,
    "course-step-2": stepChooseImg,
    "course-step-3": certificatePreviewImg,
  };
  const steps = [
    {
      number: "01",
      title: "Create your account",
      description: "Join the Finatix platform and benefit from our free and paid training courses.",
      features: [
        "Register your account for free",
        "No credit card details required",
        "Quick and easy setup"
      ],
      cta: user ? "Go to Dashboard" : "Register for Free",
      ctaLink: user ? "/dashboard" : "/auth?mode=signup",
      imagePosition: "right" as const,
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
      imagePosition: "left" as const,
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
      cta: user ? "View Achievements" : "View Certifications",
      ctaLink: user ? "/achievements" : "/courses",
      imagePosition: "right" as const,
      image: certificatePreviewImg
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
            <motion.div
              initial={{ opacity: 0, x: step.imagePosition === 'left' ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex-1"
            >
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3">
                <span className="text-charcoal">{step.title.split(' ').slice(0, -1).join(' ')}</span>{' '}
                <span className="text-primary">{step.title.split(' ').slice(-1)}</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                {step.description}
              </p>
              <ul className="space-y-2 mb-6">
                {step.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              <Link to={step.ctaLink}>
                <Button size="sm">{step.cta}</Button>
              </Link>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: step.imagePosition === 'left' ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 w-full"
            >
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500">
                <OptimizedImage 
                  src={step.image} 
                  alt={step.title}
                  aspectRatio="video"
                  className="w-full transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseLevels;
