import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  useNotificationsInbox,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotificationsInbox";
import { formatDistanceToNow } from "date-fns";

const typeColors: Record<string, string> = {
  enrollment: "bg-blue-500",
  achievement: "bg-yellow-500",
  quiz_result: "bg-green-500",
  announcement: "bg-primary",
  reminder: "bg-purple-500",
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotificationsInbox();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const recent = notifications.slice(0, 8);

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto bg-popover border border-border">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="text-sm font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {recent.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          recent.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer ${!n.is_read ? "bg-primary/5" : ""}`}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${typeColors[n.type] || "bg-muted-foreground"}`}
                  />
                  <span className="text-xs font-medium truncate">{n.title}</span>
                </div>
                {!n.is_read && (
                  <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 ml-4">{n.message}</p>
              <span className="text-[10px] text-muted-foreground/60 ml-4">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </span>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/notifications"
            className="flex items-center justify-center gap-1.5 text-xs text-primary py-2"
            onClick={() => setOpen(false)}
          >
            View all notifications
            <ExternalLink className="w-3 h-3" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
