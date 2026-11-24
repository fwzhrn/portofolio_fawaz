import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

// Jarak dari atas layar ke awal konten section (ruang untuk navbar).
const NAV_GAP = 96;

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function targetFor(id: string): number {
  if (id === "top") return 0;
  const el = document.getElementById(id);
  if (!el) return 0;
  const top = el.getBoundingClientRect().top + window.scrollY;

  // Section tertentu (mis. Projects yang di-pin) menentukan offset sendiri.
  const custom = el.dataset.scrollOffset;
  if (custom !== undefined) return Math.max(0, top - Number(custom));

  // Lainnya: lewati padding atas section supaya konten langsung terlihat.
  const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
  return Math.max(0, top + pad - NAV_GAP);
}

export function scrollToId(id: string) {
  const y = targetFor(id);
  if (instance) {
    instance.scrollTo(y, { duration: 1.5, easing: ease });
  } else {
    window.scrollTo({ top: y, behavior: "auto" });
  }
}

// Menu mobile mengunci scroll lewat body overflow; tunggu sampai terbuka lagi.
function whenUnlocked(run: () => void, tries = 30) {
  if (document.body.style.overflow !== "hidden" || tries <= 0) {
    run();
    return;
  }
  requestAnimationFrame(() => whenUnlocked(run, tries - 1));
}

export function onDocumentClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const a = (e.target as Element | null)?.closest("a");
  if (!a) return;
  if (a.target && a.target !== "_self") return;

  const href = a.getAttribute("href");
  if (!href) return;

  let id: string | null = null;
  if (href === "/") id = "top";
  else if (href.startsWith("/#")) id = href.slice(2);
  else if (href.startsWith("#")) id = href.slice(1);

  if (!id) return;
  if (id !== "top" && !document.getElementById(id)) return;

  // preventDefault saja (bukan stopPropagation): handler klik lain,
  // seperti penutup menu mobile, tetap berjalan.
  e.preventDefault();
  const target = id;
  whenUnlocked(() => scrollToId(target));
}
