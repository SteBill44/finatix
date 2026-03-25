import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { AdminViewProvider } from "@/contexts/AdminViewContext";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import ScrollToTop from "@/components/ScrollToTop";

import PageTransition from "@/components/PageTransition";
import CookieConsent from "@/components/CookieConsent";

import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FeatureErrorBoundary } from "@/components/FeatureErrorBoundary";
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
const Referrals = lazy(() => import("./pages/Referrals"));
const PracticeMode = lazy(() => import("./pages/PracticeMode"));
const Brand = lazy(() => import("./pages/Brand"));

// Configure QueryClient with global error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const err = error as { status?: number; message?: string };
        if (err.status && err.status >= 400 && err.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
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

// Helper to wrap protected routes with error boundary
const Protected = ({ children, feature }: { children: React.ReactNode; feature: string }) => (
  <ProtectedRoute>
    <FeatureErrorBoundary featureName={feature}>
      <PageTransition>{children}</PageTransition>
    </FeatureErrorBoundary>
  </ProtectedRoute>
);

// Helper to wrap public routes with error boundary
const Public = ({ children, feature }: { children: React.ReactNode; feature: string }) => (
  <FeatureErrorBoundary featureName={feature}>
    <PageTransition>{children}</PageTransition>
  </FeatureErrorBoundary>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<Public feature="Home"><Index /></Public>} />
          <Route path="/why-cima" element={<Public feature="Why CIMA"><WhyCIMA /></Public>} />
          <Route path="/courses" element={<Public feature="Courses"><Courses /></Public>} />
          <Route path="/courses/:courseId" element={<Public feature="Course Detail"><CourseDetail /></Public>} />
          <Route path="/pricing" element={<Public feature="Pricing"><Pricing /></Public>} />
          <Route path="/about" element={<Public feature="About"><About /></Public>} />
          <Route path="/contact" element={<Public feature="Contact"><Contact /></Public>} />
          <Route path="/auth" element={<Public feature="Authentication"><Auth /></Public>} />
          <Route path="/privacy" element={<Public feature="Privacy Policy"><PrivacyPolicy /></Public>} />
          <Route path="/cookies" element={<Public feature="Cookie Policy"><CookiePolicy /></Public>} />
          <Route path="/help" element={<Public feature="Help Centre"><HelpCentre /></Public>} />
          <Route path="/terms" element={<Public feature="Terms of Service"><TermsOfService /></Public>} />
          <Route path="/verify" element={<Public feature="Certificate Verification"><CertificateVerify /></Public>} />
          <Route path="/brand" element={<Public feature="Brand"><Brand /></Public>} />

          {/* Protected routes - require authentication */}
          <Route path="/courses/:courseId/lesson/:lessonId" element={<Protected feature="Lesson"><Lesson /></Protected>} />
          <Route path="/dashboard" element={<Protected feature="Dashboard"><Dashboard /></Protected>} />
          <Route path="/quiz/:quizId" element={<Protected feature="Quiz"><Quiz /></Protected>} />
          <Route path="/exam/:quizId" element={<Protected feature="Exam"><ExamMode /></Protected>} />
          <Route path="/mock-exam/:quizId" element={<Protected feature="Mock Exam"><MockExam /></Protected>} />
          <Route path="/admin" element={<Protected feature="Admin"><Admin /></Protected>} />
          <Route path="/achievements" element={<Protected feature="Achievements"><Achievements /></Protected>} />
          <Route path="/discussions" element={<Protected feature="Discussions"><Discussions /></Protected>} />
          <Route path="/account" element={<Protected feature="Account"><ManageAccount /></Protected>} />
          <Route path="/certificate-preview" element={<Protected feature="Certificate Preview"><CertificatePreviewPage /></Protected>} />
          <Route path="/certificates" element={<Protected feature="Certificates"><Certificates /></Protected>} />
          <Route path="/referrals" element={<Protected feature="Referrals"><Referrals /></Protected>} />
          <Route path="/practice/:courseSlug" element={<Protected feature="Practice Mode"><PracticeMode /></Protected>} />

          <Route path="*" element={<Public feature="Not Found"><NotFound /></Public>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" attribute="class" enableSystem={true}>
        
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AdminViewProvider>
              <CookieConsentProvider>
                <TooltipProvider>
                  <Sonner />
                  <BrowserRouter>
                    <PerformanceProvider>
                      <ScrollToTop />
                      <AnimatedRoutes />
                      <CookieConsent />
                    </PerformanceProvider>
                  </BrowserRouter>
                </TooltipProvider>
              </CookieConsentProvider>
            </AdminViewProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
