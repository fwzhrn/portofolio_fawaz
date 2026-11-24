"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { projects } from "@/data/projects";

function RowShell({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

export function Projects() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const listEl = list.current;
      const preview = previewRef.current;
      if (!section || !listEl || !preview) return;

      const mm = gsap.matchMedia();

      // 1. Reveal saat masuk layar
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".project-line", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "expo.inOut",
          stagger: 0.12,
          scrollTrigger: { trigger: listEl, start: "top 85%", once: true },
        });
        gsap.from(".project-title-inner", {
          yPercent: 110,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.12,
          delay: 0.1,
          scrollTrigger: { trigger: listEl, start: "top 85%", once: true },
        });
        gsap.from(".project-meta", {
          autoAlpha: 0,
          y: 16,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.12,
          delay: 0.25,
          scrollTrigger: { trigger: listEl, start: "top 85%", once: true },
        });
      });

      // 2. Preview yang mengikuti kursor (mouse + tanpa reduced motion)
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          section.dataset.preview = "on";

          const frame = preview.querySelector<HTMLElement>(".project-frame");
          const imgs = preview.querySelectorAll<HTMLElement>(".preview-img");

          gsap.set(preview, {
            xPercent: -50,
            yPercent: -50,
            autoAlpha: 0,
            scale: 0.85,
          });

          const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
          const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
          const rTo = gsap.quickTo(preview, "rotation", { duration: 0.5, ease: "power3" });
          const clampRot = gsap.utils.clamp(-10, 10);

          let current = -1;
          let settle: ReturnType<typeof setTimeout> | undefined;

          const show = (idx: number) => {
            if (idx === current) return;
            const wasHidden = current === -1;
            current = idx;

            imgs.forEach((img, i) => {
              gsap.to(img, {
                opacity: i === idx ? 1 : 0,
                duration: 0.3,
                overwrite: true,
              });
            });

            gsap.to(preview, {
              autoAlpha: 1,
              scale: 1,
              duration: 0.5,
              ease: "expo.out",
              overwrite: "auto",
            });

            if (wasHidden && frame) {
              gsap.fromTo(
                frame,
                { clipPath: "inset(18% 18% 18% 18%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "expo.out" },
              );
            }
          };

          const hide = () => {
            current = -1;
            gsap.to(preview, {
              autoAlpha: 0,
              scale: 0.85,
              duration: 0.35,
              ease: "power3.out",
              overwrite: "auto",
            });
          };

          const rowOf = (target: EventTarget | null) =>
            (target as Element | null)?.closest<HTMLElement>("[data-project-row]") ?? null;

          const onMove = (e: PointerEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
            rTo(clampRot(e.movementX * 0.4));
            clearTimeout(settle);
            settle = setTimeout(() => rTo(0), 90);
          };

          const onOver = (e: PointerEvent) => {
            const row = rowOf(e.target);
            if (!row) return;
            // Muncul langsung di kursor, bukan terbang dari pojok layar.
            if (current === -1) gsap.set(preview, { x: e.clientX, y: e.clientY });
            show(Number(row.dataset.index));
          };

          const onFocusIn = (e: FocusEvent) => {
            const row = rowOf(e.target);
            if (!row) return;
            const r = row.getBoundingClientRect();
            gsap.set(preview, { x: r.right - r.width * 0.2, y: r.top + r.height / 2 });
            show(Number(row.dataset.index));
          };

          section.addEventListener("pointermove", onMove);
          listEl.addEventListener("pointerover", onOver);
          listEl.addEventListener("pointerleave", hide);
          listEl.addEventListener("focusin", onFocusIn);
          listEl.addEventListener("focusout", hide);

          return () => {
            clearTimeout(settle);
            section.removeEventListener("pointermove", onMove);
            listEl.removeEventListener("pointerover", onOver);
            listEl.removeEventListener("pointerleave", hide);
            listEl.removeEventListener("focusin", onFocusIn);
            listEl.removeEventListener("focusout", hide);
            delete section.dataset.preview;
          };
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
      id="projects"
      aria-labelledby="projects-title"
      className="relative py-section"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="font-mono text-label uppercase text-muted-foreground">
              (04) — Proyek
            </p>
          </div>
          <div className="lg:col-span-9">
            <h2 id="projects-title" className="font-display text-h1">
              Hal-hal yang pernah saya bangun
              <span className="text-accent">.</span>
            </h2>
            <p className="mt-6 font-mono text-label uppercase text-muted-foreground">
              {String(projects.length).padStart(2, "0")} proyek terpilih
            </p>
          </div>
        </div>

        <ul ref={list} className="project-list mt-16 lg:mt-24">
          {projects.map((p, i) => (
            <li
              key={p.title}
              data-project-row
              data-index={i}
              className="project-row group relative transition-opacity duration-300"
            >
              <span
                aria-hidden="true"
                className="project-line absolute inset-x-0 top-0 h-px bg-border"
              />

              <RowShell
                href={p.href}
                className="block py-8 outline-offset-[-3px] md:py-12"
              >
                <div className="grid gap-6 md:grid-cols-12 md:items-center">
                  <span className="project-meta font-mono text-label text-muted-foreground md:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3 className="block overflow-hidden py-[0.08em] -my-[0.08em] md:col-span-7">
                    <span className="project-title-inner block font-display text-[clamp(2.25rem,1rem+6vw,6.5rem)] leading-[0.95] tracking-tight transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-4 group-hover:text-accent">
                      {p.title}
                      {p.href && (
                        <>
                          <span
                            aria-hidden="true"
                            className="ml-3 inline-block text-[0.45em] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          >
                            ↗
                          </span>
                          <span className="sr-only"> (buka di tab baru)</span>
                        </>
                      )}
                    </span>
                  </h3>

                  <div className="project-meta space-y-3 md:col-span-4">
                    <p className="font-mono text-label uppercase text-muted-foreground">
                      {p.year} — {p.role}
                    </p>
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

                  {/* Thumbnail untuk layar sentuh / reduced motion.
                      Disembunyikan saat mode preview kursor aktif. */}
                  <div className="project-inline relative aspect-[16/10] overflow-hidden bg-secondary md:col-span-8 md:col-start-2">
                    <ProjectImage
                      src={p.image}
                      alt={`Tampilan proyek ${p.title}`}
                      sizes="(min-width: 768px) 60vw, 100vw"
                    />
                  </div>
                </div>
              </RowShell>
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="project-line h-px bg-border" />
      </Container>

      {/* Preview mengikuti kursor. Dekoratif: info yang sama ada di baris. */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className="project-preview pointer-events-none fixed left-0 top-0 z-30 w-[24vw] max-w-[26rem] will-change-transform"
      >
        <div className="project-frame relative aspect-[4/3] overflow-hidden border border-border bg-secondary">
          {projects.map((p) => (
            <div key={p.title} className="preview-img absolute inset-0 opacity-0">
              <ProjectImage src={p.image} alt="" sizes="26vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}