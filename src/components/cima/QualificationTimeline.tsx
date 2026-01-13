import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Trophy,
  Clock,
  ChevronDown,
  CheckCircle2,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineLevel {
  id: string;
  title: string;
  shortTitle: string;
  levelLabel: string;
  duration: string;
  totalMonths: number;
  cumulativeMonths: number;
  description: string;
  subjects: string[];
  skills: string[];
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const timelineLevels: TimelineLevel[] = [
  {
    id: "certificate",
    title: "Certificate in Business Accounting",
    shortTitle: "Certificate",
    levelLabel: "Foundation",
    duration: "6-12 months",
    totalMonths: 9,
    cumulativeMonths: 9,
    description: "Build your foundation in accounting and business principles. Perfect for those new to finance or looking to formalise their knowledge.",
    subjects: [
      "BA1 - Fundamentals of Business Economics",
      "BA2 - Fundamentals of Management Accounting", 
      "BA3 - Fundamentals of Financial Accounting",
      "BA4 - Fundamentals of Ethics, Corporate Governance and Business Law"
    ],
    skills: ["Financial literacy", "Basic accounting", "Business ethics", "Economic principles"],
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/30"
  },
  {
    id: "operational",
    title: "Operational Level",
    shortTitle: "Operational",
    levelLabel: "Level 1",
    duration: "12-18 months",
    totalMonths: 15,
    cumulativeMonths: 24,
    description: "Develop core operational skills for day-to-day financial management. Focus on practical application of management accounting principles.",
    subjects: [
      "E1 - Managing Finance in a Digital World",
      "P1 - Management Accounting",
      "F1 - Financial Reporting",
      "Operational Case Study"
    ],
    skills: ["Digital finance", "Cost analysis", "Financial reporting", "Operational decision-making"],
    icon: Target,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/30"
  },
  {
    id: "management",
    title: "Management Level",
    shortTitle: "Management",
    levelLabel: "Level 2",
    duration: "12-18 months",
    totalMonths: 15,
    cumulativeMonths: 39,
    description: "Advance to middle management capabilities. Learn to analyse complex business situations and drive performance improvement.",
    subjects: [
      "E2 - Managing Performance",
      "P2 - Advanced Management Accounting",
      "F2 - Advanced Financial Reporting",
      "Management Case Study"
    ],
    skills: ["Performance management", "Advanced costing", "Strategic analysis", "Team leadership"],
    icon: GraduationCap,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/30"
  },
  {
    id: "strategic",
    title: "Strategic Level",
    shortTitle: "Strategic",
    levelLabel: "Level 3",
    duration: "12-18 months",
    totalMonths: 15,
    cumulativeMonths: 54,
    description: "Master strategic leadership and executive decision-making. Prepare for senior roles with board-level responsibilities.",
    subjects: [
      "E3 - Strategic Management",
      "P3 - Risk Management",
      "F3 - Financial Strategy",
      "Strategic Case Study"
    ],
    skills: ["Strategic planning", "Risk assessment", "Corporate finance", "Executive leadership"],
    icon: Trophy,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/30"
  }
];

const QualificationTimeline = () => {
  const [expandedLevel, setExpandedLevel] = useState<string | null>("certificate");
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);

  const toggleLevel = (id: string) => {
    setExpandedLevel(expandedLevel === id ? null : id);
  };

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedLevels(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const getProgressPercentage = () => {
    const totalMonths = timelineLevels[timelineLevels.length - 1].cumulativeMonths;
    let completedMonths = 0;
    completedLevels.forEach(levelId => {
      const level = timelineLevels.find(l => l.id === levelId);
      if (level) completedMonths += level.totalMonths;
    });
    return Math.round((completedMonths / totalMonths) * 100);
  };

  const getEstimatedCompletion = () => {
    const remainingLevels = timelineLevels.filter(l => !completedLevels.includes(l.id));
    const remainingMonths = remainingLevels.reduce((acc, l) => acc + l.totalMonths, 0);
    return remainingMonths;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Your CIMA Journey</h3>
            <p className="text-sm text-muted-foreground">
              Click levels to explore • Check off completed stages
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{getProgressPercentage()}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{getEstimatedCompletion()}</p>
              <p className="text-xs text-muted-foreground">Months left</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {/* Level markers */}
          <div className="absolute inset-0 flex">
            {timelineLevels.map((level, index) => (
              <div 
                key={level.id}
                className="flex-1 relative"
              >
                {index < timelineLevels.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-background/50" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Level Labels */}
        <div className="flex mt-2">
          {timelineLevels.map((level) => (
            <div key={level.id} className="flex-1 text-center">
              <span className="text-xs text-muted-foreground hidden sm:inline">{level.shortTitle}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Timeline Items */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {timelineLevels.map((level, index) => {
            const isExpanded = expandedLevel === level.id;
            const isCompleted = completedLevels.includes(level.id);
            const Icon = level.icon;
            
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  onClick={() => toggleLevel(level.id)}
                  className={cn(
                    "relative ml-14 md:ml-20 cursor-pointer rounded-xl border transition-all duration-300",
                    isExpanded 
                      ? `${level.bgColor} shadow-lg` 
                      : "bg-card border-border hover:border-primary/30 hover:shadow-md",
                    isCompleted && "ring-2 ring-primary/50"
                  )}
                >
                  {/* Timeline Node */}
                  <div 
                    className={cn(
                      "absolute -left-14 md:-left-20 top-6 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300",
                      isCompleted 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : isExpanded 
                          ? `bg-card border-primary ${level.color}`
                          : "bg-card border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                    ) : (
                      <Icon className="w-6 h-6 md:w-8 md:h-8" />
                    )}
                  </div>

                  {/* Header */}
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            level.bgColor
                          )}>
                            {level.levelLabel}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {level.duration}
                          </span>
                        </div>
                        <h3 className={cn(
                          "text-lg font-semibold transition-colors",
                          isExpanded ? level.color : "text-foreground"
                        )}>
                          {level.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {level.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleComplete(level.id, e)}
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            isCompleted 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          )}
                          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-border/50">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Subjects */}
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  Subjects
                                </h4>
                                <ul className="space-y-2">
                                  {level.subjects.map((subject, i) => (
                                    <motion.li 
                                      key={i}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="text-sm text-muted-foreground flex items-start gap-2"
                                    >
                                      <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", level.color.replace('text-', 'bg-'))} />
                                      {subject}
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>

                              {/* Skills */}
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Skills You'll Gain
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {level.skills.map((skill, i) => (
                                    <motion.span 
                                      key={i}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="text-xs px-3 py-1.5 rounded-full bg-background/70 text-foreground"
                                    >
                                      {skill}
                                    </motion.span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Time Estimate */}
                            <div className="mt-4 p-3 rounded-lg bg-background/50 flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Estimated completion by this level:
                              </span>
                              <span className="font-semibold text-foreground">
                                ~{level.cumulativeMonths} months total
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Final Achievement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative ml-14 md:ml-20 mt-4"
        >
          <div className="absolute -left-14 md:-left-20 top-4 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 border-4 border-primary text-primary-foreground">
            <Trophy className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="p-4 md:p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30">
            <h3 className="text-lg font-bold text-primary mb-1">CGMA Designation</h3>
            <p className="text-sm text-muted-foreground">
              Congratulations! Upon completing all levels and meeting the practical experience requirements, 
              you'll earn the prestigious Chartered Global Management Accountant (CGMA) designation.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QualificationTimeline;
