import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import Background3D from "../three/Background3D";
import ScrollProgressBar from "../ScrollProgressBar";
import BackToTop from "../BackToTop";
import { NetworkStatusIndicator, OfflineBanner } from "../NetworkStatusIndicator";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { useTrackUserPresence } from "@/hooks/useActiveUsers";

interface LayoutProps {
  children: ReactNode;
  disableAnimations?: boolean;
}

const Layout = ({ children, disableAnimations = false }: LayoutProps) => {
  useTrackUserPresence();

  return (
    <div className="min-h-screen flex flex-col relative">
      {!disableAnimations && <ScrollProgressBar />}
      <NetworkStatusIndicator />
      
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
