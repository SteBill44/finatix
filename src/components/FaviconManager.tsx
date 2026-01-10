import { useEffect } from "react";
import { useTheme } from "next-themes";

const FaviconManager = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const generateFavicon = (isDark: boolean) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return null;

      // Clear canvas
      ctx.clearRect(0, 0, 64, 64);

      // Background circle
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      
      if (isDark) {
        // Dark mode: gold background with dark text
        const gradient = ctx.createLinearGradient(0, 0, 64, 64);
        gradient.addColorStop(0, "#C9A55C");
        gradient.addColorStop(1, "#9A7B3D");
        ctx.fillStyle = gradient;
      } else {
        // Light mode: dark background with gold text
        const gradient = ctx.createLinearGradient(0, 0, 64, 64);
        gradient.addColorStop(0, "#1A1F2C");
        gradient.addColorStop(1, "#0F1218");
        ctx.fillStyle = gradient;
      }
      ctx.fill();

      // Draw the "F" letter
      ctx.font = "bold 36px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      if (isDark) {
        ctx.fillStyle = "#1A1F2C";
      } else {
        ctx.fillStyle = "#C9A55C";
      }
      ctx.fillText("F", 32, 34);

      return canvas.toDataURL("image/png");
    };

    const updateFavicon = () => {
      const isDark = resolvedTheme === "dark";
      const faviconUrl = generateFavicon(isDark);
      
      if (!faviconUrl) return;

      // Find existing favicon link or create one
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/png";
        document.head.appendChild(link);
      }

      link.href = faviconUrl;
    };

    // Small delay to ensure theme is properly resolved
    const timeoutId = setTimeout(updateFavicon, 100);

    return () => clearTimeout(timeoutId);
  }, [resolvedTheme]);

  return null;
};

export default FaviconManager;
