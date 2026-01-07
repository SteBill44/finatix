import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, LogOut, User, Shield, Trophy, MessageSquare, Settings, LayoutDashboard, Layers, CalendarDays, Award } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, first_name, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data) {
          setFirstName(data.first_name || data.full_name?.split(" ")[0] || null);
          setAvatarUrl(data.avatar_url);
        }
      } else {
        setFirstName(null);
        setAvatarUrl(null);
      }
    };
    
    fetchProfile();
  }, [user]);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "EXPLORE COURSES", path: "/courses" },
    { name: "PRICING", path: "/pricing" },
    { name: "CONTACT", path: "/contact" },
    ...(user ? [{ name: "DASHBOARD", path: "/dashboard" }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              Fin<span className="text-primary">aptics</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-medium tracking-wide transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                      {firstName || user.email?.split("@")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/flashcards" className="cursor-pointer flex items-center">
                      <Layers className="w-4 h-4 mr-2" />
                      Flashcards
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/study-planner" className="cursor-pointer flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Study Planner
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/certificates" className="cursor-pointer flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Certificates
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/achievements" className="cursor-pointer flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      Achievements
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/discussions" className="cursor-pointer flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Discussions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Account
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth?mode=login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  SIGN IN
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 text-foreground rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <motion.div 
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="py-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
              >
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-3 text-sm font-medium tracking-wide rounded-lg mx-2 transition-all duration-200 ${
                          isActive(link.path)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="flex flex-col gap-2 pt-4 mt-2 mx-2 border-t border-border"
                >
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link to="/achievements" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                          <Trophy className="w-4 h-4" />
                          Achievements
                        </Button>
                      </Link>
                      <Link to="/flashcards" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                          <Layers className="w-4 h-4" />
                          Flashcards
                        </Button>
                      </Link>
                      <Link to="/study-planner" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                          <CalendarDays className="w-4 h-4" />
                          Study Planner
                        </Button>
                      </Link>
                      <Link to="/certificates" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                          <Award className="w-4 h-4" />
                          Certificates
                        </Button>
                      </Link>
                      <Link to="/discussions" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                          <MessageSquare className="w-4 h-4" />
                          Discussions
                        </Button>
                      </Link>
                      <Link to="/account" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                          <Settings className="w-4 h-4" />
                          Manage Account
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                            <Shield className="w-4 h-4" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to="/auth?mode=login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full h-11">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full h-11">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;