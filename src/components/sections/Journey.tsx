"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { journey } from "@/data/journey";

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const listEl = list.current;
      if (!section || !listEl) return;

      const items = gsap.utils.toArray<HTMLElement>(".journey-item", listEl);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Garis accent terisi mengikuti scroll
        gsap.fromTo(
          ".journey-progress",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: listEl,
              start: "top 65%",
              end: "bottom 65%",
              scrub: true,
            },
          },
        );

        // 2. Titik menyala saat garis sampai, padam lagi saat scroll balik
        items.forEach((item) => {
          ScrollTrigger.create({
            trigger: item,
            start: "top 65%",
            onEnter: () => item.classList.add("is-active"),
            onLeaveBack: () => item.classList.remove("is-active"),
          });
        });

        // 3. Konten tiap tahap naik halus sekali
        items.forEach((item) => {
          gsap.from(item.querySelectorAll(".journey-fade"), {
            autoAlpha: 0,
            y: 40,
            duration: 1,
            ease: "expo.out",
            stagger: 0.1,
            scrollTrigger: { trigger: item, start: "top 80%", once: true },
          });
        });
      });

      // Reduced motion: semua tampil penuh, semua titik menyala.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        items.forEach((item) => item.classList.add("is-active"));
        gsap.set(".journey-progress", { scaleY: 1 });
      });

      document.fonts.ready.then(() => ScrollTrigger.refresh());

      return () => {
        items.forEach((item) => item.classList.remove("is-active"));
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="journey"
      aria-labelledby="journey-title"
      className="relative py-section"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="font-mono text-label uppercase text-muted-foreground">
                (05) — Perjalanan
              </p>
            </div>
          </div>

          <div className="lg:col-span-9">
            <h2 id="journey-title" className="font-display text-h1">
              Bagaimana saya sampai di sini
              <span className="text-accent">.</span>
            </h2>

            <ol ref={list} className="relative mt-16 lg:mt-24">
              {/* Jalur garis: dasar (border) + isi (accent) */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[5px] top-0 w-px bg-border"
              />
              <span
                aria-hidden="true"
                className="journey-progress absolute bottom-0 left-[5px] top-0 w-px origin-top bg-accent"
              />

              {journey.map((item) => (
                <li
                  key={item.title}
                  className="journey-item relative pb-16 pl-10 last:pb-0 md:pl-14"
                >
                  <span
                    aria-hidden="true"
                    className="journey-dot absolute left-0 top-2 size-[11px] rounded-full border border-border bg-background transition-colors duration-500"
                  />

                  <div className="grid gap-4 md:grid-cols-12 md:gap-8">
                    <p className="journey-fade font-mono text-label uppercase text-muted-foreground md:col-span-3 md:pt-3">
                      {item.period}
                    </p>

                    <div className="space-y-4 md:col-span-9">
                      <h3 className="journey-fade font-display text-[clamp(1.75rem,1rem+3vw,3.5rem)] leading-[1.05] tracking-tight">
                        {item.title}
                      </h3>
                      {item.place && (
                        <p className="journey-fade font-mono text-label uppercase">
                          {item.place}
                        </p>
                      )}
                      <p className="journey-fade max-w-xl text-body-lg text-muted-foreground">
                        {item.description}
                      </p>
                      {item.placeholder && (
                        <p className="journey-fade inline-block border border-accent px-2 py-1 font-mono text-label uppercase text-accent">
                          Contoh — ganti dengan perjalananmu
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}