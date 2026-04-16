import { Check, X } from "lucide-react";
import { passwordRequirements } from "@/lib/validation";

interface Props {
  password: string;
}

const PasswordRequirements = ({ password }: Props) => {
  if (password.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
      <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
      <div className="space-y-1">
        {passwordRequirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <div key={index} className="flex items-center gap-2">
              {passed ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className={`text-xs ${passed ? "text-green-500" : "text-muted-foreground"}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordRequirements;
