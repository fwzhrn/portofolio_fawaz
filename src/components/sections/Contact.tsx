"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/animations/Magnetic";
import { site } from "@/data/site";

const lines = ["Punya ide?", "Ayo bikin", "bareng"];

type Status = "idle" | "ok" | "fail";

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [status, setStatus] = useState<Status>("idle");

  const hasEmail = site.email.length > 0;
  const mailto = hasEmail
    ? `mailto:${site.email}?subject=${encodeURIComponent(`Halo ${site.name}`)}`
    : "";

  useEffect(() => () => clearTimeout(timer.current), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Tanpa ini, semua teks langsung tampil (state default CSS).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = { trigger: root.current, start: "top 65%", once: true };

        gsap.from(".contact-line", {
          yPercent: 115,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: trigger,
        });
        gsap.from(".contact-fade", {
          autoAlpha: 0,
          y: 28,
          duration: 1,
          ease: "expo.out",
          stagger: 0.1,
          delay: 0.5,
          scrollTrigger: trigger,
        });
      });

      document.fonts.ready.then(() => ScrollTrigger.refresh());

      return () => mm.revert();
    },
    { scope: root },
  );

  async function copyEmail() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(site.email);
      setStatus("ok");
    } catch {
      setStatus("fail");
    }
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <section
      ref={root}
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-clip py-section"
    >
      <Container>
        <p className="contact-fade font-mono text-label uppercase text-muted-foreground">
          (07) — Kontak
        </p>

        <h2
          id="contact-title"
          aria-label="Punya ide? Ayo bikin bareng."
          className="mt-10 font-display text-display"
        >
          {lines.map((line, i) => (
            <span
              key={line}
              aria-hidden="true"
              className="block overflow-hidden py-[0.08em] -my-[0.08em]"
            >
              <span
                className={
                  i === lines.length - 1
                    ? "contact-line block text-accent"
                    : "contact-line block"
                }
              >
                {line}
                {i === lines.length - 1 && "."}
              </span>
            </span>
          ))}
        </h2>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:items-end">
          <div className="space-y-8 lg:col-span-8">
            {/* TODO: tulis ulang dengan kata-katamu sendiri. */}
            <p className="contact-fade max-w-xl text-body-lg text-muted-foreground">
              Sedang mencari kolaborasi, punya pertanyaan, atau sekadar ingin
              menyapa? Kirim saja pesan, saya senang membaca ide baru.
            </p>

            {hasEmail ? (
              <div className="contact-fade space-y-4">
                <a
                  href={mailto}
                  className="inline-block bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 font-display text-[clamp(1.25rem,0.5rem+3.5vw,3rem)] leading-tight transition-[background-size,color] duration-500 ease-out-expo [overflow-wrap:anywhere] hover:bg-[length:100%_2px] hover:text-accent"
                >
                  {site.email}
                </a>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="outline" onClick={copyEmail}>
                    {status === "ok" ? "Tersalin ✓" : "Salin email"}
                  </Button>
                  <p
                    role="status"
                    aria-live="polite"
                    className="font-mono text-label uppercase text-muted-foreground"
                  >
                    {status === "ok" && "Email disalin ke clipboard"}
                    {status === "fail" && "Gagal menyalin, silakan salin manual"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="contact-fade inline-block border border-accent px-3 py-2 font-mono text-label uppercase text-accent">
                Email belum diisi. Edit email di src/data/site.ts
              </p>
            )}

            {site.socials.length > 0 && (
              <ul className="contact-fade flex flex-wrap gap-x-8 gap-y-2">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center py-2 pointer-coarse:min-h-11 font-mono text-label uppercase transition-colors hover:text-accent"
                    >
                      {s.label} ↗
                      <span className="sr-only"> (buka di tab baru)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {hasEmail && (
            <div className="contact-fade flex lg:col-span-4 lg:justify-end">
              <Magnetic strength={0.3}>
                <ButtonLink
                  href={mailto}
                  size="lg"
                  className="size-36 rounded-full px-0 text-center leading-snug md:size-44"
                >
                  Hubungi
                  <br />
                  saya ↗
                </ButtonLink>
              </Magnetic>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}