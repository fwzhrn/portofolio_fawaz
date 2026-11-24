"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/animations/Magnetic";
import { HeroScene } from "@/components/three/HeroScene";
import { site } from "@/data/site";

// Tiap huruf punya "mask" sendiri supaya naik dari balik garis.
function Chars({ text, cls }: { text: string; cls: string }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden py-[0.08em] -my-[0.08em] align-top"
        >
          <span className={`${cls} inline-block will-change-transform`}>
            {char}
          </span>
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const parallax = useRef<HTMLDivElement>(null);

  const [first, ...rest] = site.name.split(" ");
  const last = rest.join(" ");
  const initials = site.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("");

  useGSAP(
    () => {
      const section = root.current;
      const spotEl = spot.current;
      const parallaxEl = parallax.current;
      if (!section || !spotEl || !parallaxEl) return;

      const html = document.documentElement;

      // Posisi awal cahaya (juga dipakai perangkat sentuh yang tanpa kursor).
      const rect = section.getBoundingClientRect();
      gsap.set(spotEl, {
        xPercent: -50,
        yPercent: -50,
        x: rect.width * 0.72,
        y: rect.height * 0.3,
      });

      // ── Intro ────────────────────────────────────────────
      // data-intro="skip" diset script di layout (sudah pernah lihat / reduced motion)
      if (html.dataset.intro !== "skip") {
        const countEl = section.querySelector<HTMLElement>("[data-count]");
        const counter = { v: 0 };

        document.body.style.overflow = "hidden";

        gsap.set(".name-char", { yPercent: 115 });
        gsap.set(".mono-char", { yPercent: 115 });
        gsap.set(".reveal", { autoAlpha: 0, y: 24 });
        gsap.set(".mono-frame", { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(".mono-inner", { scale: 1.3 });

        const finish = () => {
          gsap.set(".preloader", { display: "none" });
          document.body.style.overflow = "";
          try {
            sessionStorage.setItem("intro-seen", "1");
          } catch {
            // storage tidak tersedia, intro akan main lagi di kunjungan berikutnya
          }
        };

        const tl = gsap.timeline({ onComplete: finish });
        tl.to(
          counter,
          {
            v: 100,
            duration: 1.1,
            ease: "power2.inOut",
            onUpdate: () => {
              if (countEl) {
                countEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
              }
            },
          },
          0,
        )
          .to(".preloader-bar", { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0)
          .to(".preloader", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, ">0.15")
          .to(".name-char", { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.04 }, "<0.35")
          .to(".mono-frame", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" }, "<0.1")
          .to(".mono-inner", { scale: 1, duration: 1.6, ease: "expo.out" }, "<")
          .to(".mono-char", { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 }, "<0.5")
          .to(".reveal", { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.1 }, "<0.3");
      }

      // ── Interaksi kursor (hanya mouse, tanpa reduced motion) ──
      const mm = gsap.matchMedia();
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const spotX = gsap.quickTo(spotEl, "x", { duration: 0.9, ease: "power3" });
          const spotY = gsap.quickTo(spotEl, "y", { duration: 0.9, ease: "power3" });
          const parX = gsap.quickTo(parallaxEl, "x", { duration: 1, ease: "power3" });
          const parY = gsap.quickTo(parallaxEl, "y", { duration: 1, ease: "power3" });

          const onMove = (e: PointerEvent) => {
            const r = section.getBoundingClientRect();
            spotX(e.clientX - r.left);
            spotY(e.clientY - r.top);
            parX((e.clientX / window.innerWidth - 0.5) * -40);
            parY((e.clientY / window.innerHeight - 0.5) * -40);
          };

          section.addEventListener("pointermove", onMove);
          return () => section.removeEventListener("pointermove", onMove);
        },
      );

      return () => {
        document.body.style.overflow = "";
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden pb-8 pt-24 md:pt-28"
    >
      {/* Preloader. aria-hidden: pembaca layar langsung mendapat konten. */}
      <div
        aria-hidden="true"
        className="preloader fixed inset-0 z-70 flex flex-col justify-between bg-background px-gutter py-8"
      >
        <p className="font-mono text-label uppercase text-muted-foreground">
          {site.name} — Portfolio
        </p>
        <div>
          <p className="font-display text-display tabular-nums">
            <span data-count>000</span>
            <span className="text-accent">%</span>
          </p>
          <div className="mt-6 h-px w-full bg-border">
            <div
              className="preloader-bar h-full origin-left bg-accent"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>

      {/* Latar: grid tipis + cahaya yang mengikuti kursor */}
      <div aria-hidden="true" className="hero-grid absolute inset-0 -z-10" />
      <div
        ref={spot}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-10 size-[60vmax] will-change-transform"
        style={{
          background: "radial-gradient(closest-side, var(--glow), transparent)",
        }}
      />
      <HeroScene />

      <Container className="flex flex-1 flex-col">
        <div className="reveal flex items-center justify-between font-mono text-label uppercase text-muted-foreground">
          <span>(01) — Portfolio</span>
          <span>{site.since}</span>
        </div>

        <div className="mt-10 grid flex-1 gap-10 md:grid-cols-12 md:gap-x-10 lg:mt-[min(3.5rem,5svh)]">
          {/* Kiri: nama di atas, aksi di bawah */}
          <div className="flex flex-col justify-between gap-8 md:col-span-7">
            <h1
              id="hero-title"
              aria-label={site.name}
              className="font-display text-display lg:text-[length:min(10.5rem,16svh)]"
            >
              <span aria-hidden="true" className="block">
                <Chars text={first} cls="name-char" />
              </span>
              <span aria-hidden="true" className="block lg:pl-[7vw]">
                <Chars text={last} cls="name-char" />
                <span className="text-accent">
                  <Chars text="." cls="name-char" />
                </span>
              </span>
            </h1>

            <div className="space-y-6">
              <p className="reveal flex items-center gap-3 font-mono text-label uppercase">
                <span aria-hidden="true" className="size-2 bg-accent" />
                {site.role}
              </p>
              <p className="reveal max-w-md text-body-lg text-muted-foreground">
                {site.intro}
              </p>
              <div className="reveal flex flex-wrap items-center gap-x-6 gap-y-2">
                <Magnetic>
                  <ButtonLink href="/#projects" size="lg">
                    Lihat proyek
                  </ButtonLink>
                </Magnetic>
                <Magnetic>
                  <ButtonLink href="/#contact" variant="outline" size="lg">
                    Hubungi saya
                  </ButtonLink>
                </Magnetic>
              </div>
            </div>
          </div>

          {/* Kanan: monogram. Dekoratif, disembunyikan dari pembaca layar. */}
          <div aria-hidden="true" className="hidden md:col-span-5 md:flex">
            <div
              className="mono-frame relative w-full flex-1 overflow-hidden border border-border bg-card/60"
              style={{ containerType: "inline-size", minHeight: "22rem" }}
            >
              <div className="mono-inner absolute inset-0">
                <div
                  ref={parallax}
                  className="absolute inset-0 flex select-none flex-col items-center justify-center font-display font-semibold tracking-normal"
                  style={{ fontSize: "56cqw", lineHeight: 1 }}
                >
                  <span className="outline-text -my-[0.1em]">{initials}.</span>
                  <span className="-my-[0.1em]">
                    <Chars text={initials} cls="mono-char" />
                    <span className="text-accent">
                      <Chars text="." cls="mono-char" />
                    </span>
                  </span>
                  <span className="outline-text -my-[0.1em]">{initials}.</span>
                </div>
              </div>

              <span className="absolute left-3 top-3 size-3 border-l border-t border-accent" />
              <span className="absolute right-3 top-3 size-3 border-r border-t border-accent" />
              <span className="absolute bottom-3 left-3 size-3 border-b border-l border-accent" />
              <span className="absolute bottom-3 right-3 size-3 border-b border-r border-accent" />

              <div className="absolute inset-x-0 top-0 flex justify-between px-8 py-3 font-mono text-label uppercase text-muted-foreground">
                <span>Monogram</span>
                <span>{site.since}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 px-8 py-3 font-mono text-label uppercase text-muted-foreground">
                {site.name}
              </div>
            </div>
          </div>
        </div>

        <div className="reveal mt-8 flex items-center gap-4 font-mono text-label uppercase text-muted-foreground">
          <span aria-hidden="true" className="relative h-10 w-px bg-border">
            <span className="scroll-line absolute inset-0 bg-accent" />
          </span>
          Scroll
        </div>
      </Container>
    </section>
  );
}