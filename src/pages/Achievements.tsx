import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, useUserBadges, useUserStreak, useLeaderboard, useUpdateStreak } from "@/hooks/useGamification";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Award, Target, Lock, Crown, Medal, Star } from "lucide-react";
import { useEffect } from "react";

const Achievements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allBadges, isLoading: badgesLoading } = useBadges();
  const { data: userBadges } = useUserBadges();
  const { data: streak } = useUserStreak();
  const { data: leaderboard } = useLeaderboard(10);
  const updateStreak = useUpdateStreak();

  // Update streak when user visits achievements page
  useEffect(() => {
    if (user) {
      updateStreak.mutate();
    }
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view achievements</h1>
          <p className="text-muted-foreground mb-6">Track your badges, streaks, and compete on the leaderboard</p>
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </Layout>
    );
  }

  const earnedBadgeIds = userBadges?.map((ub) => ub.badge_id) || [];
  const categorizedBadges = allBadges?.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof allBadges>) || {};

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground font-medium">{index + 1}</span>;
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Achievements</h1>
          <p className="text-muted-foreground text-lg">Track your progress and compete with fellow students</p>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold">{streak?.current_streak || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  <p className="text-3xl font-bold">{streak?.longest_streak || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-purple-500/10 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <Award className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-3xl font-bold">{userBadges?.length || 0} / {allBadges?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Badges Section */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Badges
            </h2>

            {badgesLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading badges...</div>
            ) : (
              Object.entries(categorizedBadges).map(([category, badges]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{category} Badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {badges?.map((badge) => {
                        const isEarned = earnedBadgeIds.includes(badge.id);
                        return (
                          <div
                            key={badge.id}
                            className={`relative p-4 rounded-xl border text-center transition-all ${
                              isEarned
                                ? "bg-primary/5 border-primary/30"
                                : "bg-muted/30 border-border opacity-60"
                            }`}
                          >
                            {!isEarned && (
                              <div className="absolute top-2 right-2">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <p className="font-medium text-sm">{badge.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                            {isEarned && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Earned
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="min-w-0">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Leaderboard
            </h2>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Streakers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leaderboard?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No data yet</p>
                ) : (
                  leaderboard?.map((entry, index) => {
                    const profile = entry.profile;
                    const displayName = profile?.full_name || 
                      profile?.first_name || "Anonymous";
                    const isCurrentUser = entry.user_id === user?.id;

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isCurrentUser ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex-shrink-0">{getRankIcon(index)}</div>
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-secondary text-sm">
                            {getInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {displayName}
                            {isCurrentUser && (
                              <span className="text-primary ml-1">(You)</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress 
                              value={Math.min((entry.current_streak || 0) / 30 * 100, 100)} 
                              className="h-1.5 flex-1"
                            />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {entry.current_streak || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Streak Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Streak Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Complete at least one lesson daily to maintain your streak</p>
                <p>• Visit the platform daily to keep your streak alive</p>
                <p>• Longer streaks unlock special achievements</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Achievements;
