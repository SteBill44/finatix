import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useUserStreak } from "@/hooks/useGamification";
import { Flame, Trophy, ChevronRight } from "lucide-react";

const StreakWidget = () => {
  const { data: streak } = useUserStreak();

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  // Days of the week indicator
  const today = new Date().getDay();
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card className="p-5 bg-gradient-to-br from-orange/10 via-orange/5 to-transparent border-orange/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Study Streak</h3>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </div>
        </div>
        <Link 
          to="/achievements" 
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>
        <div className="bg-background/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
          </div>
          <p className="text-xs text-muted-foreground">Best</p>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="flex justify-between gap-1">
        {daysOfWeek.map((day, index) => {
          const isToday = index === today;
          const isPast = index < today;
          // Simplified: show filled for days up to streak count within this week
          const isActive = isPast && currentStreak > 0 && index >= today - Math.min(currentStreak, today);
          
          return (
            <div
              key={index}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium transition-all ${
                isToday
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : isActive
                  ? "bg-orange/80 text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default StreakWidget;
