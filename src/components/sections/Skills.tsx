"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

const skills = site.skills;
const groups = ["Semua", ...Array.from(new Set(skills.map((s) => s.group)))];
const pad = (n: number) => String(n).padStart(2, "0");

const GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/<>_-+";

// Huruf yang belum "terbuka" diganti karakter acak; spasi dan tanda baca tetap.
function scrambled(target: string, progress: number) {
  const reveal = Math.floor(progress * target.length);
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target.charAt(i);
    out +=
      i < reveal || !/[a-z0-9]/i.test(ch)
        ? ch
        : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
  }
  return out;
}

export function Skills() {
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const real = useRef<HTMLSpanElement>(null);
  const scr = useRef<HTMLSpanElement>(null);
  const proxy = useRef({ p: 1 });
  const prev = useRef<string | null>(null);

  const [filter, setFilter] = useState("Semua");
  const [activeName, setActiveName] = useState(skills[0].name);

  const visible =
    filter === "Semua" ? skills : skills.filter((s) => s.group === filter);
  const active = visible.find((s) => s.name === activeName) ?? visible[0];
  const activeIdx = skills.findIndex((s) => s.name === active.name);
  const siblings = skills
    .filter((s) => s.group === active.group)
    .map((s) => s.name);

  // 1. Reveal saat masuk layar + cahaya yang mengikuti kursor
  useGSAP(
    () => {
      const wrapEl = wrap.current;
      const glowEl = glow.current;
      if (!wrapEl || !glowEl) return;

      const trigger = () => ({
        trigger: wrapEl,
        start: "top 85%",
        once: true,
      });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".sx-line", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "expo.inOut",
          stagger: 0.06,
          scrollTrigger: trigger(),
        });
        gsap.from(".sx-name-inner", {
          yPercent: 110,
          duration: 1,
          ease: "expo.out",
          stagger: 0.06,
          delay: 0.1,
          scrollTrigger: trigger(),
        });
        gsap.from(".sx-meta", {
          autoAlpha: 0,
          y: 12,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.06,
          delay: 0.25,
          scrollTrigger: trigger(),
        });
      });

      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(glowEl, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
          const gx = gsap.quickTo(glowEl, "x", { duration: 0.6, ease: "power3" });
          const gy = gsap.quickTo(glowEl, "y", { duration: 0.6, ease: "power3" });

          const onMove = (e: PointerEvent) => {
            const r = wrapEl.getBoundingClientRect();
            gx(e.clientX - r.left);
            gy(e.clientY - r.top);
          };
          const onEnter = () => gsap.to(glowEl, { autoAlpha: 1, duration: 0.4 });
          const onLeave = () => gsap.to(glowEl, { autoAlpha: 0, duration: 0.4 });

          wrapEl.addEventListener("pointermove", onMove);
          wrapEl.addEventListener("pointerenter", onEnter);
          wrapEl.addEventListener("pointerleave", onLeave);
          return () => {
            wrapEl.removeEventListener("pointermove", onMove);
            wrapEl.removeEventListener("pointerenter", onEnter);
            wrapEl.removeEventListener("pointerleave", onLeave);
          };
        },
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());

      return () => mm.revert();
    },
    { scope: root },
  );

  // 2. Setiap skill aktif berganti: sapuan isian, decode nama, geser keterangan
  useGSAP(
    () => {
      const from = prev.current;
      prev.current = active.name;
      if (from === null || from === active.name) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const wrapEl = wrap.current;
      if (!wrapEl) return;

      const oldIdx = skills.findIndex((s) => s.name === from);
      const newIdx = skills.findIndex((s) => s.name === active.name);
      const down = newIdx > oldIdx;

      const fillOf = (i: number) =>
        wrapEl.querySelector<HTMLElement>(`[data-index="${i}"] .sx-fill`);

      // Kursor masuk lewat sisi atas jika bergerak turun, sisi bawah jika naik.
      const inEl = fillOf(newIdx);
      const outEl = fillOf(oldIdx);
      if (inEl) {
        gsap.fromTo(
          inEl,
          { clipPath: down ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.5,
            ease: "expo.out",
            overwrite: "auto",
          },
        );
      }
      if (outEl) {
        gsap.fromTo(
          outEl,
          { clipPath: "inset(0% 0% 0% 0%)" },
          {
            clipPath: down ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
            duration: 0.5,
            ease: "expo.out",
            overwrite: "auto",
          },
        );
      }

      // Decode nama di panel besar. Teks asli disembunyikan sementara,
      // lapisan acak hanya dikelola di sini (bukan oleh React).
      const realEl = real.current;
      const scrEl = scr.current;
      if (realEl && scrEl) {
        const target = active.name;
        const p = proxy.current;
        gsap.killTweensOf(p);
        p.p = 0;
        gsap.set(realEl, { autoAlpha: 0 });
        scrEl.textContent = scrambled(target, 0);
        gsap.to(p, {
          p: 1,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: () => {
            scrEl.textContent = scrambled(target, p.p);
          },
          onComplete: () => {
            scrEl.textContent = "";
            gsap.set(realEl, { autoAlpha: 1 });
          },
        });
      }

      gsap.fromTo(
        ".sx-swap",
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "expo.out",
          stagger: 0.05,
          overwrite: "auto",
        },
      );

      return () => {
        if (scr.current) scr.current.textContent = "";
      };
    },
    { scope: root, dependencies: [active.name], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      id="skills"
      aria-labelledby="skills-title"
      className="relative py-section"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="font-mono text-label uppercase text-muted-foreground">
              (03) — Skill
            </p>
          </div>
          <h2 id="skills-title" className="font-display text-h1 lg:col-span-9">
            Alat yang saya pakai untuk membangun
            <span className="text-accent">.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-12">
          {/* Panel besar: cerminan visual dari skill aktif (desktop saja) */}
          <aside aria-hidden="true" className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28 flex min-h-104 flex-col justify-between border-t border-border pt-6">
              <div className="sx-swap flex items-center justify-between font-mono text-label uppercase text-muted-foreground">
                <span>{active.group}</span>
                <span>
                  {pad(activeIdx + 1)} / {pad(skills.length)}
                </span>
              </div>

              <div className="relative py-10">
                <span className="sx-swap outline-text pointer-events-none absolute -right-2 -top-4 font-display text-[clamp(8rem,14vw,15rem)] leading-none">
                  {pad(activeIdx + 1)}
                </span>
                <p className="relative font-display text-[clamp(2.5rem,1rem+4.2vw,6.25rem)] leading-[0.95] tracking-tight">
                  <span ref={real} className="block">
                    {active.name}
                  </span>
                  <span
                    ref={scr}
                    className="absolute inset-0 block text-accent"
                  />
                </p>
              </div>

              <div className="sx-swap space-y-4">
                <p className="max-w-sm text-body-lg text-muted-foreground">
                  {active.note}
                </p>
                <p className="font-mono text-label uppercase">
                  Satu kelompok: {siblings.join(" / ")}
                </p>
              </div>
            </div>
          </aside>

          {/* Daftar: kontrol utama */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div
                role="group"
                aria-label="Filter skill berdasarkan kelompok"
                className="flex flex-wrap gap-2"
              >
                {groups.map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={filter === g}
                    onClick={() => setFilter(g)}
                    className={cn(
                      "min-h-11 border px-4 font-mono text-label uppercase transition-colors duration-300 ease-out-expo",
                      filter === g
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <p
                aria-hidden="true"
                className="font-mono text-label uppercase text-muted-foreground"
              >
                {pad(visible.length)} / {pad(skills.length)}
              </p>
            </div>

            <div ref={wrap} className="relative mt-8 overflow-clip">
              <div
                ref={glow}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 size-md opacity-0 will-change-transform"
                style={{
                  background:
                    "radial-gradient(closest-side, var(--glow), transparent)",
                }}
              />

              <ul className="relative">
                {skills.map((skill, i) => {
                  const enabled = filter === "Semua" || skill.group === filter;
                  const isActive = skill.name === active.name;
                  return (
                    <li key={skill.name} data-index={i} className="relative">
                      <span
                        aria-hidden="true"
                        className="sx-line absolute inset-x-0 top-0 h-px bg-border"
                      />
                      <button
                        type="button"
                        disabled={!enabled}
                        aria-pressed={isActive}
                        onPointerEnter={(e) => {
                          if (e.pointerType === "mouse") setActiveName(skill.name);
                        }}
                        onFocus={() => setActiveName(skill.name)}
                        onClick={() => setActiveName(skill.name)}
                        className={cn(
                          "sx-row group grid w-full grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-4 text-left transition-opacity duration-300 md:grid-cols-[3rem_1fr_auto] md:py-5",
                          !enabled && "opacity-25",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="sx-meta font-mono text-label text-muted-foreground"
                        >
                          {pad(i + 1)}
                        </span>

                        <span className="block min-w-0">
                          <span className="block overflow-hidden py-[0.08em] -my-[0.08em]">
                            <span className="sx-name-inner relative block font-display text-[clamp(1.75rem,1rem+3.4vw,3.75rem)] leading-none tracking-tight">
                              <span className="block text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                                {skill.name}
                              </span>
                              <span
                                aria-hidden="true"
                                className="sx-fill absolute inset-0 block text-accent"
                              >
                                {skill.name}
                              </span>
                            </span>
                          </span>
                          <span className="sx-meta mt-2 block text-muted-foreground lg:sr-only">
                            {skill.note}
                          </span>
                        </span>

                        <span className="sx-meta font-mono text-label uppercase text-muted-foreground max-md:sr-only md:block">
                          {skill.group}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div
                aria-hidden="true"
                className="sx-line h-px bg-border"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}