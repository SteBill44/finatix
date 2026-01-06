import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import DynamicBackground from "../DynamicBackground";
import ScrollProgressBar from "../ScrollProgressBar";
import AIChatWidget from "../AIChatWidget";

interface LayoutProps {
  children: ReactNode;
  courseId?: string;
}

const Layout = ({ children, courseId }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <ScrollProgressBar />
      <DynamicBackground />
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer className="hidden lg:block" />
      <MobileBottomNav />
      <AIChatWidget courseId={courseId} />
    </div>
  );
};

export default Layout;
