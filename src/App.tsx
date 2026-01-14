import { useState, lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import ScrollToTop from "@/components/ScrollToTop";
import LoadingScreen from "@/components/LoadingScreen";
import PageTransition from "@/components/PageTransition";
import CookieConsent from "@/components/CookieConsent";
import FaviconManager from "@/components/FaviconManager";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy load all page components
const Index = lazy(() => import("./pages/Index"));
const WhyCIMA = lazy(() => import("./pages/WhyCIMA"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Quiz = lazy(() => import("./pages/Quiz"));
const ExamMode = lazy(() => import("./pages/ExamMode"));
const MockExam = lazy(() => import("./pages/MockExam"));
const Admin = lazy(() => import("./pages/Admin"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Discussions = lazy(() => import("./pages/Discussions"));
const ManageAccount = lazy(() => import("./pages/ManageAccount"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const HelpCentre = lazy(() => import("./pages/HelpCentre"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CertificatePreviewPage = lazy(() => import("./pages/CertificatePreviewPage"));
const CertificateVerify = lazy(() => import("./pages/CertificateVerify"));
const Certificates = lazy(() => import("./pages/Certificates"));

// Configure QueryClient with global error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on auth errors or 4xx errors
        const err = error as { status?: number; message?: string };
        if (err.status && err.status >= 400 && err.status < 500) {
          return false;
        }
        // Retry up to 2 times for network/server errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 30 * 1000, // 30 seconds default
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/why-cima" element={<PageTransition><WhyCIMA /></PageTransition>} />
          <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
          <Route path="/courses/:courseId" element={<PageTransition><CourseDetail /></PageTransition>} />
          <Route path="/courses/:courseId/lesson/:lessonId" element={<PageTransition><Lesson /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/quiz/:quizId" element={<PageTransition><Quiz /></PageTransition>} />
          <Route path="/exam/:quizId" element={<PageTransition><ExamMode /></PageTransition>} />
          <Route path="/mock-exam/:quizId" element={<PageTransition><MockExam /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
          <Route path="/achievements" element={<PageTransition><Achievements /></PageTransition>} />
          <Route path="/discussions" element={<PageTransition><Discussions /></PageTransition>} />
          <Route path="/account" element={<PageTransition><ManageAccount /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/cookies" element={<PageTransition><CookiePolicy /></PageTransition>} />
          <Route path="/help" element={<PageTransition><HelpCentre /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/certificate-preview" element={<PageTransition><CertificatePreviewPage /></PageTransition>} />
          <Route path="/verify" element={<PageTransition><CertificateVerify /></PageTransition>} />
          <Route path="/certificates" element={<PageTransition><Certificates /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" attribute="class" enableSystem={true}>
        <FaviconManager />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CookieConsentProvider>
              <TooltipProvider>
                {isLoading && (
                  <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
                )}
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <AnimatedRoutes />
                  <CookieConsent />
                </BrowserRouter>
              </TooltipProvider>
            </CookieConsentProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
