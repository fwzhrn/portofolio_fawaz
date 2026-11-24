"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const INTERACTIVE = "a, button, [role='button'], summary";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const dotEl = dot.current;
    const ringEl = ring.current;
    if (!dotEl || !ringEl) return;

    const mm = gsap.matchMedia();

    mm.add(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const html = document.documentElement;
        html.classList.add("has-cursor");

        gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

        const dx = gsap.quickTo(dotEl, "x", { duration: 0.12, ease: "power3" });
        const dy = gsap.quickTo(dotEl, "y", { duration: 0.12, ease: "power3" });
        const rx = gsap.quickTo(ringEl, "x", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(ringEl, "y", { duration: 0.5, ease: "power3" });

        let visible = false;

        const show = (x: number, y: number) => {
          gsap.set([dotEl, ringEl], { x, y });
          gsap.to([dotEl, ringEl], { autoAlpha: 1, duration: 0.3 });
          visible = true;
        };

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          if (!visible) show(e.clientX, e.clientY);
          dx(e.clientX);
          dy(e.clientY);
          rx(e.clientX);
          ry(e.clientY);
        };

        const onOver = (e: PointerEvent) => {
          const hit = (e.target as Element | null)?.closest(INTERACTIVE);
          ringEl.classList.toggle("is-active", Boolean(hit));
          gsap.to(ringEl, {
            scale: hit ? 1.9 : 1,
            duration: 0.4,
            ease: "expo.out",
            overwrite: "auto",
          });
          gsap.to(dotEl, {
            scale: hit ? 0 : 1,
            duration: 0.3,
            overwrite: "auto",
          });
        };

        const onDown = () =>
          gsap.to(ringEl, { scale: 0.8, duration: 0.2, overwrite: "auto" });
        const onUp = () =>
          gsap.to(ringEl, {
            scale: ringEl.classList.contains("is-active") ? 1.9 : 1,
            duration: 0.4,
            ease: "expo.out",
            overwrite: "auto",
          });

        const onLeave = () => {
          visible = false;
          gsap.to([dotEl, ringEl], { autoAlpha: 0, duration: 0.2 });
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerover", onOver);
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        document.documentElement.addEventListener("pointerleave", onLeave);

        return () => {
          html.classList.remove("has-cursor");
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerover", onOver);
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        };
      },
    );

    return () => mm.revert();
  });

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-90 size-10 rounded-full border border-accent opacity-0 transition-colors duration-300"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-90 size-2 rounded-full bg-accent opacity-0"
      />
    </>
  );
}