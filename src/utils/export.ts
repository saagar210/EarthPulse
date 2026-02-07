import { captureMap } from "./screenshot";

export async function saveScreenshot(): Promise<void> {
  const blob = await captureMap();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `earthpulse-${timestamp}.png`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyScreenshot(): Promise<void> {
  const blob = await captureMap();
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}
