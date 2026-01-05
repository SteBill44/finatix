import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import LoadingScreen from "@/components/LoadingScreen";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Lesson from "./pages/Lesson";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Quiz from "./pages/Quiz";
import ExamMode from "./pages/ExamMode";
import MockExam from "./pages/MockExam";
import Admin from "./pages/Admin";
import Achievements from "./pages/Achievements";
import Discussions from "./pages/Discussions";
import ManageAccount from "./pages/ManageAccount";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
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
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/cookies" element={<PageTransition><Cookies /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ThemeProvider defaultTheme="system" attribute="class" enableSystem={true}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            {isLoading && (
              <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
            )}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
