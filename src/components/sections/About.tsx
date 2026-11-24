"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { site } from "@/data/site";

const highlight = new Set(site.about.highlight.map((w) => w.toLowerCase()));
const clean = (w: string) => w.toLowerCase().replace(/[.,!?;:"'()]/g, "");

export function About() {
  const root = useRef<HTMLElement>(null);
  const statement = useRef<HTMLParagraphElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const facts = useRef<HTMLDListElement>(null);
  const index = useRef<HTMLSpanElement>(null);

  const words = site.about.statement.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Semua efek hanya jika user tidak meminta kurangi gerakan.
      // Tanpa ini, semua teks tampil penuh (state default CSS).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Kata menyala mengikuti scroll
        gsap.fromTo(
          ".about-word",
          { opacity: 0.15 },
          {
            opacity: 1,
            ease: "none",
            duration: 0.4,
            stagger: 0.12,
            scrollTrigger: {
              trigger: statement.current,
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
            },
          },
        );

        // 2. Angka raksasa bergeser pelan (parallax)
        gsap.to(index.current, {
          yPercent: -25,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        // 3. Paragraf pendukung muncul sekali
        gsap.from(".about-fade", {
          autoAlpha: 0,
          y: 32,
          duration: 1,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: body.current, start: "top 85%", once: true },
        });

        // 4. Daftar info: garis menggambar diri, teks menyusul
        gsap.from(".fact-line", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "expo.inOut",
          stagger: 0.12,
          scrollTrigger: { trigger: facts.current, start: "top 85%", once: true },
        });
        gsap.from(".fact-text", {
          autoAlpha: 0,
          y: 16,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.06,
          delay: 0.15,
          scrollTrigger: { trigger: facts.current, start: "top 85%", once: true },
        });
      });

      // Font memengaruhi tinggi teks, jadi posisi trigger dihitung ulang setelah siap.
      document.fonts.ready.then(() => ScrollTrigger.refresh());

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="about"
      aria-labelledby="about-title"
      className="relative overflow-clip py-section"
    >
      <span
        ref={index}
        aria-hidden="true"
        className="outline-text pointer-events-none absolute -right-[2vw] top-12 select-none font-display text-[clamp(10rem,32vw,34rem)] leading-none"
      >
        02
      </span>

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="font-mono text-label uppercase text-muted-foreground">
                (02) — Tentang
              </p>
              <h2 id="about-title" className="sr-only">
                Tentang {site.name}
              </h2>
            </div>
          </div>

          <div className="lg:col-span-9">
            <p
              ref={statement}
              className="font-display text-[clamp(1.75rem,1rem+3.2vw,4rem)] leading-[1.12] tracking-tight"
            >
              {words.map((word, i) => (
                <span key={i}>
                  <span
                    className={
                      highlight.has(clean(word))
                        ? "about-word text-accent"
                        : "about-word"
                    }
                  >
                    {word}
                  </span>{" "}
                </span>
              ))}
            </p>

            <div
              ref={body}
              className="mt-14 grid gap-6 text-body-lg text-muted-foreground md:grid-cols-2 md:gap-12"
            >
              {site.about.body.map((paragraph) => (
                <p key={paragraph} className="about-fade">
                  {paragraph}
                </p>
              ))}
            </div>

            <dl ref={facts} className="mt-20 lg:mt-28">
              {site.about.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="group relative grid gap-1 py-5 md:grid-cols-12 md:items-baseline md:gap-6"
                >
                  <span
                    aria-hidden="true"
                    className="fact-line absolute inset-x-0 top-0 h-px bg-border"
                  />
                  <dt className="fact-text font-mono text-label uppercase text-muted-foreground transition-colors duration-300 group-hover:text-accent md:col-span-4">
                    {fact.label}
                  </dt>
                  <dd className="fact-text font-display text-h3 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 md:col-span-8">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div aria-hidden="true" className="fact-line h-px bg-border" />
          </div>
        </div>
      </Container>
    </section>
  );
}