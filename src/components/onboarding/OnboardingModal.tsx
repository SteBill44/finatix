import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  BookOpen,
  Trophy,
  Video,
  MessageSquare,
  Target,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: BookOpen,
    title: "Welcome to Finatix!",
    description:
      "Your journey to CIMA qualification starts here. Let's take a quick tour of what you can do.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Video,
    title: "Learn with Video Lessons",
    description:
      "Watch expert-led video lessons at your own pace. Your progress is saved automatically so you can pick up where you left off.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Practice with Quizzes",
    description:
      "Test your knowledge with practice quizzes and mock exams. Get instant feedback and detailed explanations.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Trophy,
    title: "Track Your Achievements",
    description:
      "Earn badges, maintain study streaks, and climb the leaderboard as you progress through your courses.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: MessageSquare,
    title: "Join the Community",
    description:
      "Connect with fellow students in discussions, ask questions, and share your learning journey.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Sparkles,
    title: "You're All Set!",
    description:
      "Start by exploring your dashboard or browsing available courses. Good luck with your studies!",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative">
          {/* Progress dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary w-6"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Skip button */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              Skip
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-8 pt-12"
            >
              {/* Icon */}
              <div
                className={`w-20 h-20 rounded-2xl ${currentStepData.bgColor} flex items-center justify-center mx-auto mb-6`}
              >
                <Icon className={`w-10 h-10 ${currentStepData.color}`} />
              </div>

              {/* Content */}
              <div className="text-center space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {currentStepData.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="p-6 pt-0 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <Button onClick={handleNext} size="sm" className="gap-1">
              {currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
