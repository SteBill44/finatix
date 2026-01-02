import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLeaderboard, LeaderboardEntry } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, ChevronRight, Flame } from "lucide-react";

const LeaderboardPreview = () => {
  const { data: leaderboard } = useLeaderboard(5);
  const { user } = useAuth();

  if (!leaderboard || leaderboard.length === 0) {
    return null;
  }

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return "text-yellow-500";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-orange";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Leaderboard</h3>
            <p className="text-xs text-muted-foreground">Top learners</p>
          </div>
        </div>
        <Link 
          to="/achievements" 
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="space-y-2">
        {leaderboard.map((entry: LeaderboardEntry, index: number) => {
          const isCurrentUser = entry.user_id === user?.id;
          const profile = entry.profile;
          const displayName = profile?.full_name || profile?.first_name || "Learner";
          const initials = displayName.substring(0, 2).toUpperCase();

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
              }`}
            >
              <span className={`w-5 text-sm font-bold ${getMedalColor(index)}`}>
                {index + 1}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-secondary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                  {isCurrentUser ? "You" : displayName}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="w-3.5 h-3.5 text-orange" />
                <span className="font-medium">{entry.current_streak || 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default LeaderboardPreview;
