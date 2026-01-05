import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, LayoutDashboard, User, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Courses", path: "/courses" },
    ...(user 
      ? [{ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" }]
      : []
    ),
    { icon: GraduationCap, label: "Pricing", path: "/pricing" },
    { icon: User, label: user ? "Account" : "Sign In", path: user ? "/account" : "/auth" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom shadow-lg"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 py-2 px-1 group"
            >
              {/* Active indicator pill */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-2 top-1 bottom-1 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative z-10 flex flex-col items-center"
              >
                <motion.div
                  animate={{ 
                    scale: active ? 1.15 : 1,
                    y: active ? -2 : 0
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <item.icon 
                    className={`w-5 h-5 mb-0.5 transition-colors duration-200 ${
                      active 
                        ? "text-primary" 
                        : "text-muted-foreground group-hover:text-foreground"
                    }`} 
                  />
                </motion.div>
                <span 
                  className={`text-[10px] font-medium truncate max-w-full transition-colors duration-200 ${
                    active 
                      ? "text-primary" 
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNav;
