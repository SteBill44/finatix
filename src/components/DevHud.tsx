import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

const DevHud = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const onError = (event: ErrorEvent) => {
      setLastError(event.message || "Unknown error");
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      setLastError(
        typeof event.reason === "string" ? event.reason : JSON.stringify(event.reason)
      );
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-2 left-2 z-[9998] max-w-[calc(100vw-1rem)] rounded-md border border-border bg-background/90 backdrop-blur px-3 py-2 text-xs text-foreground shadow-lg">
      <div className="font-medium">DEV</div>
      <div className="text-muted-foreground">
        route: <span className="text-foreground">{location.pathname}</span>
      </div>
      <div className="text-muted-foreground">
        auth:{" "}
        <span className="text-foreground">
          {loading ? "loading" : user ? "signed-in" : "signed-out"}
        </span>
      </div>
      {user && (
        <div className="text-muted-foreground">
          user: <span className="text-foreground">{user.id.slice(0, 8)}…</span>
        </div>
      )}
      {lastError && (
        <div className="mt-2 rounded bg-muted px-2 py-1">
          <span className="text-destructive">error:</span> {lastError}
        </div>
      )}
    </div>
  );
};

export default DevHud;
