"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { Container } from "@/components/ui/Container";
import { nav, site } from "@/data/site";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./ThemeToggle";

const easeOut = [0.16, 1, 0.3, 1] as const;
const easeInOut = [0.76, 0, 0.24, 1] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { scrollY } = useScroll();

  // Sembunyi saat scroll turun, muncul saat scroll naik.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > prev && latest > 120) setHidden(true);
    else if (latest < prev) setHidden(false);
    setScrolled(latest > 24);
  });

  // Section aktif. Section belum ada sampai Phase 4+, jadi aman kalau kosong.
  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Menu mobile: kunci scroll, Escape menutup, tutup otomatis saat jadi desktop.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <>
      <motion.header
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: easeOut }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
          scrolled || open
            ? "border-border bg-background/85 backdrop-blur-md"
            : "border-transparent",
        )}
      >
        <Container className="flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label={`${site.name}, beranda`}
            className="font-display text-xl font-semibold tracking-tight"
          >
            FZ<span className="text-accent">.</span>
          </Link>

          <div className="flex items-center gap-2 lg:gap-8">
            <nav aria-label="Navigasi utama" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {nav.map((item) => {
                  const isActive = active === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "relative inline-block py-2 font-mono text-label uppercase transition-colors duration-300",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-x-0 -bottom-0.5 h-px bg-accent"
                            transition={{ duration: 0.4, ease: easeOut }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="min-h-11 px-2 font-mono text-label uppercase lg:hidden"
            >
              {open ? "Tutup" : "Menu"}
            </button>
          </div>
        </Container>
      </motion.header>

      {/* Overlay sengaja di luar <header>: header punya transform + blur,
          yang akan membuat "fixed" di dalamnya ikut ke header. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: easeInOut }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-background px-gutter pb-10 pt-28 lg:hidden"
          >
            <nav aria-label="Navigasi seluler">
              <ul>
                {nav.map((item, i) => (
                  <li key={item.id} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{
                        duration: 0.7,
                        ease: easeOut,
                        delay: 0.2 + i * 0.06,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-baseline gap-4 py-1 font-display text-h1"
                      >
                        <span className="font-mono text-label text-muted-foreground">
                          0{i + 1}
                        </span>
                        <span className="transition-colors group-hover:text-accent">
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="font-mono text-label uppercase text-muted-foreground">
              {site.role}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}