let swatch: CanvasRenderingContext2D | null = null;

// Mengubah nilai CSS variable (oklch dll.) menjadi hex untuk Three.js.
export function getCssColor(variable: string, fallback = "#ffffff"): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  if (!raw) return fallback;

  if (!swatch) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    swatch = c.getContext("2d", { willReadFrequently: true });
  }
  if (!swatch) return fallback;

  swatch.clearRect(0, 0, 1, 1);
  swatch.fillStyle = fallback;
  swatch.fillStyle = raw;
  swatch.fillRect(0, 0, 1, 1);
  const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}