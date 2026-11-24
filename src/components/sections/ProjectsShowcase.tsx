"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { projects } from "@/data/projects";

const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectsShowcase() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const viewportEl = viewport.current;
      const trackEl = track.current;
      if (!section || !viewportEl || !trackEl) return;

      const mm = gsap.matchMedia();

      // Desktop: pin + geser ke samping
      mm.add(
        "(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)",
        () => {
          section.dataset.hscroll = "on";

          const distance = () =>
            Math.max(0, trackEl.scrollWidth - window.innerWidth);

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: viewportEl,
              start: "top top",
              end: () => "+=" + distance(),
              pin: true,
              scrub: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (counter.current) {
                  counter.current.textContent = pad(
                    Math.min(
                      projects.length,
                      Math.floor(self.progress * projects.length) + 1,
                    ),
                  );
                }
              },
            },
          });

          tl.to(trackEl, { x: () => -distance() }, 0).fromTo(
            ".hs-progress",
            { scaleX: 0 },
            { scaleX: 1 },
            0,
          );

          return () => {
            delete section.dataset.hscroll;
          };
        },
      );

      // Mobile / tablet: bertumpuk, reveal sederhana
      mm.add(
        "((max-width: 1023.98px) or (max-height: 599.98px)) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils.toArray<HTMLElement>(".hs-panel").forEach((panel) => {
            gsap.from(panel, {
              autoAlpha: 0,
              y: 48,
              duration: 1,
              ease: "expo.out",
              scrollTrigger: { trigger: panel, start: "top 85%", once: true },
            });
          });
        },
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="projects" data-scroll-offset="0" data-scroll-offset="0"
      aria-labelledby="projects-title"
      className="relative"
    >
      <div ref={viewport} className="hs-viewport relative">
        <div ref={track} className="hs-track">
          <div className="hs-intro px-gutter py-section">
            <p className="font-mono text-label uppercase text-muted-foreground">
              (04) — Proyek
            </p>
            <div>
              <h2
                id="projects-title"
                className="mt-10 font-display text-h1 lg:mt-0"
              >
                Hal-hal yang pernah saya bangun
                <span className="text-accent">.</span>
              </h2>
              <p className="mt-6 font-mono text-label uppercase text-muted-foreground">
                {pad(projects.length)} proyek terpilih
              </p>
            </div>
          </div>

          {projects.map((p, i) => (
            <article
              key={p.title}
              className="hs-panel border-t border-border px-gutter py-16"
            >
              <div className="flex items-center justify-between font-mono text-label uppercase text-muted-foreground">
                <span>{pad(i + 1)}</span>
                <span>
                  {p.year} — {p.role}
                </span>
              </div>

              <h3 className="mt-6 font-display text-[clamp(2.5rem,1rem+7vw,9rem)] leading-[0.92] tracking-tight">
                {p.href ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                  >
                    {p.title}
                    <span aria-hidden="true" className="ml-3 text-[0.4em]">
                      ↗
                    </span>
                    <span className="sr-only"> (buka di tab baru)</span>
                  </a>
                ) : (
                  p.title
                )}
              </h3>

              <div className="hs-body mt-8 flex flex-col gap-6">
                <div className="hs-image">
                  <ProjectImage
                    src={p.image}
                    alt={`Tampilan proyek ${p.title}`}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
                <div className="hs-text space-y-3">
                  <p className="text-muted-foreground">{p.description}</p>
                  <p className="font-mono text-label uppercase">
                    {p.tags.join(" · ")}
                  </p>
                  {p.placeholder && (
                    <p className="inline-block border border-accent px-2 py-1 font-mono text-label uppercase text-accent">
                      Contoh — ganti dengan proyekmu
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* HUD: hanya tampil saat mode horizontal */}
        <div
          aria-hidden="true"
          className="hs-hud absolute inset-x-0 bottom-8 items-center gap-6 px-gutter font-mono text-label uppercase text-muted-foreground"
        >
          <span>
            <span ref={counter} className="text-foreground">
              01
            </span>{" "}
            / {pad(projects.length)}
          </span>
          <span className="h-px flex-1 bg-border">
            <span className="hs-progress block h-full origin-left bg-accent" />
          </span>
          <span>Scroll untuk menjelajah →</span>
        </div>
      </div>
    </section>
  );
}