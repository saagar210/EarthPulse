import html2canvas from "html2canvas";

export async function captureMap(): Promise<Blob> {
  const container = document.querySelector(".leaflet-container") as HTMLElement;
  if (!container) throw new Error("Map container not found");

  const canvas = await html2canvas(container, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#030712", // gray-950
  });

  // Draw watermark
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const now = new Date();
    const text = `EarthPulse — ${now.toISOString().replace("T", " ").slice(0, 19)} UTC`;
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "right";
    ctx.fillText(text, canvas.width - 12, canvas.height - 12);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/png",
    );
  });
}
