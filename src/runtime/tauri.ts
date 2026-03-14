declare global {
  interface Window {
    __EARTHPULSE_BROWSER_MOCKS__?: boolean;
    __TAURI_INTERNALS__?: {
      invoke?: unknown;
      metadata?: unknown;
    };
  }
}

export function hasTauriInvoke(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return typeof window.__TAURI_INTERNALS__?.invoke === "function";
}

export function isBrowserPreviewMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.__EARTHPULSE_BROWSER_MOCKS__ === true;
}
