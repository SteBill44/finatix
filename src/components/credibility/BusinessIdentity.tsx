import { Link } from "react-router-dom";
import { Building2, Clock, Mail, ShieldCheck } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { POLICY } from "@/lib/catalogue";

/**
 * Who you are buying from and how to reach us, shown before payment.
 * Details the owner has not verified (such as a trading address) are simply
 * left out rather than filled with an example.
 */
export function BusinessIdentity({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-primary" />
        <p className="font-semibold text-foreground">You're buying from {COMPANY.name}</p>
      </div>

      <ul className="space-y-2 text-muted-foreground">
        <li className="flex items-start gap-2">
          <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <span>
            Questions before or after you buy:{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-primary hover:underline">
              {COMPANY.supportEmail}
            </a>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <span>
            {COMPANY.supportHours}. {COMPANY.responseTime}.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <span>{POLICY.refundText}.</span>
        </li>
        {COMPANY.companyNumber && (
          <li className="flex items-start gap-2">
            <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            <span>Company number {COMPANY.companyNumber}</span>
          </li>
        )}
      </ul>

      {!compact && (
        <p className="mt-3 text-xs text-muted-foreground">
          <Link to="/terms" className="text-primary hover:underline">Terms</Link>
          {" · "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
          {" · "}
          <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
        </p>
      )}
    </div>
  );
}

export default BusinessIdentity;
