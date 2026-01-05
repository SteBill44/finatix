import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, LogOut, User, Shield, Trophy, MessageSquare, Settings, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import finaptixLogo from "@/assets/finaptix-logo.png";
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
            <img src={finaptixLogo} alt="Finaptix" className="h-8 w-auto" />
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
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 text-xs font-medium tracking-wide transition-colors duration-200 ${
                    isActive(link.path)
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/achievements" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Achievements
                      </Button>
                    </Link>
                    <Link to="/discussions" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Discussions
                      </Button>
                    </Link>
                    <Link to="/account" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Manage Account
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full text-destructive"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;