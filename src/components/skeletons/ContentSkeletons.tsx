import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

// Stagger animation for skeleton groups
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const CourseCardSkeleton = () => {
  return (
    <motion.div variants={staggerItem}>
      <Card className="overflow-hidden">
        <Skeleton className="h-48 w-full rounded-none" />
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export const CourseGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </motion.div>
  );
};

export const LessonCardSkeleton = () => {
  return (
    <motion.div variants={staggerItem} className="flex items-center gap-4 p-4 border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
    </motion.div>
  );
};

export const LessonListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <LessonCardSkeleton key={i} />
      ))}
    </motion.div>
  );
};

export const LessonContentSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </motion.div>
  );
};

export const DashboardCardSkeleton = () => {
  return (
    <motion.div variants={staggerItem}>
      <Card className="p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 sm:h-8 w-16" />
            <Skeleton className="h-3 sm:h-4 w-20" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const DashboardStatsSkeleton = () => {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </motion.div>
  );
};

export const CourseProgressSkeleton = () => {
  return (
    <motion.div variants={staggerItem} className="p-4 bg-secondary/50 rounded-xl">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </motion.div>
  );
};

export const CourseProgressGridSkeleton = ({ count = 2 }: { count?: number }) => {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid sm:grid-cols-2 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CourseProgressSkeleton key={i} />
      ))}
    </motion.div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4"
    >
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </motion.div>
  );
};

export const QuickActionsSkeleton = () => {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div key={i} variants={staggerItem}>
          <Card className="p-4">
            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:mb-3 flex-shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export const StreakWidgetSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="w-5 h-5" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
        <div className="flex justify-between gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export const LeaderboardSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

// Full Dashboard Loading Skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      <DashboardStatsSkeleton />
      
      {/* Resume card skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex-shrink-0" />
              <div className="space-y-2 min-w-0">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <CourseProgressGridSkeleton count={2} />
          </div>

          {/* Quick Actions */}
          <QuickActionsSkeleton />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StreakWidgetSkeleton />
          <LeaderboardSkeleton />
        </div>
      </div>
    </div>
  );
};
