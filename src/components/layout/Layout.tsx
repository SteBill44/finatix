import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

import ScrollProgressBar from "../ScrollProgressBar";
import BackToTop from "../BackToTop";
import { NetworkStatusIndicator, OfflineBanner } from "../NetworkStatusIndicator";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { useTrackUserPresence } from "@/hooks/useActiveUsers";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useTrackUserPresence();
  const { pathname } = useLocation();
  const study = /^\/(dashboard|account|flashcards|quiz|practice|exam|mock-exam|achievements|discussions|certificates|notifications|referrals|admin)(\/|$)/.test(pathname) || pathname.includes("/lesson/");

  return (
    <div className={`min-h-screen flex flex-col relative ${study ? "study-surface" : "marketing-surface"}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-3 focus:z-[100] focus:bg-card focus:p-3">Skip to content</a>
      <ScrollProgressBar />
      <NetworkStatusIndicator />
      <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none bg-background" />
      <Navbar />
      <AnnouncementBanner />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-16 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <BackToTop />
      <OfflineBanner />
    </div>
  );
};

export default Layout;
