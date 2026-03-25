import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import stepAccountImg from "@/assets/course-step-1-account.jpg";
import stepChooseImg from "@/assets/course-step-2-choose.png";
import certificatePreviewImg from "@/assets/certificate-preview.jpg";
import AdminImageDropZone from "@/components/admin/AdminImageDropZone";
import { useSiteImages, useUpsertSiteImage } from "@/hooks/useSiteImages";
import SplitTextReveal from "./SplitTextReveal";
import MagneticButton from "./MagneticButton";

const StepBlock = ({
  step,
  index,
  siteImages,
  upsertSiteImage,
}: {
  step: any;
  index: number;
  siteImages: any;
  upsertSiteImage: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const contentY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <div
      ref={ref}
      className={`flex flex-col ${
        step.imagePosition === "left" ? "lg:flex-row-reverse" : "lg:flex-row"
      } items-center gap-8 lg:gap-12 mb-12 last:mb-0`}
    >
      {/* Content */}
      <motion.div style={{ y: contentY }} className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: step.imagePosition === "left" ? 40 : -40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <SplitTextReveal
            as="h2"
            className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3"
            delay={0.1}
          >
            {step.title}
          </SplitTextReveal>
          <p className="text-muted-foreground mb-4">{step.description}</p>
          <ul className="space-y-2 mb-6">
            {step.features.map((feature: string, i: number) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.3 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-start gap-2"
              >
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">{feature}</span>
              </motion.li>
            ))}
          </ul>
          <MagneticButton strength={0.15}>
            <Link to={step.ctaLink}>
              <Button size="sm">{step.cta}</Button>
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Image — parallax */}
      <motion.div style={{ y: imageY }} className="flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, x: step.imagePosition === "left" ? -40 : 40, scale: 0.95 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <AdminImageDropZone
            onImageUpdated={(url) => upsertSiteImage(step.imageKey, url)}
          >
            <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500 group">
              <OptimizedImage
                src={siteImages?.[step.imageKey] || step.image}
                alt={step.title}
                aspectRatio="video"
                className="w-full transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
          </AdminImageDropZone>
        </motion.div>
      </motion.div>
    </div>
  );
};

const CourseLevels = () => {
  const { user } = useAuth();
  const siteImageKeys = ["course-step-1", "course-step-2", "course-step-3"];
  const { data: siteImages } = useSiteImages(siteImageKeys);
  const { upsertSiteImage } = useUpsertSiteImage();

  const steps = [
    {
      number: "01",
      title: "Create your account",
      description:
        "Join the Finatix platform and benefit from our free and paid training courses.",
      features: [
        "Register your account for free",
        "No credit card details required",
        "Quick and easy setup",
      ],
      cta: user ? "Go to Dashboard" : "Register for Free",
      ctaLink: user ? "/dashboard" : "/auth?mode=signup",
      imagePosition: "right" as const,
      image: stepAccountImg,
      imageKey: "course-step-1",
    },
    {
      number: "02",
      title: "Choose your course",
      description:
        "Pick the online training course that best suits your needs and begin learning.",
      features: [
        "Globally accredited training courses",
        "Created by industry experts",
        "Delivered through our bespoke learning platform",
      ],
      cta: "Explore Courses",
      ctaLink: "/courses",
      imagePosition: "left" as const,
      image: stepChooseImg,
      imageKey: "course-step-2",
    },
    {
      number: "03",
      title: "Share your success",
      description:
        "Successfully complete your training course final exam to receive your certification.",
      features: [
        "Earn industry-recognised certification",
        "Share your professional accomplishments",
        "Validate your certification on our website",
      ],
      cta: user ? "View Achievements" : "View Certifications",
      ctaLink: user ? "/achievements" : "/courses",
      imagePosition: "right" as const,
      image: certificatePreviewImg,
      imageKey: "course-step-3",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        {steps.map((step, index) => (
          <StepBlock
            key={step.number}
            step={step}
            index={index}
            siteImages={siteImages}
            upsertSiteImage={upsertSiteImage}
          />
        ))}
      </div>
    </section>
  );
};

export default CourseLevels;
