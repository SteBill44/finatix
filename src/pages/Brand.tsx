import { useRef } from "react";
import { Navigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import Layout from "@/components/layout/Layout";
import FinatixLogo from "@/components/FinatixLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Brand = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const logo512Ref = useRef<HTMLDivElement>(null);
  const logo1024Ref = useRef<HTMLDivElement>(null);
  const twitterBannerRef = useRef<HTMLDivElement>(null);
  const facebookBannerRef = useRef<HTMLDivElement>(null);
  const instagramSquareRef = useRef<HTMLDivElement>(null);
  const instagramStoryRef = useRef<HTMLDivElement>(null);

  const downloadLogo = async (ref: React.RefObject<HTMLDivElement>, filename: string, scale: number = 4) => {
    if (!ref.current) return;

    try {
      const canvas = await html2canvas(ref.current, {
        backgroundColor: null,
        scale: scale,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `finatix-${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success(`${filename} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("Failed to download");
    }
  };

  if (authLoading || roleLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Brand Assets</h1>
          <p className="text-muted-foreground">
            Download official Finatix logos in various sizes for use across platforms.
          </p>
        </div>

        {/* Full Logo (Icon + Text) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Full Logo</CardTitle>
            <CardDescription>
              Complete logo with icon and wordmark — ideal for headers, documents, and presentations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
              <div
                ref={fullLogoRef}
                className="flex items-center gap-3"
                style={{ padding: "16px 24px" }}
              >
                <svg
                  viewBox="0 0 100 100"
                  width={64}
                  height={64}
                  fill="none"
                >
                  <defs>
                    <linearGradient id="brandFullLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                    fill="url(#brandFullLogoGradient)"
                  />
                  <g fill="#ffffff">
                    <rect x="32" y="28" width="12" height="44" />
                    <rect x="44" y="28" width="26" height="10" />
                    <rect x="44" y="46" width="18" height="10" />
                  </g>
                </svg>
                <span style={{ fontSize: "40px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  <span style={{ color: "#1a1a2e" }}>Fin</span>
                  <span style={{ color: "#0d9488" }}>atix</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => downloadLogo(fullLogoRef, "full-logo-dark", 6)}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Dark Text
              </Button>
              <Button
                onClick={() => downloadFullLogoLight()}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Light Text
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          {/* 512x512 Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo 512×512</CardTitle>
              <CardDescription>
                Perfect for profile pictures and app icons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
                <div 
                  ref={logo512Ref} 
                  className="flex items-center justify-center"
                  style={{ width: 128, height: 128 }}
                >
                  <svg 
                    viewBox="0 0 100 100" 
                    width={128}
                    height={128}
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="brandLogoGradient512" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                      fill="url(#brandLogoGradient512)"
                    />
                    <g fill="#ffffff">
                      <rect x="32" y="28" width="12" height="44" />
                      <rect x="44" y="28" width="26" height="10" />
                      <rect x="44" y="46" width="18" height="10" />
                    </g>
                  </svg>
                </div>
              </div>
              <Button 
                onClick={() => downloadLogo(logo512Ref, "logo-512x512", 4)}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG (512×512)
              </Button>
            </CardContent>
          </Card>

          {/* 1024x1024 Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo 1024×1024</CardTitle>
              <CardDescription>
                High resolution for social media and marketing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
                <div 
                  ref={logo1024Ref} 
                  className="flex items-center justify-center"
                  style={{ width: 128, height: 128 }}
                >
                  <svg 
                    viewBox="0 0 100 100" 
                    width={128}
                    height={128}
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="brandLogoGradient1024" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                      fill="url(#brandLogoGradient1024)"
                    />
                    <g fill="#ffffff">
                      <rect x="32" y="28" width="12" height="44" />
                      <rect x="44" y="28" width="26" height="10" />
                      <rect x="44" y="46" width="18" height="10" />
                    </g>
                  </svg>
                </div>
              </div>
              <Button 
                onClick={() => downloadLogo(logo1024Ref, "logo-1024x1024", 8)}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG (1024×1024)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Social Media Banners */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Social Media Banners</CardTitle>
            <CardDescription>
              Ready-to-use banners for social media platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Twitter/X Banner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Twitter/X Header</p>
                  <p className="text-sm text-muted-foreground">1500×500 pixels</p>
                </div>
                <Button 
                  onClick={() => downloadLogo(twitterBannerRef, "twitter-banner-1500x500", 2)}
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <div 
                  ref={twitterBannerRef}
                  className="relative flex items-center justify-center overflow-hidden"
                  style={{ 
                    width: "100%",
                    aspectRatio: "1500/500",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
                  }}
                >
                  {/* Gradient orbs */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-64 h-64 rounded-full bg-teal-500/20 blur-3xl -top-20 -left-20" />
                    <div className="absolute w-48 h-48 rounded-full bg-teal-400/15 blur-3xl bottom-0 right-20" />
                    <div className="absolute w-40 h-40 rounded-full bg-teal-600/20 blur-2xl top-1/2 left-1/3" />
                  </div>
                  {/* Tech graphics */}
                  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1500 500" fill="none">
                    <defs>
                      <linearGradient id="twitterLineGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path d="M0 400 Q 200 350 400 380 T 800 280 T 1200 200 T 1500 120" stroke="url(#twitterLineGradient)" strokeWidth="3" fill="none" />
                    <circle cx="400" cy="380" r="8" fill="#14b8a6" />
                    <circle cx="800" cy="280" r="8" fill="#14b8a6" />
                    <circle cx="1200" cy="200" r="8" fill="#14b8a6" />
                    {/* Bar chart */}
                    <g transform="translate(1150, 250)">
                      <rect x="0" y="50" width="35" height="100" rx="4" fill="#0d9488" fillOpacity="0.6" />
                      <rect x="50" y="20" width="35" height="130" rx="4" fill="#0d9488" fillOpacity="0.7" />
                      <rect x="100" y="-20" width="35" height="170" rx="4" fill="#14b8a6" fillOpacity="0.8" />
                      <rect x="150" y="-60" width="35" height="210" rx="4" fill="#14b8a6" fillOpacity="0.9" />
                    </g>
                    {/* Pie chart */}
                    <g transform="translate(200, 250)">
                      <circle cx="0" cy="0" r="50" fill="none" stroke="#1e293b" strokeWidth="12" />
                      <circle cx="0" cy="0" r="50" fill="none" stroke="#0d9488" strokeWidth="12" strokeDasharray="100 214" strokeDashoffset="0" opacity="0.7" />
                      <circle cx="0" cy="0" r="50" fill="none" stroke="#14b8a6" strokeWidth="12" strokeDasharray="70 244" strokeDashoffset="-100" opacity="0.7" />
                    </g>
                    {/* Hexagons */}
                    <polygon points="1350,80 1390,60 1430,80 1430,120 1390,140 1350,120" fill="none" stroke="#14b8a6" strokeWidth="2" opacity="0.5" />
                    <polygon points="350,420 380,405 410,420 410,450 380,465 350,450" fill="none" stroke="#0d9488" strokeWidth="2" opacity="0.4" />
                  </svg>
                  <div className="relative flex items-center gap-4 z-10">
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-16 h-16 md:w-20 md:h-20"
                      fill="none"
                    >
                      <defs>
                        <linearGradient id="twitterLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                        fill="url(#twitterLogoGradient)"
                      />
                      <g fill="#ffffff">
                        <rect x="32" y="28" width="12" height="44" />
                        <rect x="44" y="28" width="26" height="10" />
                        <rect x="44" y="46" width="18" height="10" />
                      </g>
                    </svg>
                    <span className="text-white text-2xl md:text-4xl font-bold tracking-tight drop-shadow-lg">
                      Fin<span className="text-primary">atix</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Facebook/LinkedIn Banner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Facebook/LinkedIn Cover</p>
                  <p className="text-sm text-muted-foreground">1200×630 pixels</p>
                </div>
                <Button 
                  onClick={() => downloadLogo(facebookBannerRef, "facebook-banner-1200x630", 2)}
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <div 
                  ref={facebookBannerRef}
                  className="relative flex items-center justify-center overflow-hidden"
                  style={{ 
                    width: "100%",
                    aspectRatio: "1200/630",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
                  }}
                >
                  {/* Gradient orbs */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-64 h-64 rounded-full bg-teal-500/20 blur-3xl -top-20 -left-20" />
                    <div className="absolute w-48 h-48 rounded-full bg-teal-400/15 blur-3xl bottom-0 right-10" />
                    <div className="absolute w-32 h-32 rounded-full bg-teal-600/20 blur-2xl top-1/2 left-1/4" />
                  </div>
                  {/* Tech graphics */}
                  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 630" fill="none">
                    <defs>
                      <linearGradient id="fbLineGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path d="M0 500 Q 150 450 300 480 T 600 350 T 900 280 T 1200 180" stroke="url(#fbLineGradient)" strokeWidth="3" fill="none" />
                    <circle cx="300" cy="480" r="8" fill="#14b8a6" />
                    <circle cx="600" cy="350" r="8" fill="#14b8a6" />
                    <circle cx="900" cy="280" r="8" fill="#14b8a6" />
                    {/* Bar chart */}
                    <g transform="translate(950, 350)">
                      <rect x="0" y="50" width="35" height="100" rx="4" fill="#0d9488" fillOpacity="0.6" />
                      <rect x="50" y="20" width="35" height="130" rx="4" fill="#0d9488" fillOpacity="0.7" />
                      <rect x="100" y="-20" width="35" height="170" rx="4" fill="#14b8a6" fillOpacity="0.8" />
                      <rect x="150" y="-60" width="35" height="210" rx="4" fill="#14b8a6" fillOpacity="0.9" />
                    </g>
                    {/* Pie chart */}
                    <g transform="translate(150, 200)">
                      <circle cx="0" cy="0" r="60" fill="none" stroke="#1e293b" strokeWidth="15" />
                      <circle cx="0" cy="0" r="60" fill="none" stroke="#0d9488" strokeWidth="15" strokeDasharray="120 260" strokeDashoffset="0" opacity="0.7" />
                      <circle cx="0" cy="0" r="60" fill="none" stroke="#14b8a6" strokeWidth="15" strokeDasharray="80 300" strokeDashoffset="-120" opacity="0.7" />
                    </g>
                    {/* Hexagons */}
                    <polygon points="1050,80 1090,60 1130,80 1130,120 1090,140 1050,120" fill="none" stroke="#14b8a6" strokeWidth="2" opacity="0.5" />
                    <polygon points="100,500 130,485 160,500 160,530 130,545 100,530" fill="none" stroke="#0d9488" strokeWidth="2" opacity="0.4" />
                  </svg>
                  <div className="relative flex flex-col items-center gap-3 z-10">
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-16 h-16 md:w-24 md:h-24"
                      fill="none"
                    >
                      <defs>
                        <linearGradient id="fbBannerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                        fill="url(#fbBannerGradient)"
                      />
                      <g fill="#ffffff">
                        <rect x="32" y="28" width="12" height="44" />
                        <rect x="44" y="28" width="26" height="10" />
                        <rect x="44" y="46" width="18" height="10" />
                      </g>
                    </svg>
                    <span className="text-white text-2xl md:text-4xl font-bold tracking-tight drop-shadow-lg">
                      Fin<span className="text-primary">atix</span>
                    </span>
                    <span className="text-white/70 text-xs md:text-sm font-medium tracking-wide">
                      Master CIMA with Confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Square */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Instagram Square</p>
                  <p className="text-sm text-muted-foreground">1080×1080 pixels</p>
                </div>
                <Button 
                  onClick={() => downloadLogo(instagramSquareRef, "instagram-square-1080x1080", 3)}
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border max-w-sm mx-auto">
                <div 
                  ref={instagramSquareRef}
                  className="relative flex items-center justify-center overflow-hidden"
                  style={{ 
                    width: "100%",
                    aspectRatio: "1/1",
                    background: "linear-gradient(145deg, #0d9488 0%, #0f766e 40%, #115e59 100%)"
                  }}
                >
                  {/* Dynamic orbs */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-48 h-48 rounded-full bg-white/15 blur-3xl -top-16 -right-16" />
                    <div className="absolute w-64 h-64 rounded-full bg-teal-300/10 blur-3xl bottom-0 -left-20" />
                    <div className="absolute w-32 h-32 rounded-full bg-white/10 blur-2xl top-1/2 right-1/4" />
                  </div>
                  {/* Tech pattern */}
                  <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 400 400" fill="none">
                    <path d="M50 350 Q 100 300 150 320 T 250 250 T 350 150" stroke="white" strokeWidth="2" fill="none" />
                    <circle cx="150" cy="320" r="5" fill="white" />
                    <circle cx="250" cy="250" r="5" fill="white" />
                    <circle cx="350" cy="150" r="5" fill="white" />
                    {/* Rising bars */}
                    <rect x="280" y="280" width="20" height="60" rx="3" fill="white" fillOpacity="0.25" />
                    <rect x="310" y="240" width="20" height="100" rx="3" fill="white" fillOpacity="0.3" />
                    <rect x="340" y="200" width="20" height="140" rx="3" fill="white" fillOpacity="0.35" />
                    <rect x="370" y="160" width="20" height="180" rx="3" fill="white" fillOpacity="0.4" />
                    {/* Hexagon */}
                    <polygon points="60,80 90,65 120,80 120,110 90,125 60,110" fill="none" stroke="white" strokeWidth="2" opacity="0.4" />
                  </svg>
                  <div className="relative flex flex-col items-center gap-4 z-10">
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-24 h-24"
                      fill="none"
                    >
                      <path
                        d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                        fill="rgba(255,255,255,0.2)"
                      />
                      <g fill="#ffffff">
                        <rect x="32" y="28" width="12" height="44" />
                        <rect x="44" y="28" width="26" height="10" />
                        <rect x="44" y="46" width="18" height="10" />
                      </g>
                    </svg>
                    <span className="text-white text-3xl font-bold tracking-tight drop-shadow-lg">
                      Fin<span className="opacity-90">atix</span>
                    </span>
                    <span className="text-white/80 text-sm font-medium tracking-wide">
                      Master CIMA with Confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Story */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Instagram Story</p>
                  <p className="text-sm text-muted-foreground">1080×1920 pixels</p>
                </div>
                <Button 
                  onClick={() => downloadLogo(instagramStoryRef, "instagram-story-1080x1920", 3)}
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border max-w-[200px] mx-auto">
                <div 
                  ref={instagramStoryRef}
                  className="relative flex items-center justify-center overflow-hidden"
                  style={{ 
                    width: "100%",
                    aspectRatio: "1080/1920",
                    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 30%, #0d9488 70%, #14b8a6 100%)"
                  }}
                >
                  {/* Gradient orbs */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-48 h-48 rounded-full bg-teal-500/30 blur-3xl top-1/4 -left-16" />
                    <div className="absolute w-64 h-64 rounded-full bg-teal-400/20 blur-3xl bottom-1/4 -right-20" />
                    <div className="absolute w-32 h-32 rounded-full bg-white/10 blur-2xl top-1/3 right-1/4" />
                  </div>
                  {/* Tech pattern */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 533" fill="none">
                    <path d="M0 450 Q 50 400 100 420 T 200 350 T 300 280" stroke="white" strokeWidth="2" fill="none" />
                    <circle cx="100" cy="420" r="4" fill="white" />
                    <circle cx="200" cy="350" r="4" fill="white" />
                    {/* Bars */}
                    <rect x="200" y="380" width="18" height="50" rx="3" fill="white" fillOpacity="0.3" />
                    <rect x="225" y="350" width="18" height="80" rx="3" fill="white" fillOpacity="0.35" />
                    <rect x="250" y="320" width="18" height="110" rx="3" fill="white" fillOpacity="0.4" />
                    <rect x="275" y="290" width="18" height="140" rx="3" fill="white" fillOpacity="0.45" />
                    {/* Top hexagon */}
                    <polygon points="40,60 65,47 90,60 90,85 65,98 40,85" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
                    {/* Pie chart */}
                    <g transform="translate(60, 180)">
                      <circle cx="0" cy="0" r="35" fill="none" stroke="white" strokeWidth="8" opacity="0.2" />
                      <circle cx="0" cy="0" r="35" fill="none" stroke="white" strokeWidth="8" strokeDasharray="70 150" strokeDashoffset="0" opacity="0.5" />
                    </g>
                  </svg>
                  <div className="relative flex flex-col items-center gap-3 z-10">
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-16 h-16"
                      fill="none"
                    >
                      <defs>
                        <linearGradient id="storyLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                        fill="url(#storyLogoGradient)"
                      />
                      <g fill="#ffffff">
                        <rect x="32" y="28" width="12" height="44" />
                        <rect x="44" y="28" width="26" height="10" />
                        <rect x="44" y="46" width="18" height="10" />
                      </g>
                    </svg>
                    <span className="text-white text-xl font-bold tracking-tight drop-shadow-lg">
                      Fin<span className="text-teal-300">atix</span>
                    </span>
                    <span className="text-white/70 text-[10px] font-medium tracking-wide text-center px-4">
                      Master CIMA with Confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo with Text */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Full Logo with Text</CardTitle>
            <CardDescription>
              The complete Finatix branding including wordmark
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-8 p-8 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Small</p>
                <FinatixLogo size="sm" linkTo={null} />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Medium</p>
                <FinatixLogo size="md" linkTo={null} />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Large</p>
                <FinatixLogo size="lg" linkTo={null} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>
              Official Finatix color palette
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div 
                  className="h-20 rounded-lg" 
                  style={{ background: "#0d9488" }}
                />
                <p className="text-sm font-medium">Primary Teal</p>
                <p className="text-xs text-muted-foreground">#0d9488</p>
              </div>
              <div className="space-y-2">
                <div 
                  className="h-20 rounded-lg" 
                  style={{ background: "#14b8a6" }}
                />
                <p className="text-sm font-medium">Secondary Teal</p>
                <p className="text-xs text-muted-foreground">#14b8a6</p>
              </div>
              <div className="space-y-2">
                <div 
                  className="h-20 rounded-lg border" 
                  style={{ background: "#ffffff" }}
                />
                <p className="text-sm font-medium">White</p>
                <p className="text-xs text-muted-foreground">#ffffff</p>
              </div>
              <div className="space-y-2">
                <div 
                  className="h-20 rounded-lg" 
                  style={{ background: "#0f172a" }}
                />
                <p className="text-sm font-medium">Dark</p>
                <p className="text-xs text-muted-foreground">#0f172a</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Brand;
