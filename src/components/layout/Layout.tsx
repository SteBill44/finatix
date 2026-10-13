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
      <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none bg-background" />
      <Navbar />
      <AnnouncementBanner />
      {/* Ambient brand glow + fine grid at the top of every page (decorative) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[900px] overflow-hidden">
        <div className="hero-atmosphere absolute inset-0" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </div>
      <main className="relative z-[1] flex-1 pt-16 pb-20 lg:pb-0">
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
