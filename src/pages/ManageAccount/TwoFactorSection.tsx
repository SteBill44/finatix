import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, Smartphone, XCircle } from "lucide-react";
import { toast } from "sonner";

type TotpFactor = {
  id: string;
  status: "verified" | "unverified";
};

export function TwoFactorSection() {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupFactorId, setSetupFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const loadFactors = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    setLoading(false);

    if (error) {
      toast.error("Could not load two-factor settings.");
      return;
    }

    const verifiedTotp = (data.totp as TotpFactor[]).find((factor) => factor.status === "verified");
    setFactorId(verifiedTotp?.id ?? null);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const startSetup = async () => {
    setWorking(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Finatix authenticator",
    });
    setWorking(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSetupFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setVerificationCode("");
    setSetupOpen(true);
  };

  const verifySetup = async () => {
    if (!setupFactorId || verificationCode.length < 6) return;

    setWorking(true);
    const challenge = await supabase.auth.mfa.challenge({ factorId: setupFactorId });
    if (challenge.error) {
      setWorking(false);
      toast.error(challenge.error.message);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId: setupFactorId,
      challengeId: challenge.data.id,
      code: verificationCode,
    });
    setWorking(false);

    if (error) {
      toast.error("That code did not verify. Please try again.");
      return;
    }

    setSetupOpen(false);
    toast.success("Two-factor authentication enabled");
    await loadFactors();
  };

  const disableTwoFactor = async () => {
    if (!factorId) return;
    setWorking(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setWorking(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setFactorId(null);
    toast.success("Two-factor authentication disabled");
  };

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium text-foreground">Authenticator app</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your preferred app to add an extra sign-in step.
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              {factorId ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Enabled</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Not enabled</span>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant={factorId ? "outline" : "default"}
          onClick={factorId ? disableTwoFactor : startSetup}
          disabled={loading || working}
          className="sm:w-auto"
        >
          {working && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {factorId ? "Disable" : "Enable"}
        </Button>
      </div>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up two-factor authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the 6-digit code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {qrCode && (
              <div className="flex justify-center rounded-lg border border-border bg-white p-4">
                <QRCode value={qrCode} size={184} />
              </div>
            )}

            {secret && (
              <div className="space-y-2">
                <Label>Manual setup key</Label>
                <div className="break-all rounded-md border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground">
                  {secret}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">Verification code</Label>
              <Input
                id="twoFactorCode"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSetupOpen(false)} disabled={working}>
              Cancel
            </Button>
            <Button type="button" onClick={verifySetup} disabled={working || verificationCode.length < 6}>
              {working && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify and enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}