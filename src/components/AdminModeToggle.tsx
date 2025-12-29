import { useIsAdmin } from "@/hooks/useUserRole";
import { useSiteMode, useUpdateSiteMode } from "@/hooks/useSiteMode";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminModeToggle = () => {
  const { isAdmin, isLoading: isLoadingRole } = useIsAdmin();
  const { data: siteMode, isLoading: isLoadingMode } = useSiteMode();
  const updateSiteMode = useUpdateSiteMode();

  if (isLoadingRole || isLoadingMode || !isAdmin) {
    return null;
  }

  const isLive = siteMode === "live";

  const handleToggle = async (checked: boolean) => {
    const newMode = checked ? "live" : "coming_soon";
    try {
      await updateSiteMode.mutateAsync(newMode);
      toast({
        title: "Site mode updated",
        description: `Site is now ${checked ? "live" : "in coming soon mode"}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Could not change site mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-lg">
      <Settings className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="site-mode" className="text-sm font-medium cursor-pointer">
        {isLive ? "Live" : "Coming Soon"}
      </Label>
      <Switch
        id="site-mode"
        checked={isLive}
        onCheckedChange={handleToggle}
        disabled={updateSiteMode.isPending}
      />
    </div>
  );
};

export default AdminModeToggle;
