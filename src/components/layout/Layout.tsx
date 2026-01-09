import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import DynamicBackground from "../DynamicBackground";
import ScrollProgressBar from "../ScrollProgressBar";
import { useTrackUserPresence } from "@/hooks/useActiveUsers";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Track user presence for real-time active users counter
  useTrackUserPresence();

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <ScrollProgressBar />
      <DynamicBackground />
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer className="hidden lg:block" />
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
