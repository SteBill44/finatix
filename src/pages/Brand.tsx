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
                  className="flex items-center justify-center"
                  style={{ 
                    width: "100%",
                    aspectRatio: "1500/500",
                    background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #0d9488 100%)"
                  }}
                >
                  <div className="flex items-center gap-4">
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-16 h-16 md:w-20 md:h-20"
                      fill="none"
                    >
                      <path
                        d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z"
                        fill="rgba(255,255,255,0.15)"
                      />
                      <g fill="#ffffff">
                        <rect x="32" y="28" width="12" height="44" />
                        <rect x="44" y="28" width="26" height="10" />
                        <rect x="44" y="46" width="18" height="10" />
                      </g>
                    </svg>
                    <span className="text-white text-2xl md:text-4xl font-bold tracking-tight">
                      Fin<span className="opacity-90">atix</span>
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
                  className="flex items-center justify-center"
                  style={{ 
                    width: "100%",
                    aspectRatio: "1200/630",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
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
                    <span className="text-white text-2xl md:text-4xl font-bold tracking-tight">
                      Fin<span className="text-primary">atix</span>
                    </span>
                    <span className="text-white/60 text-xs md:text-sm">
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
