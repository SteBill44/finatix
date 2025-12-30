import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCIMAProfile } from "@/hooks/useCIMAProfile";
import { toast } from "sonner";
import { User, CreditCard, Loader2 } from "lucide-react";
import { z } from "zod";

const cimaProfileSchema = z.object({
  cima_id: z.string().trim().min(1, "CIMA ID is required").max(20, "CIMA ID must be 20 characters or less"),
  first_name: z.string().trim().min(1, "First name is required").max(100, "First name must be 100 characters or less"),
  last_name: z.string().trim().min(1, "Last name is required").max(100, "Last name must be 100 characters or less"),
  siebel_id: z.string().trim().max(20, "Siebel ID must be 20 characters or less").optional(),
});

interface CIMAProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialFirstName?: string;
  initialLastName?: string;
}

const CIMAProfileModal = ({
  open,
  onClose,
  onSuccess,
  initialFirstName = "",
  initialLastName = "",
}: CIMAProfileModalProps) => {
  const [cimaId, setCimaId] = useState("");
  const [siebelId, setSiebelId] = useState("");
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateProfile = useUpdateCIMAProfile();

  useEffect(() => {
    if (initialFirstName) setFirstName(initialFirstName);
    if (initialLastName) setLastName(initialLastName);
  }, [initialFirstName, initialLastName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = cimaProfileSchema.safeParse({
      cima_id: cimaId,
      first_name: firstName,
      last_name: lastName,
      siebel_id: siebelId || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await updateProfile.mutateAsync({
        cima_id: cimaId.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        siebel_id: siebelId.trim() || undefined,
        cima_start_date: new Date().toISOString().split("T")[0],
      });

      toast.success("CIMA profile saved successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            CIMA Student Information
          </DialogTitle>
          <DialogDescription>
            Please provide your CIMA details. This information is required for course accreditation and will be shared with CIMA for verification purposes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="cimaId">CIMA ID / AICPA ID *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="cimaId"
                type="text"
                placeholder="e.g., 40123456"
                value={cimaId}
                onChange={(e) => setCimaId(e.target.value)}
                className="pl-10"
              />
            </div>
            {errors.cima_id && (
              <p className="text-sm text-destructive">{errors.cima_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siebelId">Siebel ID (Optional)</Label>
            <Input
              id="siebelId"
              type="text"
              placeholder="e.g., 1-482715"
              value={siebelId}
              onChange={(e) => setSiebelId(e.target.value)}
            />
            {errors.siebel_id && (
              <p className="text-sm text-destructive">{errors.siebel_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            * Required fields. Your data will be shared with CIMA for accreditation purposes.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CIMAProfileModal;
