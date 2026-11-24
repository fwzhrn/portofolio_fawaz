import { gsap } from "@/lib/gsap";

export type Theme = "dark" | "light";

const STAGGER = 0.025;
const STYLE_ID = "theme-shutter-style";

// CSS disuntikkan sendiri, jadi efek ini tidak bergantung pada globals.css.
const CSS = `
html.theme-swapping *,
html.theme-swapping *::before,
html.theme-swapping *::after { transition: none !important; }
.theme-shutter { position: fixed; inset: 0; z-index: 99990; pointer-events: none; overflow: hidden; }
.theme-shutter-panel { position: absolute; top: 0; height: 0; overflow: hidden; background: var(--ts-bg); box-shadow: 0 12px 40px -8px color-mix(in oklab, var(--ts-accent) 55%, transparent); }
.theme-shutter-panel::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--ts-accent); }
.theme-shutter-panel.is-reveal { box-shadow: 0 -12px 40px -8px color-mix(in oklab, var(--ts-accent) 55%, transparent); }
.theme-shutter-panel.is-reveal::after { top: 0; bottom: auto; }
.theme-shutter-label { position: absolute; inset: 0; display: grid; place-items: center; }
.ts-card { display: flex; flex-direction: column; align-items: center; gap: 14px; color: var(--ts-fg); font-family: var(--f-mono), ui-monospace, monospace; font-size: 0.75rem; letter-spacing: 0.24em; text-transform: uppercase; }
.ts-dot { width: 8px; height: 8px; background: var(--ts-accent); }
.ts-line { width: 120px; height: 1px; background: var(--ts-accent); transform-origin: left center; }
`;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Membaca warna tema tujuan lewat elemen bayangan bertanda data-theme.
function themeColors(next: Theme) {
  const probe = document.createElement("div");
  probe.dataset.theme = next;
  probe.style.cssText =
    "position:absolute;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const read = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  const colors = {
    bg: read("--background", next === "light" ? "#f7f5f0" : "#0b0b0f"),
    fg: read("--foreground", next === "light" ? "#16161b" : "#f5f3ee"),
    accent: read("--accent", "#ff7a45"),
  };
  probe.remove();
  return colors;
}

type ShutterOptions = {
  x: number; // posisi horizontal tombol (gelombang mulai dari sini)
  to: Theme;
  swap: () => void;
  done: () => void;
};

export function playThemeShutter({ x, to, swap, done }: ShutterOptions) {
  ensureStyle();

  const root = document.documentElement;
  const width = window.innerWidth;
  const H = window.innerHeight + 2;
  const count = width < 768 ? 6 : 10;
  const { bg, fg, accent } = themeColors(to);

  const wrap = document.createElement("div");
  wrap.className = "theme-shutter";
  wrap.setAttribute("aria-hidden", "true");
  wrap.style.setProperty("--ts-bg", bg);
  wrap.style.setProperty("--ts-fg", fg);
  wrap.style.setProperty("--ts-accent", accent);

  const panels: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "theme-shutter-panel";
    p.style.left = `${(i / count) * 100}%`;
    // Tumpang tindih 2px supaya tidak ada celah di antara panel.
    p.style.width = `calc(${100 / count}% + 2px)`;
    wrap.appendChild(p);
    panels.push(p);
  }

  const labelWrap = document.createElement("div");
  labelWrap.className = "theme-shutter-label";
  const card = document.createElement("div");
  card.className = "ts-card";
  const dot = document.createElement("span");
  dot.className = "ts-dot";
  const text = document.createElement("span");
  text.textContent = to === "light" ? "Mode terang" : "Mode gelap";
  const line = document.createElement("span");
  line.className = "ts-line";
  card.append(dot, text, line);
  labelWrap.appendChild(card);
  wrap.appendChild(labelWrap);
  document.body.appendChild(wrap);

  // Urutan gelombang: dari kolom terdekat dengan tombol ke yang terjauh.
  const order = panels
    .map((p, i) => ({ p, d: Math.abs(((i + 0.5) / count) * width - x) }))
    .sort((a, b) => a.d - b.d)
    .map((o) => o.p);

  let swapped = false;
  const doSwap = () => {
    if (swapped) return;
    swapped = true;
    // Semua transisi CSS dimatikan selama pertukaran supaya semua elemen
    // berganti warna pada frame yang sama. Layar sedang tertutup panel.
    root.classList.add("theme-swapping");
    swap();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("theme-swapping")),
    );
  };

  let finished = false;
  let failsafe = 0;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(failsafe);
    doSwap();
    wrap.remove();
    done();
  };
  // Jaring pengaman: kalau animasi macet, tema tetap berganti dan tombol bebas lagi.
  failsafe = window.setTimeout(finish, 3500);

  gsap.set(panels, { height: 0 });
  gsap.set(card, { opacity: 0, y: 10 });
  gsap.set(line, { scaleX: 0 });

  const tl = gsap.timeline({ onComplete: finish });

  // 1. Panel turun menutup layar, bergelombang dari posisi tombol.
  tl.to(order, {
    height: H,
    duration: 0.42,
    ease: "power3.inOut",
    stagger: STAGGER,
  });

  // 2. Layar tertutup penuh: tema ditukar, label muncul.
  tl.call(doSwap, undefined, ">");
  tl.to(card, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, "<");
  tl.to(line, { scaleX: 1, duration: 0.24, ease: "power3.out" }, "<");

  // 3. Panel terus turun keluar layar dan memperlihatkan tema baru.
  tl.addLabel("reveal", "+=0.08");
  tl.to(card, { opacity: 0, y: -10, duration: 0.16, ease: "power2.in" }, "reveal");
  tl.call(
    () => {
      for (const p of panels) {
        p.style.top = "auto";
        p.style.bottom = "0";
        p.classList.add("is-reveal");
      }
    },
    undefined,
    "reveal",
  );
  tl.to(
    order,
    { height: 0, duration: 0.42, ease: "power3.inOut", stagger: STAGGER },
    "reveal",
  );
}
