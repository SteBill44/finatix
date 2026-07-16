import { ReactNode } from "react";
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

  return (
    <div className="min-h-screen flex flex-col relative">
      <ScrollProgressBar />
      <NetworkStatusIndicator />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-br from-background via-[hsl(25,95%,92%)] to-[hsl(25,95%,85%)] dark:from-background dark:via-[hsl(25,40%,14%)] dark:to-[hsl(210,11%,10%)]" />
      <Navbar />
      <AnnouncementBanner />
      <main className="flex-1 pt-16 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer className="hidden lg:block" />
      <MobileBottomNav />
      <BackToTop />
      <OfflineBanner />
    </div>
  );
};

export default Layout;
