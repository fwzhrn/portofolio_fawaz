"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TechPlay } from "@/components/sections/TechPlay";
import type { ShapeId } from "@/components/three/PlaygroundCanvas";
import { DragController } from "@/lib/drag-controller";

// Kode Three.js baru diunduh saat section hampir terlihat.
const PlaygroundCanvas = dynamic(
  () => import("@/components/three/PlaygroundCanvas"),
  { ssr: false },
);

const shapes: { id: ShapeId; label: string }[] = [
  { id: "ico", label: "Ikosahedron" },
  { id: "knot", label: "Torus knot" },
  { id: "octa", label: "Oktahedron" },
];

const arrowKeys: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

// ── Deteksi WebGL & reduced motion tanpa setState di effect ──
let webglCache: boolean | undefined;
function detectWebGL() {
  if (webglCache !== undefined) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}
const noopSubscribe = () => () => {};

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(callback: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export function Playground() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
    const [drag] = useState(() => new DragController());
  const last = useRef({ x: 0, y: 0 });

  const [shape, setShape] = useState<ShapeId>("ico");
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  const webgl = useSyncExternalStore(noopSubscribe, detectWebGL, () => false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  // Muat kanvas hanya saat section hampir terlihat; jeda saat keluar layar.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".pg-stage", {
          clipPath: "inset(12% 8% 12% 8%)",
          autoAlpha: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: stage.current, start: "top 85%", once: true },
        });
        gsap.from(".pg-fade", {
          autoAlpha: 0,
          y: 24,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
      });
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: root },
  );

    function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
    drag.press();
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.down) return;
    drag.drag(e.clientX - last.current.x, e.clientY - last.current.y);
    last.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerEnd() {
    drag.release();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const dir = arrowKeys[e.key];
    if (!dir) return;
    e.preventDefault();
    drag.nudge(dir[0], dir[1]);
  }

  const current = shapes.find((s) => s.id === shape) ?? shapes[0];

  return (
    <section
      ref={root}
      id="playground"
      aria-labelledby="playground-title"
      className="relative py-section"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="font-mono text-label uppercase text-muted-foreground">
              (06) — Playground
            </p>
          </div>
          <div className="lg:col-span-9">
            <h2
              id="playground-title"
              className="pg-fade font-display text-h1"
            >
              Ruang kecil untuk mencoba
              <span className="text-accent">.</span>
            </h2>
            {/* TODO: tulis ulang dengan kata-katamu sendiri. */}
            <p className="pg-fade mt-6 max-w-xl text-body-lg text-muted-foreground">
              Satu objek, satu aturan: kamu bisa memutarnya. Tempat untuk hal-hal
              yang belum masuk proyek.
            </p>
          </div>
        </div>

        <div
          ref={stage}
          role="group"
          aria-label="Objek 3D interaktif. Seret untuk memutar, atau gunakan tombol panah."
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onKeyDown={onKeyDown}
          className="pg-stage relative mt-16 aspect-4/5 cursor-grab touch-pan-y select-none overflow-hidden border border-border active:cursor-grabbing md:aspect-16/9 lg:mt-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,var(--glow),transparent)] opacity-60"
          />

          {webgl && near && (
            <PlaygroundCanvas
              shape={shape}
              drag={drag}
              reduced={reduced}
              active={visible}
            />
          )}

          {!webgl && (
            <p className="absolute inset-0 grid place-items-center p-6 text-center font-mono text-label uppercase text-muted-foreground">
              WebGL tidak tersedia di perangkat ini.
            </p>
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 font-mono text-label uppercase text-muted-foreground md:p-6"
          >
            <span>Eksperimen 01</span>
            <span className="text-foreground">{current.label}</span>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between p-4 font-mono text-label uppercase text-muted-foreground md:p-6"
          >
            <span>Seret untuk memutar</span>
            <span>↻</span>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Bentuk saat ini: {current.label}
        </p>

        <div className="pg-fade mt-6 flex flex-wrap items-center gap-3">
          <span className="mr-2 font-mono text-label uppercase text-muted-foreground">
            Bentuk
          </span>
          {shapes.map((s) => (
            <Button
              key={s.id}
              variant={s.id === shape ? "primary" : "outline"}
              aria-pressed={s.id === shape}
              onClick={() => setShape(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      <TechPlay />
      </Container>
    </section>
  );
}