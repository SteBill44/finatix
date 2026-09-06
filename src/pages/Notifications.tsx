import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Bell, CheckCheck, Info, Trophy, BookOpen, MessageSquare, Zap } from "lucide-react";
import {
  useNotificationsInbox,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotificationsInbox";
import { formatDistanceToNow } from "date-fns";

const typeIcon: Record<string, React.ReactNode> = {
  enrollment: <BookOpen className="w-4 h-4 text-blue-500" />,
  achievement: <Trophy className="w-4 h-4 text-yellow-500" />,
  quiz_result: <Zap className="w-4 h-4 text-green-500" />,
  discussion_reply: <MessageSquare className="w-4 h-4 text-purple-500" />,
  announcement: <Info className="w-4 h-4 text-primary" />,
};

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotificationsInbox();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unread = notifications.filter((n) => !n.is_read);

  return (
    <Layout>
      <SEOHead title="Notifications" noIndex />
      <div className="pt-24 lg:pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold uppercase"><span className="text-gradient-brand">Notifications</span></h1>
              {unread.length > 0 && (
                <Badge variant="default" className="text-xs">
                  {unread.length} unread
                </Badge>
              )}
            </div>
            {unread.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="w-4 h-4 mr-1.5" />
                Mark all read
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Bell className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
                  You'll receive notifications about your enrollments, quiz results, achievements, and announcements here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <Card
                  key={n.id}
                  className={`cursor-pointer transition-colors hover:bg-secondary/50 ${!n.is_read ? "border-primary/30 bg-primary/5" : ""}`}
                  onClick={() => !n.is_read && markRead.mutate(n.id)}
                >
                  <CardContent className="flex items-start gap-3 py-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {typeIcon[n.type] || <Bell className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium">{n.title}</p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
