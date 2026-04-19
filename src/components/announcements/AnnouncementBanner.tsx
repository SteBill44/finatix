import { useState } from "react";
import { X, Info, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnnouncements, type Announcement } from "@/hooks/useAnnouncements";
import { useAuth } from "@/contexts/AuthContext";

const typeConfig = {
  info: {
    icon: Info,
    className: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    iconClass: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
    iconClass: "text-yellow-500",
  },
  success: {
    icon: CheckCircle,
    className: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
    iconClass: "text-green-500",
  },
  urgent: {
    icon: Zap,
    className: "bg-primary/10 border-primary/30 text-primary",
    iconClass: "text-primary",
  },
};

function SingleBanner({
  announcement,
  onDismiss,
}: {
  announcement: Announcement;
  onDismiss: (id: string) => void;
}) {
  const config = typeConfig[announcement.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`border-b ${config.className}`}
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
        <Icon className={`w-4 h-4 flex-shrink-0 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{announcement.title}: </span>
          <span className="text-sm opacity-90">{announcement.message}</span>
        </div>
        <button
          onClick={() => onDismiss(announcement.id)}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function AnnouncementBanner() {
  const { user } = useAuth();
  const { data: announcements = [] } = useAnnouncements();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (!user) return null;

  const visible = announcements.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40">
      <AnimatePresence>
        {visible.map((a) => (
          <SingleBanner key={a.id} announcement={a} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
