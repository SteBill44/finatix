import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandlers } from "./lib/errorTracking";

// Initialize global error handlers for production monitoring
setupGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(<App />);
