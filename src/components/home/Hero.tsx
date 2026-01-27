import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import FinatixLogo from "@/components/FinatixLogo";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-12 hex-pattern hero-gradient-light overflow-hidden -mt-16">
      {/* Top gradient fade for smooth navbar transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-[1]" />
      
      {/* Animated gradient orbs for light mode visual interest */}
      <div className="gradient-orb gradient-orb-primary w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] -top-20 -left-20 pointer-events-none" />
      <div className="gradient-orb gradient-orb-accent w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] top-1/3 -right-20 pointer-events-none" />
      <div className="gradient-orb gradient-orb-primary w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bottom-20 left-1/4 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="max-w-2xl">
            {/* Heading */}
            <h1 className="animate-fade-up text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
              KICKSTART{" "}
              <span className="text-primary drop-shadow-sm">YOUR CAREER</span>{" "}
              IN MANAGEMENT ACCOUNTING
            </h1>

            {/* Subheading */}
            <p className="animate-fade-up-delay-1 text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
              Master CIMA with modern, competency-based training trusted by leading professionals worldwide
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link 
                to="/auth?mode=signup"
                className="opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]"
              >
                <Button 
                  size="xl" 
                  className="shadow-lg shadow-primary/20 group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
                >
                  Register for Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link 
                to="/courses"
                className="opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]"
              >
                <Button 
                  size="xl" 
                  variant="outline" 
                  className="shadow-sm bg-background/80 backdrop-blur-sm group transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary/50"
                >
                  <BookOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Explore courses
                </Button>
              </Link>
              <Link 
                to="/why-cima"
                className="opacity-0 animate-[fade-in_0.5s_ease-out_0.7s_forwards]"
              >
                <Button 
                  size="xl" 
                  variant="outline" 
                  className="shadow-sm bg-background/80 backdrop-blur-sm group transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary/50"
                >
                  <GraduationCap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Why CIMA?
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Laptop Mockup */}
          <div className="hidden lg:flex justify-center items-center opacity-0 animate-[fade-in_0.8s_ease-out_0.4s_forwards]">
            <div className="relative">
              {/* Laptop Frame */}
              <div className="relative">
                {/* Screen */}
                <div className="w-[500px] h-[320px] bg-slate-900 rounded-t-xl border-[8px] border-slate-800 shadow-2xl overflow-hidden">
                  {/* Screen Content - Platform Interface */}
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 overflow-hidden">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FinatixLogo className="w-6 h-6" />
                        <span className="text-white font-semibold text-sm">Finatix</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full" />
                        <div className="w-16 h-2 bg-slate-700 rounded-full" />
                        <div className="w-16 h-2 bg-slate-700 rounded-full" />
                      </div>
                    </div>
                    
                    {/* Main Content Area */}
                    <div className="grid grid-cols-3 gap-3 h-[calc(100%-60px)]">
                      {/* Sidebar */}
                      <div className="col-span-1 bg-slate-800/50 rounded-lg p-3 space-y-2">
                        <div className="w-full h-3 bg-primary/40 rounded" />
                        <div className="w-3/4 h-2 bg-slate-700 rounded" />
                        <div className="w-full h-2 bg-slate-700 rounded" />
                        <div className="w-5/6 h-2 bg-slate-700 rounded" />
                        <div className="w-2/3 h-2 bg-slate-700 rounded" />
                        <div className="mt-4 w-full h-16 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg" />
                      </div>
                      
                      {/* Main Area */}
                      <div className="col-span-2 space-y-3">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-2 border border-primary/20">
                            <div className="w-6 h-6 bg-primary/30 rounded-full mb-1" />
                            <div className="w-8 h-3 bg-primary/40 rounded mb-1" />
                            <div className="w-12 h-2 bg-slate-700 rounded" />
                          </div>
                          <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-2 border border-accent/20">
                            <div className="w-6 h-6 bg-accent/30 rounded-full mb-1" />
                            <div className="w-10 h-3 bg-accent/40 rounded mb-1" />
                            <div className="w-12 h-2 bg-slate-700 rounded" />
                          </div>
                          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg p-2 border border-emerald-500/20">
                            <div className="w-6 h-6 bg-emerald-500/30 rounded-full mb-1" />
                            <div className="w-8 h-3 bg-emerald-500/40 rounded mb-1" />
                            <div className="w-12 h-2 bg-slate-700 rounded" />
                          </div>
                        </div>
                        
                        {/* Chart Area */}
                        <div className="bg-slate-800/50 rounded-lg p-3 h-32 flex items-end gap-1">
                          {/* Bar Chart */}
                          <div className="flex-1 flex items-end justify-around gap-1 h-full">
                            <div className="w-4 bg-gradient-to-t from-primary to-primary/50 rounded-t h-[40%]" />
                            <div className="w-4 bg-gradient-to-t from-primary to-primary/50 rounded-t h-[60%]" />
                            <div className="w-4 bg-gradient-to-t from-primary to-primary/50 rounded-t h-[45%]" />
                            <div className="w-4 bg-gradient-to-t from-primary to-primary/50 rounded-t h-[80%]" />
                            <div className="w-4 bg-gradient-to-t from-primary to-primary/50 rounded-t h-[55%]" />
                            <div className="w-4 bg-gradient-to-t from-accent to-accent/50 rounded-t h-[90%]" />
                            <div className="w-4 bg-gradient-to-t from-accent to-accent/50 rounded-t h-[70%]" />
                          </div>
                        </div>
                        
                        {/* Progress List */}
                        <div className="bg-slate-800/50 rounded-lg p-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full w-4/5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full w-3/5 bg-gradient-to-r from-primary to-primary/70 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Laptop Base/Keyboard */}
                <div className="w-[540px] h-4 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl mx-auto relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-600 rounded-b-lg" />
                </div>
                <div className="w-[600px] h-2 bg-gradient-to-b from-slate-800 to-slate-900 rounded-b-lg mx-auto shadow-lg" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;