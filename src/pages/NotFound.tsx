import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, BookOpen, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Geometric F Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-teal-600 shadow-xl shadow-teal-500/30 flex items-center justify-center">
              <svg 
                viewBox="0 0 100 100" 
                className="w-12 h-12"
                fill="none"
              >
                <path
                  d="M25 20 L70 20 L70 32 L45 32 L45 45 L65 45 L65 57 L45 57 L45 80 L33 80 L33 32 L25 32 L25 20 Z"
                  fill="white"
                />
                <path
                  d="M60 20 L70 20 L70 30 Z"
                  fill="rgba(255,255,255,0.6)"
                />
              </svg>
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-8xl font-bold text-foreground mb-2">
            4<span className="text-primary">0</span>4
          </h1>

          {/* Error Message */}
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track with your CIMA studies.
          </p>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link to="/">
              <Button className="w-full sm:w-auto gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <BookOpen className="w-4 h-4" />
                Explore Courses
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Need help?</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link 
                to="/help" 
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                Help Centre
              </Link>
              <Link 
                to="/contact" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Contact Support
              </Link>
              <button 
                onClick={() => window.history.back()} 
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
