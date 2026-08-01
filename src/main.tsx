import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandlers } from "./lib/errorTracking";
import { enforceCanonicalHost } from "./lib/canonicalHost";

// Redirect alternate hosts to the canonical domain before rendering
enforceCanonicalHost();

// Initialize global error handlers for production monitoring
setupGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(<App />);
