import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App";
import { hasTauriInvoke } from "./runtime/tauri";

async function bootstrap() {
  if (!hasTauriInvoke()) {
    const { installBrowserTauriMocks } = await import("./runtime/browserMocks");
    installBrowserTauriMocks();
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
