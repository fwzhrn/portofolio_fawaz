"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const words = [
  "Frontend Developer",
  "Creative Developer",
  "UI/UX",
  "Web Development",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {words.map((word, i) => (
        <span key={word} className="flex items-center">
          <span className={i % 2 === 0 ? "px-[0.4em]" : "outline-text px-[0.4em]"}>
            {word}
          </span>
          <span className="text-accent">/</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      const trackEl = track.current;
      if (!rootEl || !trackEl) return;

      const mm = gsap.matchMedia();

      // Reduced motion: teks diam, tidak ada gerak sama sekali.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const setX = gsap.quickSetter(trackEl, "x", "px");
        const skewTo = gsap.quickTo(trackEl, "skewX", {
          duration: 0.5,
          ease: "power3",
        });

        let x = 0;
        let dir = -1;
        let vel = 0;

        const tick = (_time: number, deltaTime: number) => {
          const dt = deltaTime / 1000;
          const half = trackEl.scrollWidth / 2;

          x += dir * (70 + Math.abs(vel) * 0.12) * dt;
          x = gsap.utils.wrap(-half, 0, x);
          setX(x);
          skewTo(dir * Math.min(Math.abs(vel) / 250, 8));

          // Kecepatan dari scroll memudar sendiri saat scroll berhenti.
          vel *= Math.pow(0.02, dt);
        };

        const velocityTrigger = ScrollTrigger.create({
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            dir = self.direction === 1 ? -1 : 1;
            vel = self.getVelocity();
          },
        });

        // Hanya berjalan saat marquee terlihat di layar.
        const visibleTrigger = ScrollTrigger.create({
          trigger: rootEl,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            if (self.isActive) gsap.ticker.add(tick);
            else gsap.ticker.remove(tick);
          },
        });

        return () => {
          gsap.ticker.remove(tick);
          velocityTrigger.kill();
          visibleTrigger.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="overflow-hidden whitespace-nowrap border-y border-border py-8 md:py-12"
    >
      <div
        ref={track}
        className="flex w-max font-display text-[clamp(2.5rem,1rem+6vw,7rem)] leading-none will-change-transform"
      >
        <Row />
        <Row />
      </div>
    </div>
  );
}
