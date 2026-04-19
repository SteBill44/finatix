import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, LayoutDashboard, User, GraduationCap, Layers, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user
    ? [
        { icon: Home, label: "Home", path: "/" },
        { icon: BookOpen, label: "Courses", path: "/courses" },
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Layers, label: "Flashcards", path: "/flashcards" },
        { icon: Bot, label: "AI Tutor", path: "/ai-tutor" },
        { icon: User, label: "Account", path: "/account" },
      ]
    : [
        { icon: Home, label: "Home", path: "/" },
        { icon: BookOpen, label: "Courses", path: "/courses" },
        { icon: GraduationCap, label: "Pricing", path: "/pricing" },
        { icon: User, label: "Sign In", path: "/auth" },
      ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-sm border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-0.5 transition-colors ${
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className={`w-5 h-5 mb-1 ${isActive(item.path) ? "scale-110" : ""} transition-transform`} />
            <span className="text-[9px] font-medium truncate max-w-full">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
